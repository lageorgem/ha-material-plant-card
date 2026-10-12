import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { GaugeTone } from '../types';

/** Decorative, caller-mapped current and 24-hour range indicator. */
export class MplRangeBar extends LitElement {
  @property({ type: Number }) value: number | null = null;
  @property({ reflect: true }) tone: GaugeTone = 'unknown';
  @property({ type: Number }) spanFrom: number | null = null;
  @property({ type: Number }) spanTo: number | null = null;
  @property({ type: Number }) avg: number | null = null;

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

    return html`
      <div class="zone zone-low"></div>
      <div class="zone zone-ok"></div>
      <div class="zone zone-high"></div>
      ${known && from !== null && to !== null ? html`
        <div class="span" style=${`left: calc(${midpoint}% - max(${spanWidth}%, 8px) / 2); width: max(${spanWidth}%, 8px);`}></div>
      ` : nothing}
      ${known && this.avg !== null ? html`
        <div class="avg" style=${`left: calc(${this.avg * 100}% - 3px);`}></div>
      ` : nothing}
      ${known && this.value !== null ? html`
        <div class="dot" style=${`left: clamp(0px, calc(${this.value * 100}% - 6px), calc(100% - 12px));`}></div>
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
      height: 16px;
      width: 100%;
    }
    :host([tone='problem']) {
      --mpl-range-bar-tone: var(--mpl-error);
    }
    :host([tone='advisory']) {
      --mpl-range-bar-tone: var(--mpl-on-surface-variant);
    }
    .zone,
    .span,
    .avg,
    .dot {
      position: absolute;
    }
    .zone-low,
    .zone-high {
      top: 7px;
      width: calc(20% - 3px);
      height: 2px;
      background: var(--mpl-outline-variant);
      border-radius: 1px;
    }
    .zone-low {
      left: 0;
    }
    .zone-ok {
      top: 5px;
      left: calc(20% + 3px);
      width: calc(60% - 6px);
      height: 6px;
      background: var(--mpl-secondary-container);
      border-radius: 3px;
    }
    .zone-high {
      left: calc(80% + 3px);
    }
    .span {
      top: 4px;
      height: 8px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--mpl-range-bar-tone) 35%, transparent);
    }
    .avg {
      top: 13px;
      width: 6px;
      height: 4px;
      background: var(--mpl-on-surface-variant);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }
    .dot {
      top: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--mpl-range-bar-tone);
      box-shadow: 0 0 0 2px var(--mpl-range-bar-ring, var(--mpl-surface-container-high));
    }
    .dot,
    .span,
    .avg {
      transition: left 500ms var(--md-sys-motion-expressive-spatial-default, cubic-bezier(0.38, 1.21, 0.22, 1));
    }
    @media (prefers-reduced-motion: reduce) {
      .dot,
      .span,
      .avg {
        transition: none;
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
