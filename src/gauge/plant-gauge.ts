import { LitElement, html, svg, css, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import type { GaugeTone } from '../types';
import { themeTokens } from '../theme';

const CX = 24;
const CY = 24;
const RADIUS = 20;
const STROKE = 4;
const START = 135;
const SWEEP = 270;
/** Vertical centre of the circle, in the 48-unit viewBox. */
export const ICON_CENTER_Y = CY;
const HALF_GAP = 4;
const ENTRY_DURATION = 700;
const ZONES = [
  { name: 'low', start: START, end: START + SWEEP * 0.2 - HALF_GAP },
  { name: 'ok', start: START + SWEEP * 0.2 + HALF_GAP, end: START + SWEEP * 0.8 - HALF_GAP },
  { name: 'high', start: START + SWEEP * 0.8 + HALF_GAP, end: START + SWEEP },
] as const;

function pointAt(cx: number, cy: number, r: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return { x: cx + r * Math.cos(radians), y: cy + r * Math.sin(radians) };
}

/** SVG arc with angles measured clockwise from the positive x axis. */
export function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = pointAt(cx, cy, r, startDeg);
  const end = pointAt(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Props-driven low / just-right / high measurement indicator. */
export class MplGauge extends LitElement {
  @property({ type: Number }) fraction: number | null = null;
  @property({ reflect: true }) tone: GaugeTone = 'unknown';
  @property() icon = '';
  @property() value = '';
  @property() label = '';
  @property({ type: Boolean, attribute: 'embedded' }) embedded = false;

  private dataEpoch = 0;
  private hadIndicator = false;
  private entrySegments: { duration: number; delay: number }[] = [];
  private sweepDuration = 0;

  protected willUpdate(): void {
    const showIndicator = this.fraction !== null && this.tone !== 'unknown';
    if (showIndicator && !this.hadIndicator) {
      this.dataEpoch++;
      const end = START + SWEEP * this.fraction!;
      const lengths = ZONES.map(zone => Math.max(0, Math.min(zone.end, end) - zone.start));
      const total = lengths.reduce((sum, length) => sum + length, 0);
      let delay = 0;
      this.entrySegments = lengths.map(length => {
        const duration = total > 0 ? ENTRY_DURATION * length / total : 0;
        const segment = { duration, delay };
        delay += duration;
        return segment;
      });
      this.sweepDuration = delay;
    }
    this.hadIndicator = showIndicator;
  }

  protected render(): TemplateResult {
    const fraction = this.fraction;
    const showIndicator = fraction !== null && this.tone !== 'unknown';
    const end = START + SWEEP * (fraction ?? 0);
    const dot = pointAt(CX, CY, RADIUS, end);

    return html`
      <div
        class="gauge"
        role=${this.embedded ? nothing : 'meter'}
        aria-label=${this.embedded ? nothing : this.label}
        aria-valuemin=${this.embedded ? nothing : '0'}
        aria-valuemax=${this.embedded ? nothing : '100'}
        aria-valuenow=${this.embedded || fraction === null ? nothing : Math.round(fraction * 100)}
        aria-valuetext=${this.embedded ? nothing : this.label}
      >
        <div class="dial">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            ${svg`
              ${ZONES.map(zone => svg`
                <path class=${`track-${zone.name}`} d=${arcPath(CX, CY, RADIUS, zone.start, zone.end)}></path>
              `)}
              ${showIndicator ? keyed(this.dataEpoch, svg`
              ${ZONES.map((zone, index) => {
                if (end <= zone.start) return nothing;
                const activePath = arcPath(CX, CY, RADIUS, zone.start, Math.min(zone.end, end));
                const entry = this.entrySegments[index];
                return svg`
                  <path class=${`active active-${zone.name}${entry.duration > 0 ? ' entering' : ''}`}
                    pathLength="1" d=${activePath}
                    style=${`d: path('${activePath}'); --mpl-gauge-entry-duration: ${entry.duration}ms; --mpl-gauge-entry-delay: ${entry.delay}ms;`}></path>
                `;
              })}
                <circle class="dot" cx=${dot.x} cy=${dot.y} r="3.5"
                  style=${`cx: ${dot.x}px; cy: ${dot.y}px; --mpl-gauge-entry-delay: ${this.sweepDuration}ms;`}></circle>
              `) : nothing}
            `}
          </svg>
          <ha-icon icon=${this.icon} aria-hidden="true"></ha-icon>
        </div>
        ${keyed(this.dataEpoch, this.value !== '' ? html`<div class="value">${this.value}</div>` : nothing)}
      </div>
    `;
  }

  static styles = [
    themeTokens,
    css`
      :host {
        --mpl-gauge-icon-size: calc(var(--mpl-gauge-size, 44px) * 18 / 44);
        --mpl-gauge-value-size: clamp(11px, calc(var(--mpl-gauge-size, 44px) * 12 / 44), 16px);
        --mpl-gauge-value-line: calc(var(--mpl-gauge-value-size) * 4 / 3);
        --mpl-gauge-entry-easing: cubic-bezier(0.2, 0, 0, 1);
        --mpl-gauge-pop-duration: 250ms;
        --mpl-gauge-fade-duration: 300ms;
        --mpl-gauge-track-width: ${STROKE};
        --mpl-gauge-outer-track-width: 2;
        --mpl-gauge-dot-stroke: 2;
        --mpl-gauge-tone: var(--mpl-success);
        --mpl-gauge-motion: var(
          --md-sys-motion-expressive-spatial-default,
          500ms cubic-bezier(0.38, 1.21, 0.22, 1)
        );
        display: inline-grid;
        justify-items: center;
        min-width: 0;
        max-width: 100%;
      }
      :host([tone='advisory']) {
        --mpl-gauge-tone: var(--mpl-on-surface-variant);
      }
      :host([tone='problem']) {
        --mpl-gauge-tone: var(--mpl-error);
      }
      .gauge {
        display: grid;
        justify-items: center;
        min-width: 0;
        max-width: 100%;
      }
      .dial {
        position: relative;
        display: grid;
        place-items: center;
        width: var(--mpl-gauge-size, 44px);
        height: var(--mpl-gauge-size, 44px);
      }
      svg,
      ha-icon {
        grid-area: 1 / 1;
      }
      svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      path {
        fill: none;
        stroke-width: var(--mpl-gauge-track-width);
        stroke-linecap: round;
      }
      .track-low,
      .track-high,
      .active-low,
      .active-high {
        stroke-width: var(--mpl-gauge-outer-track-width);
      }
      .track-low,
      .track-high {
        stroke: var(--mpl-outline-variant);
      }
      .track-ok {
        stroke: var(--mpl-secondary-container);
      }
      .active {
        stroke: var(--mpl-gauge-tone);
        transition: d var(--mpl-gauge-motion), stroke var(--mpl-gauge-motion);
      }
      .dot {
        fill: var(--mpl-gauge-tone);
        stroke: var(--mpl-surface-bg);
        stroke-width: var(--mpl-gauge-dot-stroke);
        transition: cx var(--mpl-gauge-motion), cy var(--mpl-gauge-motion),
          fill var(--mpl-gauge-motion);
        transform-box: fill-box;
        transform-origin: center;
        animation: mpl-gauge-pop var(--mpl-gauge-pop-duration) var(--mpl-gauge-entry-easing)
          var(--mpl-gauge-entry-delay) backwards;
      }
      .active.entering {
        stroke-dasharray: 1;
        animation: mpl-gauge-sweep var(--mpl-gauge-entry-duration) var(--mpl-gauge-entry-easing)
          var(--mpl-gauge-entry-delay) backwards;
      }
      @keyframes mpl-gauge-sweep {
        from { stroke-dashoffset: 1; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes mpl-gauge-pop {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes mpl-gauge-fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      ha-icon {
        --mdc-icon-size: var(--mpl-gauge-icon-size);
        position: absolute;
        top: ${ICON_CENTER_Y / 48 * 100}%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        width: var(--mpl-gauge-icon-size);
        height: var(--mpl-gauge-icon-size);
        color: var(--mpl-on-surface-variant);
      }
      .value {
        animation: mpl-gauge-fade var(--mpl-gauge-fade-duration) var(--mpl-gauge-entry-easing);
        font-weight: 400;
        font-size: var(--mpl-gauge-value-size);
        line-height: var(--mpl-gauge-value-line);
        color: var(--mpl-on-surface);
        max-width: 100%;
        overflow-wrap: anywhere;
        text-align: center;
      }
      :host([tone='problem']) ha-icon,
      :host([tone='problem']) .value {
        color: var(--mpl-error);
      }
      :host([tone='problem']) .value {
        font-weight: 700;
      }
      @media (prefers-reduced-motion: reduce) {
        .active,
        .dot {
          transition: none;
        }
        .active.entering,
        .dot,
        .value {
          animation: none;
          stroke-dasharray: none;
        }
      }
    `,
  ];
}

if (!customElements.get('mpl-gauge')) customElements.define('mpl-gauge', MplGauge);

declare global {
  interface HTMLElementTagNameMap {
    'mpl-gauge': MplGauge;
  }
}
