import { LitElement, html, svg, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { GaugeTone } from '../types';

export interface GraphPoint { t: number; f: number | null; label: string; }
export interface GraphMarker { t: number; f: number; ok: boolean; }
export interface GraphCurrent { t: number; f: number; tone: GaugeTone; }

const HEIGHT = 48;
const y = (fraction: number): number => HEIGHT - 4 - fraction * (HEIGHT - 8);
const colour = (fraction: number): string =>
  fraction < 0.2 || fraction > 0.8 ? 'var(--mpl-error)' : 'var(--mpl-success)';
let nextGradientId = 0;

/** Caller-mapped fraction history; semantic theme tokens inherit from the card. */
export class MplHistoryGraph extends LitElement {
  @property({ attribute: false }) points: GraphPoint[] = [];
  @property({ type: Number }) start = 0;
  @property({ type: Number }) end = 0;
  @property({ attribute: false }) minMarker: GraphMarker | null = null;
  @property({ attribute: false }) maxMarker: GraphMarker | null = null;
  @property({ attribute: false }) current: GraphCurrent | null = null;
  @property() summary = '';

  @state() private _width = 0;
  @state() private _hoverIndex: number | null = null;
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
    this._clearHideTimer();
    this._hoverIndex = null;
    if (this._pressedPointer !== undefined && this.hasPointerCapture(this._pressedPointer)) {
      this.releasePointerCapture(this._pressedPointer);
    }
    this._pressedPointer = undefined;
    this.removeEventListener('click', this._stop);
    this.removeEventListener('contextmenu', this._contextMenu);
    this.removeEventListener('pointerdown', this._pointerDown);
    this.removeEventListener('pointermove', this._pointerMove);
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
    const x = event.clientX - this.getBoundingClientRect().left;
    let distance = Infinity;
    let nearest: number | null = null;
    this.points.forEach((point, index) => {
      if (point.f === null) return;
      const candidate = Math.abs(this._x(point.t) - x);
      if (candidate < distance) { distance = candidate; nearest = index; }
    });
    this._hoverIndex = nearest;
  }

  private _stop = (event: Event): void => { event.stopPropagation(); };
  private _contextMenu = (event: Event): void => {
    event.stopPropagation();
    event.preventDefault();
  };
  private _pointerDown = (event: PointerEvent): void => {
    event.stopPropagation();
    this._clearHideTimer();
    this._pick(event);
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      this._pressedPointer = event.pointerId;
      // Synthetic events and already-cancelled pointers cannot acquire capture.
      if (event.isTrusted) this.setPointerCapture(event.pointerId);
    }
  };
  private _pointerMove = (event: PointerEvent): void => {
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
      this._hoverIndex = null;
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
    this._clearHideTimer();
    this._hideTimer = setTimeout(() => {
      this._hideTimer = undefined;
      this._hoverIndex = null;
    }, 2000);
  };

  private _hoverPoint(): GraphPoint | undefined {
    const point = this._hoverIndex === null ? undefined : this.points[this._hoverIndex];
    return point?.f !== null ? point : undefined;
  }

  protected updated(): void {
    this.setAttribute('aria-label', this.summary);
    const point = this._hoverPoint();
    const bubble = this.shadowRoot?.querySelector<HTMLElement>('.bubble');
    if (!point || !bubble) return;
    const width = bubble.getBoundingClientRect().width;
    const left = Math.max(0, Math.min(this._width - width, this._x(point.t) - width / 2));
    bubble.style.left = `${left}px`;
  }

  private _marker(marker: GraphMarker | null, kind: 'min' | 'max'): TemplateResult | typeof nothing {
    if (!marker) return nothing;
    const x = this._x(marker.t);
    const direction = kind === 'min' ? 1 : -1;
    const tip = y(marker.f) + direction * 3;
    const base = tip + direction * 6;
    return svg`<polygon class=${`${kind}-marker`} points=${`${x},${tip} ${x - 4},${base} ${x + 4},${base}`}
      fill=${marker.ok ? 'var(--mpl-success)' : 'var(--mpl-error)'}></polygon>`;
  }

  protected render(): TemplateResult {
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
    const hover = this._hoverPoint();
    const current = this.current;
    const currentColour = current?.tone === 'problem' ? 'var(--mpl-error)'
      : current?.tone === 'advisory' ? 'var(--mpl-on-surface-variant)' : 'var(--mpl-success)';

    return html`
      <svg width=${this._width} height=${HEIGHT} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id=${this._gradientId} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2=${HEIGHT}>
            <stop offset="0" stop-color="var(--mpl-error)"></stop>
            <stop offset=${y(0.8) / HEIGHT} stop-color="var(--mpl-error)"></stop>
            <stop offset=${y(0.8) / HEIGHT} stop-color="var(--mpl-success)"></stop>
            <stop offset=${y(0.2) / HEIGHT} stop-color="var(--mpl-success)"></stop>
            <stop offset=${y(0.2) / HEIGHT} stop-color="var(--mpl-error)"></stop>
            <stop offset="1" stop-color="var(--mpl-error)"></stop>
          </linearGradient>
        </defs>
        ${[0.8, 0.2].map(f => svg`<line class="threshold-guide" x1="0" x2=${this._width}
          y1=${y(f)} y2=${y(f)} stroke="var(--mpl-outline-variant)" stroke-width="1" stroke-dasharray="3 3"></line>`)}
        <path class="history-line" d=${path.trim()} fill="none" stroke=${gradient} stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"></path>
        ${isolated.map(point => svg`<circle class="isolated-point" cx=${this._x(point.t)} cy=${y(point.f!)}
          r="1.5" fill=${gradient}></circle>`)}
        ${this._marker(this.maxMarker, 'max')}
        ${this._marker(this.minMarker, 'min')}
        ${current && current.tone !== 'unknown' ? svg`<circle class="current-ring"
          cx=${this._x(current.t)} cy=${y(current.f)} r="4"
          fill="var(--mpl-range-bar-ring, var(--mpl-surface-container-high))"
          stroke=${currentColour} stroke-width="2"></circle>` : nothing}
        ${hover ? svg`
          <line class="hover-guide" x1=${this._x(hover.t)} x2=${this._x(hover.t)} y1="0" y2=${HEIGHT}
            stroke="var(--mpl-on-surface-variant)" stroke-width="1" opacity="0.4"></line>
          <circle class="hover-dot" cx=${this._x(hover.t)} cy=${y(hover.f!)} r="3" fill=${colour(hover.f!)}></circle>
        ` : nothing}
      </svg>
      ${hover ? html`<div class="bubble" aria-hidden="true">${hover.label}</div>` : nothing}
    `;
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
      height: 48px;
      width: 100%;
      touch-action: pan-y;
      cursor: crosshair;
    }
    svg { display: block; overflow: visible; }
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
