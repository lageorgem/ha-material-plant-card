import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { describeMeasurement, formatValue, gaugeFraction } from '../calc/measurements';
import type { Stats24h } from '../data/history-stats';
import type { GaugeTone, Measurement } from '../types';
import './range-bar';

const formatCaption = (value: number): string => formatValue(value, '', true);

/** Accessible tile description; the enclosing button owns the accessible name. */
export function describeWithStats(m: Measurement, stats: Stats24h | null): string {
  return describeMeasurement(m) + (stats
    ? ` · last 24 h ${formatCaption(stats.min)}–${formatCaption(stats.max)}, average ${formatCaption(stats.mean)}`
    : '');
}

/** Presentational content of a full-mode metric tile. */
export class MplMetricRow extends LitElement {
  @property({ attribute: false }) measurement!: Measurement;
  @property({ reflect: true }) tone: GaugeTone = 'unknown';
  @property({ attribute: false }) stats: Stats24h | null = null;
  @property({ type: Boolean, attribute: 'hide-units' }) hideUnits = false;

  protected render(): TemplateResult | typeof nothing {
    const m = this.measurement;
    if (!m) return nothing;
    const stats = this.stats;
    const fraction = (value: number | null): number | null =>
      gaugeFraction(value, m.min, m.max, m.unit);

    return html`
      <div class="icon"><ha-icon icon=${m.icon} aria-hidden="true"></ha-icon></div>
      <div class="label">${m.label}</div>
      <div class="value">${formatValue(m.value, m.unit, true)}${!this.hideUnits && m.unit !== ''
        ? html`<span class="unit">${m.unit}</span>` : nothing}</div>
      <div class="range">
        <mpl-range-bar
          .value=${fraction(m.value)}
          .tone=${this.tone}
          .spanFrom=${stats ? fraction(stats.min) : null}
          .spanTo=${stats ? fraction(stats.max) : null}
          .avg=${stats ? fraction(stats.mean) : null}
        ></mpl-range-bar>
        <div class="caption">
          ${m.min !== null && m.max !== null
            ? html`<span class="ideal">Ideal ${formatCaption(m.min)}–${formatCaption(m.max)}</span>`
            : nothing}
          ${stats
            ? html`<span class="history">24h ${formatCaption(stats.min)}–${formatCaption(stats.max)}</span>`
            : nothing}
        </div>
      </div>
    `;
  }

  // Like the battery glyph, inherit semantic tokens rather than masking ancestor overrides.
  static styles = css`
    :host {
      --mpl-metric-icon-size: 40px;
      --mpl-metric-glyph-size: 20px;
      --mpl-metric-column-width: 76px;
      --mpl-metric-column-gap: 12px;
      --mpl-metric-label-size: 12px;
      --mpl-metric-label-line: 16px;
      --mpl-metric-value-size: 20px;
      --mpl-metric-value-line: 24px;
      --mpl-metric-value-weight: 500;
      --mpl-metric-problem-weight: 700;
      --mpl-metric-unit-gap: 2px;
      --mpl-metric-range-gap: 2px;
      --mpl-metric-caption-size: 11px;
      --mpl-metric-caption-line: 14px;
      --mpl-metric-caption-gap: 8px;
      display: grid;
      grid-template-columns: var(--mpl-metric-icon-size) var(--mpl-metric-column-width) minmax(0, 1fr);
      grid-template-rows: var(--mpl-metric-label-line) var(--mpl-metric-value-line);
      column-gap: var(--mpl-metric-column-gap);
      align-items: center;
      min-width: 0;
    }
    .icon {
      grid-column: 1;
      grid-row: 1 / 3;
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--mpl-metric-icon-size);
      height: var(--mpl-metric-icon-size);
      border-radius: 50%;
      background: var(--mpl-surface-container-highest);
      color: var(--mpl-on-surface-variant);
    }
    :host([tone='ok']) .icon {
      background: color-mix(in srgb, var(--mpl-success) 20%, transparent);
      color: var(--mpl-success);
    }
    :host([tone='problem']) .icon {
      background: var(--mpl-error-container);
      color: var(--mpl-on-error-container);
    }
    ha-icon {
      --mdc-icon-size: var(--mpl-metric-glyph-size);
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--mpl-metric-glyph-size);
      height: var(--mpl-metric-glyph-size);
      color: inherit;
    }
    .label {
      grid-column: 2;
      grid-row: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--mpl-metric-label-size);
      line-height: var(--mpl-metric-label-line);
      color: var(--mpl-on-surface-variant);
    }
    .value {
      grid-column: 2;
      grid-row: 2;
      min-width: 0;
      white-space: nowrap;
      font-size: var(--mpl-metric-value-size);
      line-height: var(--mpl-metric-value-line);
      font-weight: var(--mpl-metric-value-weight);
      color: var(--mpl-on-surface);
    }
    :host([tone='problem']) .value {
      color: var(--mpl-error);
      font-weight: var(--mpl-metric-problem-weight);
    }
    .unit {
      font-size: var(--mpl-metric-label-size);
      margin-left: var(--mpl-metric-unit-gap);
      color: var(--mpl-on-surface-variant);
    }
    .range {
      grid-column: 3;
      grid-row: 1 / 3;
      display: flex;
      flex-direction: column;
      gap: var(--mpl-metric-range-gap);
      min-width: 0;
    }
    .caption {
      display: flex;
      justify-content: space-between;
      gap: var(--mpl-metric-caption-gap);
      font-size: var(--mpl-metric-caption-size);
      line-height: var(--mpl-metric-caption-line);
      color: var(--mpl-on-surface-variant);
      white-space: nowrap;
    }
    .caption > span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
}

if (!customElements.get('mpl-metric-row')) customElements.define('mpl-metric-row', MplMetricRow);

declare global {
  interface HTMLElementTagNameMap {
    'mpl-metric-row': MplMetricRow;
  }
}
