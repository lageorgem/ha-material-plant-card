import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS, DEFAULT_ICONS, type MetricConfig, type MaterialPlantCardConfig } from './types';
import { normalizeMetrics, resolveMetric } from './calc/metric-settings';
import { themeTokens } from './theme';
import { ensureHaComponents } from './editors/load-ha';

interface Schema {
  name: string;
  required?: boolean;
  type?: 'expandable';
  title?: string;
  icon?: string;
  flatten?: boolean;
  schema?: Schema[];
  selector?: Record<string, unknown>;
}
type FormData = Record<string, unknown>;
const select = (options: { value: string; label: string }[]) => ({ select: { mode: 'dropdown', options } });
const PERIODS = [
  { value: 'today', label: 'Today' }, { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' }, { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' }, { value: '30d', label: 'Last 30 days' },
];
const BASE_SCHEMA: Schema[] = [
  { name: 'entity', required: true, selector: { entity: { domain: 'plant' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'battery_sensor', selector: { entity: { domain: 'sensor', device_class: 'battery' } } },
  { name: 'display_type', selector: select([{ value: 'full', label: 'Full' }, { value: 'compact', label: 'Compact' }]) },
  {
    name: '', type: 'expandable', title: 'Appearance', icon: 'mdi:palette-outline', flatten: true,
    schema: [
      ...['hide_species', 'hide_image', 'hide_units'].map(name => ({ name, selector: { boolean: {} } })),
      { name: 'image', selector: { text: {} } },
      { name: 'battery_warn_level', selector: { number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' } } },
    ],
  },
];
const COMPACT_LAYOUT_SCHEMA: Schema = {
  name: '', type: 'expandable', title: 'Compact layout', icon: 'mdi:view-grid-outline', flatten: true,
  schema: [
    { name: 'gauges_per_row', selector: { number: { min: 1, max: 12, step: 1, mode: 'box' } } },
    { name: 'gauge_size', selector: { number: { min: 32, max: 96, step: 4, mode: 'slider', unit_of_measurement: 'px' } } },
  ],
};
const LABELS: Readonly<Record<string, string>> = {
  entity: 'Plant entity', name: 'Name', battery_sensor: 'Battery sensor', display_type: 'Display type',
  hide_species: 'Hide species', hide_image: 'Hide image', hide_units: 'Hide units', image: 'Image',
  battery_warn_level: 'Battery low below', icon: 'Icon', display: 'Display', problem_trigger: 'Problem trigger',
  days: 'Days (1 = today)', period: 'History window', daylight_only: 'Daylight only (sunrise/sunset)',
  daylight_offset: 'Ignore after sunrise / before sunset',
  gauges_per_row: 'Gauges per row', gauge_size: 'Gauge size',
};
const HELPERS: Readonly<Record<string, string>> = {
  hide_units: 'Hides units next to values.', image: 'Overrides the plant picture.',
  battery_warn_level: 'Battery turns red below this level (default 10%).',
  problem_trigger: 'Independent of the plant monitor unless set to Follow plant monitor.',
  days: 'DLI uses the maximum value of each day.',
  daylight_offset: 'Minutes after sunrise and before sunset to ignore (default 30).',
  gauges_per_row: 'Leave empty to balance rows automatically.', gauge_size: 'Default 44 px.',
};
const DEFAULTS: Readonly<FormData> = {
  icon: '', display: 'summary', problem_trigger: 'plant', period: 'today', days: 7,
  daylight_only: true, daylight_offset: 30,
};
const labels: Readonly<Record<string, string>> = MEASUREMENT_LABELS;
const icons: Readonly<Record<string, string>> = DEFAULT_ICONS;
function metricSchema(type: string): Schema[] {
  return [
    { name: 'icon', selector: { icon: {} } },
    { name: 'display', selector: select([{ value: 'summary', label: 'Summary' }, { value: 'graph', label: 'Graph' }]) },
    { name: 'problem_trigger', selector: select([
      { value: 'plant', label: 'Follow plant monitor' }, { value: 'out_of_range', label: 'Outside ideal range' },
      { value: 'low', label: 'Too low only' }, { value: 'high', label: 'Too high only' }, { value: 'never', label: 'Never' },
    ]) },
    type === 'dli'
      ? { name: 'days', selector: { number: { min: 1, max: 30, step: 1, mode: 'slider', unit_of_measurement: 'days' } } }
      : { name: 'period', selector: select(PERIODS) },
    ...(type === 'illuminance' ? [
      { name: 'daylight_only', selector: { boolean: {} } },
      { name: 'daylight_offset', selector: { number: { min: 0, max: 180, step: 5, mode: 'box', unit_of_measurement: 'min' } } },
    ] : []),
  ];
}

/** Stock HA forms plus an ordered, independently configured metric list. */
export class MaterialPlantCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: MaterialPlantCardConfig;
  @state() private _editingIndex: number | null = null;
  @state() private _addOpen = false;

  connectedCallback(): void {
    super.connectedCallback();
    void ensureHaComponents().then(() => this.requestUpdate());
  }
  public setConfig(config: MaterialPlantCardConfig): void {
    this._config = config;
  }
  private _emit(config: MaterialPlantCardConfig): void {
    this._config = config;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }
  private _computeLabel = (schema: Schema): string => LABELS[schema.name] ?? schema.title ?? schema.name;
  private _computeHelper = (schema: Schema): string => HELPERS[schema.name] ?? '';
  private get _schema(): Schema[] {
    return this._config.display_type === 'compact' ? [...BASE_SCHEMA, COMPACT_LAYOUT_SCHEMA] : BASE_SCHEMA;
  }
  private _formChanged(e: CustomEvent<{ value: FormData }>): void {
    e.stopPropagation();
    const config = { ...this._config };
    const record = config as unknown as FormData;
    const fields = this._schema.flatMap(field => field.schema ?? [field]);
    for (const { name } of fields) {
      if (!Object.prototype.hasOwnProperty.call(e.detail.value, name)) continue;
      const value = e.detail.value[name];
      if (value === '' || value == null) delete record[name];
      else record[name] = value;
    }
    this._emit(config);
  }
  private get _metrics(): MetricConfig[] { return normalizeMetrics(this._config); }
  private _setMetrics(metrics: MetricConfig[]): void {
    const config = { ...this._config, metrics };
    delete config.show_bars;
    this._emit(config);
  }
  private _pickMetric(type: string): void {
    if (this._metrics.some(metric => metric.type === type)) return;
    this._editingIndex = this._metrics.length;
    this._addOpen = false;
    this._setMetrics([...this._metrics, { type }]);
  }
  private _removeMetric(index: number): void {
    this._editingIndex = null;
    this._setMetrics(this._metrics.filter((_, i) => i !== index));
  }
  private _moveMetric(e: CustomEvent<{ oldIndex: number; newIndex: number }>): void {
    e.stopPropagation();
    const { oldIndex, newIndex } = e.detail;
    const metrics = [...this._metrics];
    if (!Number.isInteger(oldIndex) || !Number.isInteger(newIndex) || oldIndex < 0 || newIndex < 0 || oldIndex >= metrics.length || newIndex >= metrics.length || oldIndex === newIndex) return;
    const [moved] = metrics.splice(oldIndex, 1);
    metrics.splice(newIndex, 0, moved);
    this._editingIndex = null;
    this._setMetrics(metrics);
  }
  private _handleKey(index: number, e: KeyboardEvent): void {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    e.stopPropagation();
    const newIndex = index + (e.key === 'ArrowUp' ? -1 : 1);
    this._moveMetric(new CustomEvent('item-moved', { detail: { oldIndex: index, newIndex } }));
    void this.updateComplete.then(() => {
      this.shadowRoot?.querySelectorAll<HTMLElement>('.handle')[Math.max(0, Math.min(newIndex, this._metrics.length - 1))]?.focus();
    });
  }
  private _metricChanged(index: number, e: CustomEvent<{ value: FormData }>): void {
    e.stopPropagation();
    const metrics = [...this._metrics];
    const entry = { ...metrics[index] };
    const record = entry as unknown as FormData;
    for (const { name } of metricSchema(entry.type)) {
      if (!Object.prototype.hasOwnProperty.call(e.detail.value, name)) continue;
      const value = e.detail.value[name];
      if (value === '' || value == null || value === DEFAULTS[name]) delete record[name];
      else record[name] = value;
    }
    // Prune existing explicit defaults as well as newly changed ones.
    for (const [name, value] of Object.entries(DEFAULTS)) if (record[name] === value) delete record[name];
    metrics[index] = entry;
    this._setMetrics(metrics);
  }
  private _summary(entry: MetricConfig): string {
    const r = resolveMetric(entry);
    return [r.display === 'graph' ? 'Graph' : 'Summary',
      ...(entry.type === 'illuminance' && r.daylightOnly ? ['Daylight'] : []),
      entry.type === 'dli' ? `Daily max ${r.days} d` : PERIODS.find(p => p.value === r.period)!.label,
    ].join(' · ');
  }
  private _renderMetric(entry: MetricConfig, index: number): TemplateResult {
    const expanded = this._editingIndex === index;
    const r = resolveMetric(entry);
    const label = labels[entry.type] ?? entry.type;
    const data: FormData = {
      icon: r.icon ?? '', display: r.display, problem_trigger: r.trigger,
      period: r.period, days: r.days, daylight_only: r.daylightOnly, daylight_offset: r.daylightOffset,
    };
    return html`<div class="metric">
      <div class="metric-head">
        <div class="handle" tabindex="0" role="button" aria-label=${`Reorder ${label}. Use up and down arrow keys.`}
          @keydown=${(e: KeyboardEvent) => this._handleKey(index, e)}><ha-icon icon="mdi:drag"></ha-icon></div>
        <ha-icon icon=${entry.icon ?? icons[entry.type] ?? 'mdi:leaf'}></ha-icon>
        <div class="metric-title"><div>${label}</div><div class="hint">${this._summary(entry)}</div></div>
        <button type="button" class="icon-btn" aria-label="Edit metric" title=${`Edit ${label}`} aria-expanded=${String(expanded)}
          @click=${() => (this._editingIndex = expanded ? null : index)}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button type="button" class="icon-btn" aria-label="Delete metric" title=${`Delete ${label}`}
          @click=${() => this._removeMetric(index)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${expanded ? html`<div class="metric-editor"><ha-form .hass=${this.hass} .schema=${metricSchema(entry.type)}
        .data=${data} .computeLabel=${this._computeLabel} .computeHelper=${this._computeHelper}
        @value-changed=${(e: CustomEvent<{ value: FormData }>) => this._metricChanged(index, e)}></ha-form></div>` : nothing}
    </div>`;
  }
  protected render(): TemplateResult {
    if (!this._config || !this.hass) return html``;
    const config = this._config;
    const metrics = this._metrics;
    const missing = MEASUREMENT_KEYS.filter(type => !metrics.some(entry => entry.type === type));
    return html`<div class="editor">
      <ha-form .hass=${this.hass} .schema=${this._schema} .data=${{
        entity: config.entity, name: config.name, battery_sensor: config.battery_sensor,
        display_type: config.display_type ?? 'full', hide_species: config.hide_species ?? false,
        hide_image: config.hide_image ?? false, hide_units: config.hide_units ?? false,
        image: config.image, battery_warn_level: config.battery_warn_level ?? 10,
        ...(config.display_type === 'compact' ? { gauges_per_row: config.gauges_per_row, gauge_size: config.gauge_size ?? 44 } : {}),
      }} .computeLabel=${this._computeLabel} .computeHelper=${this._computeHelper} @value-changed=${this._formChanged}></ha-form>
      <div class="metrics-header">Metrics</div>
      ${metrics.length ? nothing : html`<p class="hint">No metrics yet. Add a metric below.</p>`}
      <ha-sortable handle-selector=".handle" @item-moved=${this._moveMetric}>
        <div class="metrics">${metrics.map((entry, index) => this._renderMetric(entry, index))}</div>
      </ha-sortable>
      ${missing.length ? html`<div class="add">
        <button type="button" class="add-btn" aria-expanded=${String(this._addOpen)}
          @click=${() => (this._addOpen = !this._addOpen)}><ha-icon icon="mdi:plus"></ha-icon>Add metric</button>
        ${this._addOpen ? html`<div class="add-menu" @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Escape') { this._addOpen = false; this.shadowRoot?.querySelector<HTMLButtonElement>('.add-btn')?.focus(); }
        }}>${missing.map(type => html`<button type="button" class="add-opt" data-type=${type}
          @click=${() => this._pickMetric(type)}><ha-icon icon=${icons[type]}></ha-icon>${labels[type]}</button>`)}</div>` : nothing}
      </div>` : nothing}
    </div>`;
  }
  static styles = [themeTokens, css`
    :host { display: block; }
    .editor, .metrics, .add-menu { display: flex; flex-direction: column; gap: 16px; }
    .metrics { gap: 8px; }
    .metrics-header { font-weight: 500; color: var(--mpl-on-surface); }
    .metric { border: 1px solid var(--mpl-outline-variant); border-radius: var(--mpl-shape-card); background: var(--mpl-surface-container); }
    .metric-head { display: flex; align-items: center; gap: 8px; padding: 8px; }
    .handle { cursor: grab; display: grid; place-items: center; color: var(--mpl-on-surface-variant); min-width: 44px; min-height: 44px; }
    .metric-title { flex: 1; min-width: 0; color: var(--mpl-on-surface); overflow-wrap: anywhere; }
    button { font: inherit; cursor: pointer; border: none; }
    .icon-btn { flex-shrink: 0; width: 44px; height: 44px; border-radius: var(--mpl-shape-full); background: transparent; color: var(--mpl-on-surface-variant); }
    button:hover, button:active { background: var(--mpl-surface-container-highest); }
    button:focus-visible, .handle:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .metric-editor { padding: 8px 12px 12px; border-top: 1px solid var(--mpl-outline-variant); }
    .hint { color: var(--mpl-on-surface-variant); font-size: 13px; margin: 0; overflow-wrap: anywhere; }
    .add-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 18px; border-radius: var(--mpl-shape-full); background: var(--mpl-primary); color: var(--mpl-on-primary); }
    .add-btn:hover, .add-btn:active { background: var(--mpl-primary); filter: brightness(0.95); }
    .add-menu { margin-top: 8px; gap: 0; background: var(--mpl-surface); border: 1px solid var(--mpl-outline-variant); border-radius: var(--mpl-shape-card); overflow: hidden; }
    .add-opt { display: flex; align-items: center; gap: 8px; text-align: left; min-height: 44px; padding: 12px 16px; background: transparent; color: var(--mpl-on-surface); }
  `];
}
if (!customElements.get('material-plant-card-editor')) customElements.define('material-plant-card-editor', MaterialPlantCardEditor);
declare global {
  interface HTMLElementTagNameMap { 'material-plant-card-editor': MaterialPlantCardEditor; }
}
