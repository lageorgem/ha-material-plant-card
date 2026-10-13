import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { describeMeasurement, formatValue, gaugeFraction, gaugeStatus } from '../calc/measurements';
import type { MetricHistory, Stats24h } from '../data/history-stats';
import type { FullDisplay, GaugeTone, Measurement } from '../types';
import './range-bar';
import './history-graph';

const formatCaption = (value: number): string => formatValue(value, '', true);
const displayUnits: Readonly<Record<string, string>> = {
  'mol/d⋅m²': 'mol/d',
  'mol/d·m²': 'mol/d',
  'mol/(d⋅m²)': 'mol/d',
};

/** Compact visual captions; accessible descriptions retain formatValue precision. */
export function formatCaptionNumber(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude >= 1000) return formatValue(value, '', true);
  const digits = magnitude >= 10 ? 0 : magnitude >= 0.1 ? 1 : 2;
  // Match measurements' decimal-safe rounding, including negative ties.
  const [coefficient, exponent = '0'] = String(magnitude).split('e');
  const shifted = Number(`${coefficient}e${Number(exponent) + digits}`);
  return String(Math.sign(value) * Math.round(shifted) / 10 ** digits);
}

/** Accessible tile description; the enclosing button owns the accessible name. */
export function describeWithStats(m: Measurement, stats: Stats24h | null, period = 'last 24 h'): string {
  return describeMeasurement(m) + (stats
    ? ` · ${period} ${formatCaption(stats.min)}–${formatCaption(stats.max)}, average ${formatCaption(stats.mean)}`
    : '');
}

/** Presentational content of a full-mode metric tile. */
export class MplMetricRow extends LitElement {
  @property({ attribute: false }) measurement!: Measurement;
  @property({ reflect: true }) tone: GaugeTone = 'unknown';
  @property({ attribute: false }) history: MetricHistory | null = null;
  @property() display: FullDisplay = 'summary';
  @property({ type: Boolean }) daily = false;
  @property() periodText = 'last 24 h';
  @property() locale?: string;
  @property({ type: Boolean, attribute: 'hide-units' }) hideUnits = false;
  @property({ type: Boolean, attribute: 'show-history' }) showHistory = true;
  @property({ type: String, attribute: 'period-label' }) periodLabel = 'Last 24 h';

