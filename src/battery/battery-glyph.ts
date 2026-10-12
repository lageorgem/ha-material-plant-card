import { LitElement, html, svg, css, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

let nextBatteryId = 0;

/** WCAG contrast ratio for two opaque six-digit sRGB hex colors. */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminance = (hex: string): number => {
    if (!/^#[\da-f]{6}$/i.test(hex)) throw new TypeError('Expected a six-digit hex color');
    const channels = [1, 3, 5].map(offset => {
      const srgb = parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(hexA);
  const b = luminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Decorative battery glyph; the enclosing control owns its accessible name. */
export class MplBattery extends LitElement {
  @property({ type: Number }) level: number | null = null;
  @property({ reflect: true }) tone: 'ok' | 'low' | 'unknown' = 'unknown';

  private readonly clipId = `mpl-battery-${++nextBatteryId}`;

  protected render(): TemplateResult {
    const level = this.level === null || Number.isNaN(this.level)
      ? null
      : Math.round(Math.min(100, Math.max(0, this.level)));
    const fillWidth = 26 * (level ?? 0) / 100;
    const bodyId = `${this.clipId}-body`;
    const filledId = `${this.clipId}-filled`;
    const unfilledId = `${this.clipId}-unfilled`;

    return html`
      <svg viewBox="0 0 30 15" aria-hidden="true" focusable="false">
        ${svg`
          <defs>
            <clipPath id=${bodyId} clipPathUnits="userSpaceOnUse">
              <rect x="0.5" y="0.5" width="26" height="14" rx="4"></rect>
            </clipPath>
            <clipPath id=${filledId} clipPathUnits="userSpaceOnUse">
              <rect x="0.5" y="0.5" width=${fillWidth} height="14"></rect>
            </clipPath>
            <clipPath id=${unfilledId} clipPathUnits="userSpaceOnUse">
              <rect x=${0.5 + fillWidth} y="0.5" width=${26 - fillWidth} height="14"></rect>
            </clipPath>
          </defs>
          <rect class="track" x="0.5" y="0.5" width="26" height="14" rx="4"
            fill="currentColor"></rect>
          <rect class="nub" x="27.5" y="4.5" width="2" height="6" rx="1"
            fill="currentColor" opacity=${level === 100 ? '1' : 'var(--mpl-battery-track-opacity)'}></rect>
          ${level !== null && level > 0 ? svg`
            <rect class="level-fill" x="0.5" y="0.5" width=${fillWidth} height="14"
              fill="currentColor" clip-path=${`url(#${bodyId})`}></rect>
          ` : nothing}
          ${level === null ? svg`
            <text x="13.5" y="7.5" text-anchor="middle" dominant-baseline="central"
              fill="currentColor">?</text>
          ` : svg`
            <text class="number-filled" x="13.5" y="7.5" text-anchor="middle"
              dominant-baseline="central" clip-path=${`url(#${filledId})`}>${level}</text>
            <text x="13.5" y="7.5" text-anchor="middle" dominant-baseline="central"
              fill="currentColor" clip-path=${`url(#${unfilledId})`}>${level}</text>
          `}
        `}
      </svg>
    `;
  }

  // Inherit semantic tokens from the card; local theme defaults would mask wrapper overrides.
  static styles = css`
    :host {
      --mpl-battery-width: 30px;
      --mpl-battery-height: 15px;
      --mpl-battery-number-size: 10px;
      --mpl-battery-number-weight: 700;
      --mpl-battery-track-opacity: 0.3;
      display: inline-block;
      width: var(--mpl-battery-width);
      height: var(--mpl-battery-height);
      color: var(--mpl-outline);
    }
    :host([tone='ok']) {
      color: var(--mpl-on-surface-variant);
    }
    :host([tone='low']) {
      color: var(--mpl-error);
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    text {
      font-family: inherit;
      font-size: var(--mpl-battery-number-size);
      font-weight: var(--mpl-battery-number-weight);
      font-variant-numeric: tabular-nums;
    }
    .number-filled {
      fill: var(--mpl-surface-bg);
    }
    .track {
      opacity: var(--mpl-battery-track-opacity);
    }
  `;
}

if (!customElements.get('mpl-battery')) customElements.define('mpl-battery', MplBattery);

declare global {
  interface HTMLElementTagNameMap {
    'mpl-battery': MplBattery;
  }
}
