import { LitElement, html, svg, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { GaugeTone } from '../types';

export interface GraphPoint { t: number; f: number | null; label: string; }
export interface GraphMarker { t: number; f: number; ok: boolean; }
export interface GraphCurrent { t: number; f: number; tone: GaugeTone; }

export const GRAPH_HEIGHT = 64;
export const ICON_BAND = 14;
export const MARKER_W = 6;
export const MARKER_H = 4;
export const MARKER_GAP = 1.5;
export const PLOT_PAD = 8;
const DOT_RADIUS = 2;
const ICON_SIZE = 12;
const yBottom = GRAPH_HEIGHT - PLOT_PAD;
const colour = (fraction: number, low: number | null, high: number | null): string =>
  (low !== null && fraction < low) || (high !== null && fraction > high)
    ? 'var(--mpl-error)' : 'var(--mpl-success)';
let nextGradientId = 0;

/** Caller-mapped fraction history; semantic theme tokens inherit from the card. */
export class MplHistoryGraph extends LitElement {
  @property({ attribute: false }) points: GraphPoint[] = [];
  @property({ type: Number }) start = 0;
  @property({ type: Number }) end = 0;
  @property({ attribute: false }) minMarker: GraphMarker | null = null;
  @property({ attribute: false }) maxMarker: GraphMarker | null = null;
  @property({ attribute: false }) current: GraphCurrent | null = null;
  @property({ attribute: false }) thresholdLow: number | null = 0.2;
  @property({ attribute: false }) thresholdHigh: number | null = 0.8;
  @property({ attribute: false }) events: { t: number; icon: string }[] = [];
  @property() summary = '';

  @state() private _width = 0;
  @state() private _hoverIndex: number | null = null;
  @state() private _mouseBubble = false;
  private _dismissed = false;
  private readonly _gradientId = `mpl-history-gradient-${++nextGradientId}`;
  private _observer?: ResizeObserver;
  private _frame?: number;
  private _hideTimer?: ReturnType<typeof setTimeout>;
  private _pressedPointer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'img');
    this.addEventListener('click', this._stop);
    this.addEventListener('contextmenu', this._contextMenu);
    this.addEventListener('pointerdown', this._pointerDown);
    this.addEventListener('pointermove', this._pointerMove);
    this.addEventListener('pointerenter', this._pointerEnter);
    this.addEventListener('pointerleave', this._pointerLeave);
    this.addEventListener('pointerup', this._pointerUp);
    this.addEventListener('pointercancel', this._release);
    // Covers release outside the host, including when pointer capture is unavailable.
    window.addEventListener('pointerup', this._release);
    window.addEventListener('pointercancel', this._release);
    this._observer = new ResizeObserver(entries => {
      const entry = entries.find(item => item.target === this);
      if (!entry || !this.isConnected) return;
      if (this._frame !== undefined) cancelAnimationFrame(this._frame);
      const width = entry.contentRect.width;
      // Never write during observer delivery. Width changes cannot alter host height.
      this._frame = requestAnimationFrame(() => {
        this._frame = undefined;
        if (this.isConnected && this._width !== width) this._width = width;
      });
    });
    this._observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = undefined;
    if (this._frame !== undefined) cancelAnimationFrame(this._frame);
    this._frame = undefined;
    this._hide();
    this._dismissed = false;
    if (this._pressedPointer !== undefined && this.hasPointerCapture(this._pressedPointer)) {
      this.releasePointerCapture(this._pressedPointer);
    }
    this._pressedPointer = undefined;
    this.removeEventListener('click', this._stop);
    this.removeEventListener('contextmenu', this._contextMenu);
    this.removeEventListener('pointerdown', this._pointerDown);
    this.removeEventListener('pointermove', this._pointerMove);
    this.removeEventListener('pointerenter', this._pointerEnter);
    this.removeEventListener('pointerleave', this._pointerLeave);
    this.removeEventListener('pointerup', this._pointerUp);
    this.removeEventListener('pointercancel', this._release);
    window.removeEventListener('pointerup', this._release);
    window.removeEventListener('pointercancel', this._release);
  }

  private _x(t: number): number {
    const duration = this.end - this.start;
    if (!(duration > 0)) return 0;
    return Math.max(0, Math.min(this._width, (t - this.start) / duration * this._width));
  }

  private _clearHideTimer(): void {
    clearTimeout(this._hideTimer);
    this._hideTimer = undefined;
  }

  private _pick(event: PointerEvent): void {
    const mouse = event.pointerType === 'mouse' || !event.pointerType;
    if (mouse && this._dismissed) return;
    const x = event.clientX - this.getBoundingClientRect().left;
    let distance = Infinity;
    let nearest: number | null = null;
    this.points.forEach((point, index) => {
      if (point.f === null) return;
      const candidate = Math.abs(this._x(point.t) - x);
      if (candidate < distance) { distance = candidate; nearest = index; }
    });
    this._hoverIndex = nearest;
    this._mouseBubble = mouse;
    if (nearest !== null) document.addEventListener('keydown', this._keyDown);
    else this._hide();
  }

  private _hide(): void {
    this._clearHideTimer();
    this._hoverIndex = null;
    document.removeEventListener('keydown', this._keyDown);
  }
  private _scheduleHide(delay: number): void {
    this._clearHideTimer();
    this._hideTimer = setTimeout(() => this._hide(), delay);
  }
  private _keyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    this._dismissed = this._mouseBubble;
    this._hide();
  };
  private _inBubble(event: PointerEvent): boolean {
    return event.composedPath().some(target => target instanceof Element && target.classList.contains('bubble'));
  }
  private _pointerEnter = (event: PointerEvent): void => {
    if ((event.pointerType === 'mouse' || !event.pointerType) && this._pressedPointer === undefined) {
      this._clearHideTimer();
      this._pick(event);
    }
  };
  private _bubbleEnter = (): void => { this._clearHideTimer(); };
  private _bubbleLeave = (): void => {
    if (this._mouseBubble) this._scheduleHide(150);
  };
  private _stop = (event: Event): void => { event.stopPropagation(); };
  private _contextMenu = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
  };
  private _pointerDown = (event: PointerEvent): void => {
    event.stopPropagation();
    if (this._inBubble(event)) return;
    this._clearHideTimer();
    this._pick(event);
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      this._pressedPointer = event.pointerId;
      // Synthetic events and already-cancelled pointers cannot acquire capture.
      if (event.isTrusted) this.setPointerCapture(event.pointerId);
    }
  };
  private _pointerMove = (event: PointerEvent): void => {
    if (this._inBubble(event)) return;
    if (event.pointerType === 'mouse' || !event.pointerType) {
      if (this._pressedPointer !== undefined) return;
      this._clearHideTimer();
      this._pick(event);
    } else if (event.pointerId === this._pressedPointer) {
      this._pick(event);
    }
  };
  private _pointerLeave = (event: PointerEvent): void => {
    if ((event.pointerType === 'mouse' || !event.pointerType) && this._pressedPointer === undefined) {
      this._dismissed = false;
      this._scheduleHide(150);
    }
  };
  private _pointerUp = (event: PointerEvent): void => {
    event.stopPropagation();
    this._release(event);
  };
  private _release = (event: PointerEvent): void => {
    if (this._pressedPointer === undefined || event.pointerId !== this._pressedPointer) return;
    if (this.hasPointerCapture(event.pointerId)) this.releasePointerCapture(event.pointerId);
    this._pressedPointer = undefined;
    this._scheduleHide(2000);
  };

  private _hoverPoint(): GraphPoint | undefined {
    const point = this._hoverIndex === null ? undefined : this.points[this._hoverIndex];
    return point?.f !== null ? point : undefined;
  }

  protected updated(): void {
    this.setAttribute('aria-label', this.summary);
    const point = this._hoverPoint();
    if (!point) document.removeEventListener('keydown', this._keyDown);
    const bubble = this.shadowRoot?.querySelector<HTMLElement>('.bubble');
    if (!point || !bubble) return;
    const width = bubble.getBoundingClientRect().width;
    const left = Math.max(0, Math.min(this._width - width, this._x(point.t) - width / 2));
    bubble.style.left = `${left}px`;
  }

  private _marker(marker: GraphMarker | null, kind: 'min' | 'max', y: (fraction: number) => number): TemplateResult | typeof nothing {
    if (!marker) return nothing;
    const x = this._x(marker.t);
    // Only the triangle is clamped horizontally; its dot remains on the series point.
    const triangleX = Math.max(MARKER_W / 2, Math.min(this._width - MARKER_W / 2, x));
    const direction = kind === 'min' ? 1 : -1;
    const tip = y(marker.f) + direction * (MARKER_GAP + DOT_RADIUS);
    const base = tip + direction * MARKER_H;
    const fill = marker.ok ? 'var(--mpl-success)' : 'var(--mpl-error)';
    return svg`<polygon class=${`${kind}-marker`} points=${`${triangleX},${tip} ${triangleX - MARKER_W / 2},${base} ${triangleX + MARKER_W / 2},${base}`}
      fill=${fill}></polygon>
      <circle class=${`${kind}-dot`} cx=${x} cy=${y(marker.f)} r=${DOT_RADIUS} fill=${fill}></circle>`;
  }

  protected render(): TemplateResult {
    const events = this.events.filter(event => event.t >= this.start && event.t <= this.end);
    const band = events.length > 0 ? ICON_BAND : 0;
    const yTop = band + PLOT_PAD;
    const y = (fraction: number): number => yBottom - fraction * (yBottom - yTop);
    let path = '';
    let connected = false;
    const isolated: GraphPoint[] = [];
    this.points.forEach((point, index) => {
      if (point.f === null) { connected = false; return; }
      path += `${connected ? 'L' : 'M'}${this._x(point.t)},${y(point.f)} `;
      connected = true;
      if ((index === 0 || this.points[index - 1].f === null) &&
          (index === this.points.length - 1 || this.points[index + 1].f === null)) isolated.push(point);
    });
    const gradient = `url(#${this._gradientId})`;
    const low = this.thresholdLow;
    const high = this.thresholdHigh;
    const hover = this._hoverPoint();
    const current = this.current;
    const currentColour = current?.tone === 'problem' ? 'var(--mpl-error)'
      : current?.tone === 'advisory' ? 'var(--mpl-on-surface-variant)' : 'var(--mpl-success)';

    return html`
      <svg width=${this._width} height=${GRAPH_HEIGHT} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id=${this._gradientId} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2=${GRAPH_HEIGHT}>
            <stop offset="0" stop-color=${high === null ? 'var(--mpl-success)' : 'var(--mpl-error)'}></stop>
            ${high !== null ? svg`
              <stop offset=${y(high) / GRAPH_HEIGHT} stop-color="var(--mpl-error)"></stop>
              <stop offset=${y(high) / GRAPH_HEIGHT} stop-color="var(--mpl-success)"></stop>` : nothing}
            ${low !== null ? svg`
              <stop offset=${y(low) / GRAPH_HEIGHT} stop-color="var(--mpl-success)"></stop>
              <stop offset=${y(low) / GRAPH_HEIGHT} stop-color="var(--mpl-error)"></stop>` : nothing}
            <stop offset="1" stop-color=${low === null ? 'var(--mpl-success)' : 'var(--mpl-error)'}></stop>
          </linearGradient>
        </defs>
        ${[high, low].filter(f => f !== null).map(f => svg`<line class="threshold-guide" x1="0" x2=${this._width}
          y1=${y(f)} y2=${y(f)} stroke="var(--mpl-outline)" opacity="1" stroke-width="1" stroke-dasharray="3 3"></line>`)}
        ${events.map(event => svg`<line class="event-line" x1=${this._x(event.t)} x2=${this._x(event.t)}
          y1=${band} y2=${GRAPH_HEIGHT} stroke="var(--mpl-outline)" stroke-width="1" stroke-dasharray="3 3" opacity="1"></line>`)}
        <path class="history-line" d=${path.trim()} fill="none" stroke=${gradient} stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"></path>
        ${isolated.map(point => svg`<circle class="isolated-point" cx=${this._x(point.t)} cy=${y(point.f!)}
          r="1.5" fill=${gradient}></circle>`)}
        ${this._marker(this.maxMarker, 'max', y)}
        ${this._marker(this.minMarker, 'min', y)}
        ${current && current.tone !== 'unknown' ? svg`<circle class="current-ring"
          cx=${this._x(current.t)} cy=${y(current.f)} r="3.5"
          fill="var(--mpl-range-bar-ring, var(--mpl-surface-container-high))"
          stroke=${currentColour} stroke-width="2"></circle>` : nothing}
        ${hover ? svg`
          <line class="hover-guide" x1=${this._x(hover.t)} x2=${this._x(hover.t)} y1=${ICON_BAND} y2=${GRAPH_HEIGHT}
            stroke="var(--mpl-on-surface-variant)" stroke-width="1" opacity="0.4"></line>
          <circle class="hover-dot" cx=${this._x(hover.t)} cy=${y(hover.f!)} r="3" fill=${colour(hover.f!, low, high)}></circle>
        ` : nothing}
      </svg>
      ${events.map(event => html`<ha-icon class="event-icon" icon=${event.icon} aria-hidden="true"
        style=${`left: ${Math.max(0, Math.min(this._width - ICON_SIZE, this._x(event.t) - ICON_SIZE / 2))}px`}></ha-icon>`)}
      ${hover ? html`<div class=${this._mouseBubble ? 'bubble mouse-bubble' : 'bubble'} aria-hidden="true"
        @pointerenter=${this._bubbleEnter} @pointerleave=${this._bubbleLeave}>${hover.label}</div>` : nothing}
    `;
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
      height: ${GRAPH_HEIGHT}px;
      width: 100%;
      touch-action: pan-y;
      cursor: crosshair;
    }
    svg { display: block; overflow: visible; }
    .event-icon {
      position: absolute;
      top: 1px;
      display: block;
      width: ${ICON_SIZE}px;
      height: ${ICON_SIZE}px;
      --mdc-icon-size: ${ICON_SIZE}px;
      color: var(--mpl-on-surface-variant);
      pointer-events: none;
    }
    .bubble.mouse-bubble { pointer-events: auto; }
    .bubble {
      position: absolute;
      bottom: calc(100% + 4px);
      background: var(--mpl-inverse-surface);
      color: var(--mpl-inverse-on-surface);
      font-size: 11px;
      line-height: 16px;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-sizing: border-box;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      z-index: 1;
    }
  `;
}

if (!customElements.get('mpl-history-graph')) customElements.define('mpl-history-graph', MplHistoryGraph);

declare global {
  interface HTMLElementTagNameMap { 'mpl-history-graph': MplHistoryGraph; }
}
