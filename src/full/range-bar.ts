import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { GaugeTone } from '../types';

/** Hard-stop ideal-band colours in caller-mapped fraction space. */
export function spanGradient(lo: number, hi: number): string {
  const success = 'var(--mpl-success)';
  const error = 'var(--mpl-error)';
  const colourAt = (point: number): string => point < 0.2 || point > 0.8 ? error : success;
  if (lo === hi) return colourAt(lo);
  if (lo >= 0.2 && hi <= 0.8) return success;
  if (hi <= 0.2 || lo >= 0.8) return error;

  const boundaries = [lo, ...[0.2, 0.8].filter(point => point > lo && point < hi), hi];
  const percent = (point: number): number => Number(((point - lo) / (hi - lo) * 100).toFixed(10));
  const stops = boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    return `${colourAt((start + end) / 2)} ${percent(start)}% ${percent(end)}%`;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/** Decorative, caller-mapped current and 24-hour range indicator. */
export class MplRangeBar extends LitElement {
  @property({ type: Number }) value: number | null = null;
  @property({ reflect: true }) tone: GaugeTone = 'unknown';
  @property({ type: Number }) spanFrom: number | null = null;
  @property({ type: Number }) spanTo: number | null = null;
  @property({ type: Number }) avg: number | null = null;
  @property({ type: Boolean }) avgOk: boolean | null = null;
  @property({ type: Boolean }) showTicks = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  protected render(): TemplateResult {
    const known = this.tone !== 'unknown';
    const from = this.spanFrom;
    const to = this.spanTo;
    const spanWidth = from !== null && to !== null ? Math.abs(to - from) * 100 : 0;
    const midpoint = from !== null && to !== null ? (from + to) / 2 * 100 : 0;
    const avgColour = this.avgOk === null ? 'var(--mpl-on-surface-variant)'
      : this.avgOk ? 'var(--mpl-success)' : 'var(--mpl-error)';

    return html`
      <div class="track"></div>
      ${this.showTicks ? html`
        <div class="tick tick-low"></div>
        <div class="tick tick-high"></div>
      ` : nothing}
      ${known && from !== null && to !== null ? html`
        <div class="span" style=${`left: calc(${midpoint}% - max(${spanWidth}%, 8px) / 2); width: max(${spanWidth}%, 8px); background: ${spanGradient(Math.min(from, to), Math.max(from, to))};`}></div>
      ` : nothing}
      ${known && this.avg !== null ? html`
        <div class="avg" style=${`left: clamp(0px, calc(${this.avg * 100}% - 5px), calc(100% - 10px)); background: ${avgColour};`}></div>
      ` : nothing}
      ${known && this.value !== null ? html`
        <div class="dot" style=${`left: clamp(0px, calc(${this.value * 100}% - 7px), calc(100% - 14px));`}></div>
      ` : nothing}
    `;
  }

  // Like the battery glyph, inherit themeTokens from the card rather than
  // redeclaring semantic colours here and masking ancestor overrides.
  static styles = css`
    :host {
      --mpl-range-bar-tone: var(--mpl-success);
      display: block;
      position: relative;
      height: 28px;
      width: 100%;
    }
    :host([tone='problem']) {
      --mpl-range-bar-tone: var(--mpl-error);
    }
    :host([tone='advisory']) {
      --mpl-range-bar-tone: var(--mpl-on-surface-variant);
    }
    .track,
    .tick,
    .span,
    .avg,
    .dot {
      position: absolute;
    }
    .track {
      left: 0;
      right: 0;
      top: 10px;
      height: 4px;
      border-radius: 2px;
      background: var(--mpl-surface-container-highest);
    }
    .tick {
      top: 5px;
      width: 2px;
      height: 14px;
      border-radius: 1px;
      background: var(--mpl-outline);
    }
    .tick-low {
      left: calc(20% - 1px);
    }
    .tick-high {
      left: calc(80% - 1px);
    }
    .span {
      top: 8px;
      height: 8px;
      border-radius: 4px;
      transform-origin: center;
      animation: mpl-span-in 600ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) both;
    }
    .avg {
      top: 20px;
      width: 10px;
      height: 6px;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      animation: mpl-avg-in 350ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) 350ms both;
    }
    .dot {
      top: 5px;
      width: 14px;
      height: 14px;
      box-sizing: border-box;
      border-radius: 50%;
      background: var(--mpl-range-bar-ring, var(--mpl-surface-container-high));
      border: 3px solid var(--mpl-range-bar-tone);
      animation: mpl-dot-in 450ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)) 200ms both;
    }
    .dot,
    .span,
    .avg {
      transition:
        left 500ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1)),
        width 500ms var(--mpl-ease-spatial, cubic-bezier(0.38, 1.21, 0.22, 1));
    }
    @keyframes mpl-span-in {
      from { transform: scaleX(0); opacity: 0; }
      to { transform: scaleX(1); opacity: 1; }
    }
    @keyframes mpl-dot-in {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    @keyframes mpl-avg-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .dot,
      .span,
      .avg {
        transition: none;
        animation: none;
      }
    }
  `;
}

if (!customElements.get('mpl-range-bar')) customElements.define('mpl-range-bar', MplRangeBar);

declare global {
  interface HTMLElementTagNameMap {
    'mpl-range-bar': MplRangeBar;
  }
}