  protected render(): TemplateResult | typeof nothing {
    const m = this.measurement;
    if (!m) return nothing;
    const stats = this.history?.stats ?? null;
    const fraction = (value: number | null): number | null =>
      gaugeFraction(value, m.min, m.max, m.unit);
    const avgStatus = gaugeStatus(stats?.mean ?? null, m.min, m.max);
    const stat = (label: string, value: number | null): TemplateResult => {
      const status = gaugeStatus(value, m.min, m.max);
      return html`<span class=${status === 'low' || status === 'high' ? 'stat out' : 'stat'}>
        <span class="stat-label">${label}</span><span class="stat-value">${value === null ? '—' : formatCaptionNumber(value)}</span>
      </span>`;
    };
    const graph = (): TemplateResult => {
      const series = this.history?.series ?? [];
      const last = series[series.length - 1];
      const end = last?.t ?? Date.now();
      const start = series[0]?.t ?? end - 86400000;
      const formatter = new Intl.DateTimeFormat(this.locale, this.daily
        ? { weekday: 'short', day: 'numeric', month: 'short' }
        : end - start <= 86400000
          ? { hour: '2-digit', minute: '2-digit' }
          : { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      const displayUnit = displayUnits[m.unit] ?? m.unit;
      const points = series.map(({ t, v }) => ({
        t, f: fraction(v),
        label: `${formatter.format(t)} · ${formatValue(v, m.unit, true)}${displayUnit ? ' ' + displayUnit : ''}`,
      }));
      const marker = (point: MetricHistory['minPoint']) => {
        if (!point) return null;
        const f = fraction(point.v);
        return f === null ? null : { t: point.t, f, ok: gaugeStatus(point.v, m.min, m.max) === 'ok' };
      };
      const currentFraction = fraction(last?.v ?? null);
      return html`<mpl-history-graph
        .points=${points} .start=${start} .end=${end}
        .minMarker=${marker(this.history?.minPoint ?? null)}
        .maxMarker=${marker(this.history?.maxPoint ?? null)}
        .current=${last && currentFraction !== null ? { t: last.t, f: currentFraction, tone: this.tone } : null}
        .summary=${describeWithStats(m, stats, this.periodText)}
      ></mpl-history-graph>`;
    };

    return html`
      <div class="title">
        <ha-icon icon=${m.icon} aria-hidden="true"></ha-icon>
        <span class="label">${m.label}</span>
        ${this.showHistory ? html`<span class="period">${this.periodLabel}</span>` : nothing}
      </div>
      <div class="value">${formatValue(m.value, m.unit, true)}${!this.hideUnits && m.unit !== ''
        ? html`<span class="unit">${displayUnits[m.unit] ?? m.unit}</span>` : nothing}</div>
      ${this.display === 'graph' ? graph() : html`<mpl-range-bar
          .value=${fraction(m.value)}
          .tone=${this.tone}
          .spanFrom=${stats ? fraction(stats.min) : null}
          .spanTo=${stats ? fraction(stats.max) : null}
          .avg=${stats ? fraction(stats.mean) : null}
          .avgOk=${avgStatus === 'unknown' ? null : avgStatus === 'ok'}
          .showTicks=${m.min !== null && m.max !== null}
      ></mpl-range-bar>`}
      ${m.min !== null && m.max !== null
        ? html`<span class="ideal">Ideal ${formatCaptionNumber(m.min)}–${formatCaptionNumber(m.max)}</span>`
        : nothing}
      ${this.display === 'summary' && this.showHistory ? html`<div class="stats">
        ${stat('Min', stats?.min ?? null)}
        ${stat('Avg', stats?.mean ?? null)}
        ${stat('Max', stats?.max ?? null)}
      </div>` : nothing}
    `;
  }

  // Like the battery glyph, inherit semantic tokens rather than masking ancestor overrides.
  static styles = css`
    :host {
      --mpl-metric-glyph-size: 18px;
      --mpl-metric-column-width: 88px;
      --mpl-metric-column-gap: 12px;
      --mpl-metric-title-gap: 6px;
      --mpl-metric-label-size: 14px;
      --mpl-metric-label-line: 20px;
      --mpl-metric-label-weight: 500;
      --mpl-metric-value-size: 22px;
      --mpl-metric-value-line: 28px;
      --mpl-metric-value-weight: 400;
      --mpl-metric-problem-weight: 600;
      --mpl-metric-unit-gap: 3px;
      --mpl-metric-unit-size: 13px;
      --mpl-metric-caption-size: 12px;
      --mpl-metric-caption-line: 20px;
      --mpl-metric-period-line: 16px;
      --mpl-metric-stat-size: 11px;
      --mpl-metric-stat-line: 16px;
      --mpl-metric-stat-gap: 3px;
      --mpl-metric-stats-gap: 4px;
      --mpl-metric-stat-padding: 6px;
      --mpl-metric-stat-radius: 6px;
      --mpl-metric-stat-label-weight: 400;
      --mpl-metric-stat-value-weight: 600;
      display: grid;
      grid-template-columns: var(--mpl-metric-column-width) minmax(0, 1fr);
      grid-template-rows: var(--mpl-metric-label-line) var(--mpl-metric-value-line) var(--mpl-metric-caption-line);
      column-gap: var(--mpl-metric-column-gap);
      row-gap: 0;
      align-items: center;
      min-width: 0;
    }
    .title {
      grid-column: 1 / -1;
      grid-row: 1;
      display: flex;
      gap: var(--mpl-metric-title-gap);
      align-items: center;
      min-width: 0;
    }
    :host([tone='ok']) ha-icon {
      color: var(--mpl-success);
    }
    :host([tone='problem']) ha-icon {
      color: var(--mpl-error);
    }
    ha-icon {
      --mdc-icon-size: var(--mpl-metric-glyph-size);
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--mpl-metric-glyph-size);
      height: var(--mpl-metric-glyph-size);
      flex-shrink: 0;
      color: var(--mpl-on-surface-variant);
    }
    .label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--mpl-metric-label-size);
      line-height: var(--mpl-metric-label-line);
      font-weight: var(--mpl-metric-label-weight);
      color: var(--mpl-on-surface);
    }
    .period {
      margin-left: auto;
      flex-shrink: 0;
      white-space: nowrap;
      font-size: var(--mpl-metric-caption-size);
      line-height: var(--mpl-metric-period-line);
      color: var(--mpl-on-surface-variant);
    }
    .value {
      grid-column: 1;
      grid-row: 2;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
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
      font-size: var(--mpl-metric-unit-size);
      margin-left: var(--mpl-metric-unit-gap);
      color: var(--mpl-on-surface-variant);
    }
    mpl-range-bar {
      grid-column: 2;
      grid-row: 2;
      min-width: 0;
    }
    mpl-history-graph {
      grid-column: 2;
      grid-row: 2 / 4;
      min-width: 0;
      height: calc(var(--mpl-metric-value-line) + var(--mpl-metric-caption-line));
    }
    .ideal {
      grid-column: 1;
      grid-row: 3;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: var(--mpl-metric-caption-size);
      line-height: var(--mpl-metric-caption-line);
      color: var(--mpl-on-surface-variant);
      white-space: nowrap;
    }
    .stats {
      grid-column: 2;
      grid-row: 3;
      display: flex;
      justify-content: space-between;
      gap: var(--mpl-metric-stats-gap);
      align-items: center;
      min-width: 0;
    }
    .stat {
      display: inline-flex;
      gap: var(--mpl-metric-stat-gap);
      height: var(--mpl-metric-caption-line);
      padding: 0 var(--mpl-metric-stat-padding);
      border-radius: var(--mpl-metric-stat-radius);
      font-size: var(--mpl-metric-stat-size);
      line-height: var(--mpl-metric-stat-line);
      align-items: center;
      white-space: nowrap;
    }
    .stat-label {
      color: var(--mpl-on-surface-variant);
      font-weight: var(--mpl-metric-stat-label-weight);
    }
    .stat-value {
      color: var(--mpl-on-surface);
      font-weight: var(--mpl-metric-stat-value-weight);
    }
    .stat.out {
      background: var(--mpl-error-container);
    }
    .out .stat-label, .out .stat-value {
      color: var(--mpl-on-error-container);
    }
  `;
}

if (!customElements.get('mpl-metric-row')) customElements.define('mpl-metric-row', MplMetricRow);

declare global {
  interface HTMLElementTagNameMap {
    'mpl-metric-row': MplMetricRow;
  }
}
