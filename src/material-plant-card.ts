import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { CARD_NAME, CARD_DISPLAY_NAME, CARD_DESCRIPTION, CARD_VERSION } from './const';
import { DEFAULT_GAUGES, type MaterialPlantCardConfig, type PlantInfo } from './types';
import { buildMeasurements, activeProblems, toneFor, formatValue, describeMeasurement, tooltipLines, batteryInfo } from './calc/measurements';
import { themeTokens } from './theme';
import './gauge/plant-gauge';
import './battery/battery-glyph';
import { fetchHistory, summarizeHourly, summarizeDailyMax, seriesExtremes, localDayStart, type HistoryFetch, type RawHistory, type MetricHistory } from './data/history-stats';
import { normalizeMetrics, resolveMetric, periodStart } from './calc/metric-settings';
import { isDaylight, sunEvents } from './calc/sun';
import { describeWithStats } from './full/metric-row';

const REFRESH_INTERVAL = 5000;
const STATS_INTERVAL = 10 * 60 * 1000;
const STATS_THROTTLE = 60 * 1000;
// One immutable, clean-room nine-lobe mask, shared by images and placeholders.
const cookieMask = (() => {
  const points = Array.from({ length: 180 }, (_, index) => {
    const angle = index * 2 * Math.PI / 180;
    const radius = 50 * (0.94 + 0.06 * Math.cos(9 * angle));
    return `${(50 + radius * Math.cos(angle)).toFixed(3)},${(50 + radius * Math.sin(angle)).toFixed(3)}`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M${points.join(' L')} Z" fill="white"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

export class MaterialPlantCard extends LitElement {
  private _hass?: HomeAssistant;
  @property({ attribute: false, noAccessor: true })
  public get hass(): HomeAssistant | undefined { return this._hass; }
  public set hass(value: HomeAssistant | undefined) {
    const old = this._hass;
    this._hass = value;
    this.requestUpdate('hass', old);
    const entity = this._config?.entity;
    if (entity && value && (!old || old.states[entity]?.last_updated !== value.states[entity]?.last_updated)) {
      this._queueFetch();
    }
  }

  @state() private _config?: MaterialPlantCardConfig;
  @state() private _info?: PlantInfo;
  @state() private _failedSrc?: string;
  @state() private _gaugeCapacity = 6;
  @state() private _statsMap: RawHistory = {
    hourly: {}, cumulative: {}, fine: {},
    failedGroups: { hourly: false, cumulative: false, fine: false },
  };
  private _statsKey?: string;
  private _statsRequest = 0;
  private _statsLastFetch = -Infinity;
  private _statsPending = true;
  private _statsInFlight?: number;
  private _statsTimer?: ReturnType<typeof setTimeout>;
  private _gaugesObserver?: ResizeObserver;
  private _gaugesFrame?: number;
  private _imageSrc?: string;
  private _lastFetch = -Infinity;
  private _request = 0;
  private _inFlight?: number;
  private _timer?: ReturnType<typeof setTimeout>;
  private _pending = false;
  @state() private _tooltip?: HTMLButtonElement;
  @state() private _tooltipSource?: 'mouse' | 'touch' | 'focus';
  private _tooltipShowTimer?: ReturnType<typeof setTimeout>;
  private _tooltipHideTimer?: ReturnType<typeof setTimeout>;
  private _press?: { button: HTMLButtonElement; id: number; x: number; y: number; long: boolean };
  private _suppressClick?: { button: HTMLButtonElement; id: number; released: boolean };
  private _suppressClickTimer?: ReturnType<typeof setTimeout>;
  private _hoveredGauge?: HTMLButtonElement;
  private _tooltipHovered = false;
  private _focusedGauge?: HTMLButtonElement;
  private _touchTooltip = false;
  private _graphPress?: { tile: HTMLElement; id: number };

  private _fromGraph(event: Event): boolean {
    return event.composedPath().some((target) => target instanceof Element && target.tagName === 'MPL-HISTORY-GRAPH');
  }

  private _tilePointerOver(event: PointerEvent): void {
    const tile = event.currentTarget as HTMLElement;
    tile.classList.toggle('graph-active', this._fromGraph(event) || this._graphPress?.tile === tile);
  }

  private _tilePointerOut(event: PointerEvent): void {
    const tile = event.currentTarget as HTMLElement;
    if (this._fromGraph(event) && this._graphPress?.tile !== tile) tile.classList.remove('graph-active');
  }

  private _tilePointerDown(event: PointerEvent): void {
    if (!this._fromGraph(event)) return;
    const tile = event.currentTarget as HTMLElement;
    this._graphPress = { tile, id: event.pointerId };
    tile.classList.add('graph-active');
  }

  private _tilePointerLeave(event: PointerEvent): void {
    const tile = event.currentTarget as HTMLElement;
    tile.classList.remove('graph-active');
    if (this._graphPress?.tile === tile) this._graphPress = undefined;
  }

  private _graphPointerRelease = (event: PointerEvent): void => {
    const press = this._graphPress;
    if (!press || press.id !== event.pointerId) return;
    this._graphPress = undefined;
    // Mouse release still over the graph must not restore the tile's hover layer.
    if (event.type === 'pointercancel' || event.pointerType !== 'mouse' || !this._fromGraph(event)) {
      press.tile.classList.remove('graph-active');
    }
  };

  private _clearClickSuppression(): void {
    clearTimeout(this._suppressClickTimer);
    this._suppressClickTimer = undefined;
    this._suppressClick = undefined;
  }

  private _showTooltip(button: HTMLButtonElement, source: 'mouse' | 'touch' | 'focus'): void {
    clearTimeout(this._tooltipHideTimer);
    this._tooltipHideTimer = undefined;
    this._tooltip = button;
    this._tooltipSource = source;
    this._touchTooltip = source === 'touch';
    if (this._touchTooltip) document.addEventListener('pointerdown', this._dismissTooltip, true);
  }

  private _hideTooltip = (): void => {
    clearTimeout(this._tooltipShowTimer);
    clearTimeout(this._tooltipHideTimer);
    this._tooltipShowTimer = undefined;
    this._tooltipHideTimer = undefined;
    this._tooltip = undefined;
    this._tooltipSource = undefined;
    this._hoveredGauge = undefined;
    this._tooltipHovered = false;
    this._focusedGauge = undefined;
    this._touchTooltip = false;
    document.removeEventListener('pointerdown', this._dismissTooltip, true);
  };

  private _dismissTooltip = (): void => {
    this._hideTooltip();
    this._press = undefined;
    this._clearClickSuppression();
  };

  private _tooltipKeydown = (event: KeyboardEvent): void => {
    this._clearClickSuppression();
    if (event.key === 'Escape') this._dismissTooltip();
  };

  private _gaugePointerDown(event: PointerEvent): void {
    this._dismissTooltip();
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    const button = event.currentTarget as HTMLButtonElement;
    const press = { button, id: event.pointerId, x: event.clientX, y: event.clientY, long: false };
    this._press = press;
    this._tooltipShowTimer = setTimeout(() => {
      this._tooltipShowTimer = undefined;
      press.long = true;
      this._suppressClick = { button, id: press.id, released: false };
      this._showTooltip(button, 'touch');
    }, 450);
  }

  private _gaugePointerMove = (event: PointerEvent): void => {
    const press = this._press;
    if (press && event.pointerId === press.id && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) this._dismissTooltip();
  };

  private _gaugePointerUp = (event: PointerEvent): void => {
    const press = this._press;
    if (!press || event.pointerId !== press.id) return;
    clearTimeout(this._tooltipShowTimer);
    this._tooltipShowTimer = undefined;
    this._press = undefined;
    if (press.long && this._suppressClick?.id === press.id) {
      this._suppressClick.released = true;
      this._suppressClickTimer = setTimeout(() => this._clearClickSuppression(), 800);
    }
  };

  private _gaugePointerCancel = (event: PointerEvent): void => {
    if (event.pointerId === this._press?.id || event.pointerId === this._suppressClick?.id) this._dismissTooltip();
  };

  private _gaugePointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    const button = event.currentTarget as HTMLButtonElement;
    if (this._tooltip === button) {
      this._hoveredGauge = button;
      clearTimeout(this._tooltipHideTimer);
      this._tooltipHideTimer = undefined;
      return;
    }
    if (this._focusedGauge || this._touchTooltip) return;
    this._dismissTooltip();
    this._hoveredGauge = button;
    this._tooltipShowTimer = setTimeout(() => {
      this._tooltipShowTimer = undefined;
      this._showTooltip(button, 'mouse');
    }, 500);
  }

  private _gaugePointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    if (this._hoveredGauge === event.currentTarget) this._hoveredGauge = undefined;
    clearTimeout(this._tooltipShowTimer);
    this._tooltipShowTimer = undefined;
    this._scheduleTooltipHide();
  }

  private _scheduleTooltipHide(): void {
    clearTimeout(this._tooltipHideTimer);
    if (!this._tooltip || this._touchTooltip) return;
    this._tooltipHideTimer = setTimeout(() => {
      this._tooltipHideTimer = undefined;
      if (!this._hoveredGauge && !this._tooltipHovered && !this._focusedGauge) this._hideTooltip();
    }, 150);
  }

  private _tooltipPointerEnter(): void {
    this._tooltipHovered = true;
    clearTimeout(this._tooltipHideTimer);
    this._tooltipHideTimer = undefined;
  }

  private _tooltipPointerLeave(): void {
    this._tooltipHovered = false;
    this._scheduleTooltipHide();
  }

  private _gaugeBlur(): void {
    this._focusedGauge = undefined;
    if (!this._hoveredGauge && !this._tooltipHovered && !this._touchTooltip) this._hideTooltip();
  }

  private _gaugeFocus(event: FocusEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    if (!button.matches(':focus-visible')) return;
    if (this._tooltip !== button) this._dismissTooltip();
    this._focusedGauge = button;
    this._showTooltip(button, 'focus');
  }

  private _gaugeClick(event: MouseEvent, entity: string): void {
    const suppression = this._suppressClick;
    if (event.detail === 0) this._clearClickSuppression();
    if (event.detail > 0 && suppression?.released && event.currentTarget === suppression.button &&
      (!(event instanceof PointerEvent) || event.pointerId === suppression.id)) {
      this._clearClickSuppression();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this._moreInfo(entity);
  }

  protected updated(): void {
    this._positionTooltip();
    this._syncStats();
  }

  private _isCumulative(sensor?: string): boolean {
    const stateClass = sensor ? this.hass?.states[sensor]?.attributes.state_class : undefined;
    return stateClass === 'total' || stateClass === 'total_increasing';
  }

  private _statsSensors(now: number): { fetch: HistoryFetch; key: string } {
    const tz = typeof this.hass?.config?.time_zone === 'string' ? this.hass.config.time_zone : undefined;
    const hourly = new Set<string>();
    const cumulative = new Set<string>();
    const fine = new Set<string>();
    let hourlyStart = now;
    let fineStart = now;
    let days = 1;
    const settings: unknown[] = [];
    if (this.hass && this._config && this.hass.states[this._config.entity]) {
      const metrics = normalizeMetrics(this._config);
      for (const m of buildMeasurements(this._info, metrics.map(entry => entry.type), this.hass.states)) {
        if (!m.sensor) continue;
        const r = resolveMetric(metrics.find(entry => entry.type === m.key)!);
        const daily = this._isCumulative(m.sensor);
        if (daily) {
          cumulative.add(m.sensor);
          days = Math.max(days, r.days);
        } else {
          const start = periodStart(r.period, now, tz);
          hourlyStart = Math.min(hourlyStart, start);
          const daylight = m.key === 'illuminance' && r.daylightOnly &&
            Number.isFinite(this.hass.config?.latitude) && Number.isFinite(this.hass.config?.longitude);
          const useFine = (daylight && r.periodMs <= 7 * 86400000) ||
            (r.display === 'graph' && (r.period === 'today' || r.period === '24h'));
          if (useFine) {
            fine.add(m.sensor);
            fineStart = Math.min(fineStart, start);
          }
          if (!useFine || r.display === 'graph') {
            hourly.add(m.sensor);
          }
        }
        settings.push([m.key, m.sensor, daily, r.period, r.days, r.daylightOnly, r.daylightOffset, r.display,
          r.period === 'today' && !daily ? periodStart(r.period, now, tz) : null]);
      }
    }
    return {
      fetch: { hourly: [...hourly], hourlyStart, fine: [...fine], fineStart,
        cumulative: [...cumulative], cumulativeStart: localDayStart(now, days - 1, tz) },
      key: JSON.stringify([this._config?.entity, settings, this.hass?.config?.latitude, this.hass?.config?.longitude, tz]),
    };
  }

  private _stopStats(dropMap = false): void {
    clearTimeout(this._statsTimer);
    this._statsTimer = undefined;
    this._statsRequest++;
    this._statsPending ||= this._statsInFlight !== undefined;
    this._statsInFlight = undefined;
    if (dropMap) {
      this._statsKey = undefined;
      this._statsPending = true;
      if (Object.keys(this._statsMap.hourly).length || Object.keys(this._statsMap.cumulative).length || Object.keys(this._statsMap.fine).length) {
        this._statsMap = {
          hourly: {}, cumulative: {}, fine: {},
          failedGroups: { hourly: false, cumulative: false, fine: false },
        };
      }
    }
  }

  private _syncStats(): void {
    if (this._config?.display_type === 'compact') {
      this._stopStats(true);
      return;
    }
    if (!this.isConnected || !this.hass || !this._info || !this._config) return;
    const { fetch: sensors, key } = this._statsSensors(Date.now());
    if (key !== this._statsKey) {
      this._statsKey = key;
      this._statsRequest++;
      this._statsPending = true;
    }
    if (!sensors.hourly.length && !sensors.cumulative.length && !sensors.fine.length) {
      clearTimeout(this._statsTimer);
      this._statsTimer = undefined;
      return;
    }
    const elapsed = Date.now() - this._statsLastFetch;
    const wait = this._statsPending ? Math.max(0, STATS_THROTTLE - elapsed) : Math.max(0, STATS_INTERVAL - elapsed);
    clearTimeout(this._statsTimer);
    this._statsTimer = undefined;
    if (wait === 0) void this._fetchStats(sensors);
    else this._statsTimer = setTimeout(() => {
      this._statsTimer = undefined;
      this._statsPending = true;
      this._syncStats();
    }, wait);
  }

  private async _fetchStats(sensors: HistoryFetch): Promise<void> {
    const hass = this.hass!;
    const request = ++this._statsRequest;
    this._statsInFlight = request;
    this._statsPending = false;
    this._statsLastFetch = Date.now();
    this._syncStats();
    const result = await fetchHistory({
      callWS: <T>(message: Record<string, unknown>): Promise<T> => hass.callWS<T>(message as { type: string }),
    }, sensors, this._statsLastFetch);
    if (request === this._statsRequest && this.isConnected) {
      this._statsMap = {
        ...result,
        hourly: result.failedGroups.hourly ? this._statsMap.hourly : result.hourly,
        cumulative: result.failedGroups.cumulative ? this._statsMap.cumulative : result.cumulative,
        fine: result.failedGroups.fine ? this._statsMap.fine : result.fine,
      };
    }
    if (this._statsInFlight === request) this._statsInFlight = undefined;
    this._syncStats();
  }

  private _positionTooltip(): void {
    const tooltip = this.shadowRoot?.querySelector<HTMLElement>('.tooltip');
    const surface = this.shadowRoot?.querySelector<HTMLElement>('ha-card');
    const button = this._tooltip;
    if (!tooltip || !surface || !button) return;
    if (!button.isConnected) { this._dismissTooltip(); return; }
    const bounds = surface.getBoundingClientRect();
    const target = button.getBoundingClientRect();
    // Computed dimensions retain subpixels and are unaffected by the enter scale.
    const tooltipStyle = getComputedStyle(tooltip);
    const width = parseFloat(tooltipStyle.width);
    const height = parseFloat(tooltipStyle.height);
    const centre = target.left + target.width / 2 - bounds.left - surface.clientLeft;
    const left = Math.max(8, Math.min(centre - width / 2, surface.clientWidth - 8 - width));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${target.top - bounds.top - surface.clientTop - height - 4}px`;
  }

  public setConfig(config: MaterialPlantCardConfig): void {
    if (!config || typeof config.entity !== 'string' || !config.entity.startsWith('plant.')) {
      throw new Error('Specify a plant entity');
    }
    const changedEntity = this._config?.entity !== config.entity;
    this._config = { ...config, show_bars: config.show_bars ? [...config.show_bars] : undefined,
      metrics: normalizeMetrics(config).map(entry => ({ ...entry })) };
    this._dismissTooltip();
    this._statsRequest++;
    this._statsPending = true;
    if (changedEntity || config.display_type === 'compact') this._stopStats(true);
    if (changedEntity) {
      this._info = undefined;
      // Invalidate the old entity even when hass has not arrived yet.
      this._request++;
      this._queueFetch();
    }
    this._syncStats();
  }

  public getCardSize(): number {
    if (this._config?.display_type === 'compact') return 4;
    const n = this.hass && this._config && this.hass.states[this._config.entity]
      ? buildMeasurements(this._info, normalizeMetrics(this._config).map(entry => entry.type), this.hass.states).length : 0;
    return Math.ceil((100 + n * 86) / 50);
  }
  public getGridOptions(): { columns: number; min_columns: number; rows: 'auto' } {
    return { columns: 6, min_columns: 4, rows: 'auto' };
  }
  public static async getConfigElement() {
    await import('./editor');
    return document.createElement('material-plant-card-editor');
  }
  public static getStubConfig(hass: HomeAssistant): MaterialPlantCardConfig {
    return {
      type: `custom:${CARD_NAME}`,
      entity: Object.keys(hass.states).find((id) => id.startsWith('plant.')) ?? 'plant.my_plant',
      metrics: DEFAULT_GAUGES.map(type => ({ type })),
    };
  }

  private _queueFetch(): void {
    // New demand supersedes in-flight responses, including during the throttle window.
    this._request++;
    this._pending = true;
    if (!this.isConnected || !this.hass || !this._config) return;
    const wait = Math.max(0, REFRESH_INTERVAL - (Date.now() - this._lastFetch));
    if (wait === 0) {
      if (this._timer !== undefined) clearTimeout(this._timer);
      this._timer = undefined;
      void this._fetchInfo();
    } else if (this._timer === undefined) {
      this._timer = setTimeout(() => {
        this._timer = undefined;
        void this._fetchInfo();
      }, wait);
    }
  }

  private async _fetchInfo(): Promise<void> {
    const hass = this.hass;
    const entity = this._config?.entity;
    if (!this.isConnected || !hass || !entity) return;
    this._pending = false;
    this._lastFetch = Date.now();
    const request = ++this._request;
    this._inFlight = request;
    try {
      const response = await hass.callWS<{ result: PlantInfo }>({ type: 'plant/get_info', entity_id: entity });
      if (request === this._request && entity === this._config?.entity && response?.result) {
        this._info = response.result;
      }
    } catch {
      // Integration can be starting up/offline. Preserve last good metadata and live readings.
    } finally {
      if (this._inFlight === request) this._inFlight = undefined;
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this._pending) this._queueFetch();
    this._syncStats();
    this._observeGauges();
    window.addEventListener('pointermove', this._gaugePointerMove, true);
    window.addEventListener('pointerup', this._gaugePointerUp, true);
    window.addEventListener('pointercancel', this._gaugePointerCancel, true);
    window.addEventListener('pointerup', this._graphPointerRelease, true);
    window.addEventListener('pointercancel', this._graphPointerRelease, true);
    window.addEventListener('scroll', this._dismissTooltip, true);
    this.addEventListener('scroll', this._dismissTooltip, true);
    window.addEventListener('keydown', this._tooltipKeydown, true);
  }
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopStats();
    this._dismissTooltip();
    window.removeEventListener('pointermove', this._gaugePointerMove, true);
    window.removeEventListener('pointerup', this._gaugePointerUp, true);
    window.removeEventListener('pointercancel', this._gaugePointerCancel, true);
    window.removeEventListener('pointerup', this._graphPointerRelease, true);
    window.removeEventListener('pointercancel', this._graphPointerRelease, true);
    this._graphPress = undefined;
    this.shadowRoot?.querySelectorAll('.graph-active').forEach((tile) => tile.classList.remove('graph-active'));
    window.removeEventListener('scroll', this._dismissTooltip, true);
    this.removeEventListener('scroll', this._dismissTooltip, true);
    window.removeEventListener('keydown', this._tooltipKeydown, true);
    this._gaugesObserver?.disconnect();
    this._gaugesObserver = undefined;
    if (this._gaugesFrame !== undefined) cancelAnimationFrame(this._gaugesFrame);
    this._gaugesFrame = undefined;
    if (this._timer !== undefined) clearTimeout(this._timer);
    this._timer = undefined;
    // A cancelled trailing fetch or invalidated response still needs replacement.
    this._pending ||= this._inFlight !== undefined;
    this._inFlight = undefined;
    this._request++;
  }

  private _observeGauges(): void {
    if (!this.isConnected || this._gaugesObserver) return;
    this._gaugesObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!this.isConnected || entry.target !== this) continue;
        if (this._gaugesFrame !== undefined) cancelAnimationFrame(this._gaugesFrame);
        this._gaugesFrame = undefined;
        const innerWidth = entry.contentRect.width - 32;
        const capacity = Math.max(1, Math.floor((innerWidth + 4) / 48));
        // Host height can change with the rows. Defer writes beyond observer delivery.
        this._gaugesFrame = requestAnimationFrame(() => {
          this._gaugesFrame = undefined;
          if (!this.isConnected) return;
          if (capacity !== this._gaugeCapacity) this._gaugeCapacity = capacity;
          if (this._tooltip) this._positionTooltip();
        });
      }
    });
    this._gaugesObserver.observe(this);
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.has('_statsMap') || changed.has('_tooltip') || changed.has('_tooltipSource') || changed.has('_config') || changed.has('_info') || changed.has('_failedSrc') || changed.has('_gaugeCapacity')) return true;
    if (!this._config || !this.hass || !changed.has('hass')) return false;
    const old = changed.get('hass') as HomeAssistant | undefined;
    if (!old) return true;
    if (old.config?.latitude !== this.hass.config?.latitude || old.config?.longitude !== this.hass.config?.longitude ||
      old.config?.time_zone !== this.hass.config?.time_zone ||
      old.locale?.language !== this.hass.locale?.language || old.language !== this.hass.language) return true;
    const ids = new Set([this._config.entity]);
    if (this._config.battery_sensor) ids.add(this._config.battery_sensor);
    // Track configured metadata sensors even when absent, so a newly added sensor renders.
    for (const { type: key } of normalizeMetrics(this._config)) {
      const sensor = this._info?.[key]?.sensor;
      if (sensor) ids.add(sensor);
    }
    return [...ids].some((id) => old.states[id] !== this.hass!.states[id]);
  }

  private _moreInfo(entityId: string): void {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId }, bubbles: true, composed: true,
    }));
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const cfg = this._config;
    const tz = typeof this.hass.config?.time_zone === 'string' ? this.hass.config.time_zone : undefined;
    const plant = this.hass.states[cfg.entity];
    if (!plant) return html`<ha-card><div class="warning">Entity not available: ${cfg.entity}</div></ha-card>`;
    const compact = cfg.display_type === 'compact';
    const hideUnits = cfg.hide_units ?? false;
    const metrics = normalizeMetrics(cfg);
    const iconOverrides = Object.fromEntries(metrics.map(entry => [entry.type, resolveMetric(entry).icon ?? '']));
    const measurements = buildMeasurements(this._info, metrics.map(entry => entry.type), this.hass.states, iconOverrides);
    const tooltipIndex = this._tooltip ? Array.from(this.shadowRoot!.querySelectorAll('.gauge-btn')).indexOf(this._tooltip) : -1;
    const tooltipMeasurement = measurements[tooltipIndex];
    const tooltipText = tooltipMeasurement ? tooltipLines(tooltipMeasurement) : undefined;
    const n = measurements.length;
    const rows = Math.ceil(n / this._gaugeCapacity);
    const columns = n ? Math.ceil(n / rows) : 1;
    const problems = activeProblems(plant, measurements, cfg);
    const name = cfg.name || plant.attributes.friendly_name || cfg.entity;
    const subtitle = problems.length
      ? problems.map((problem) => problem.status === 'problem' ? problem.label : `${problem.label} ${problem.status}`).join(' · ')
      : !cfg.hide_species ? plant.attributes.species : undefined;
    const source: unknown = cfg.image ?? plant.attributes.entity_picture;
    const src = typeof source === 'string' && source ? source : undefined;
    if (src !== this._imageSrc) {
      this._imageSrc = src;
      // Reset without scheduling a second render: this render already uses the new src.
      this._failedSrc = undefined;
    }
    const batteryState = cfg.battery_sensor ? this.hass.states[cfg.battery_sensor] : undefined;
    const battery = batteryInfo(batteryState, cfg.battery_warn_level);
    return html`
      <ha-card class=${compact ? 'compact' : 'full'}>
        <div class=${`header ${cfg.hide_image ? 'no-image' : ''}`}>
          ${cfg.hide_image ? nothing : html`
            <button class="image-btn" type="button" aria-label=${`More information about ${name}`} @click=${() => this._moreInfo(cfg.entity)}>
              ${src && src !== this._failedSrc
                ? html`<img class="photo" src=${src} alt="" @error=${() => { this._failedSrc = src; }}>`
                : html`<span class="photo placeholder"><ha-icon icon="mdi:flower-outline" aria-hidden="true"></ha-icon></span>`}
              ${problems.length ? html`<span class="problem-badge" aria-label="Needs attention">
                <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
                  <rect x="8" y="4" width="2" height="6.5" rx="1"></rect>
                  <circle cx="9" cy="13.25" r="1.25"></circle>
                </svg>
              </span>` : nothing}
            </button>`}
          <button class="text-btn" type="button" aria-label=${`More information about ${name}`} @click=${() => this._moreInfo(cfg.entity)}>
            <span class="name" title=${name}>${name}</span>
            ${subtitle ? html`<span class=${`subtitle ${problems.length ? 'problems' : ''}`} title=${subtitle}>${subtitle}</span>` : nothing}
          </button>
          ${batteryState ? html`
            <button class="battery" type="button" aria-label=${`Battery: ${battery.level === null ? 'unknown' : `${battery.level}%`}. More information`}
              @click=${(event: Event) => { event.stopPropagation(); this._moreInfo(cfg.battery_sensor!); }}>
              <mpl-battery .level=${battery.level} .tone=${battery.tone}></mpl-battery>
            </button>` : nothing}
        </div>
        ${!compact && measurements.length ? html`<div class="tiles">${measurements.map((m) => {
          const r = resolveMetric(metrics.find(entry => entry.type === m.key)!);
          const now = Date.now();
          const cumulative = this._isCumulative(m.sensor);
          const lat = this.hass!.config?.latitude;
          const lon = this.hass!.config?.longitude;
          const start = periodStart(r.period, now, tz);
          const daylight = m.key === 'illuminance' && !cumulative && r.daylightOnly && Number.isFinite(lat) && Number.isFinite(lon);
          const events = daylight && now - start <= 3 * 86400000
            ? sunEvents(start, now, lat!, lon!, r.daylightOffset).map(event => ({
              t: event.t, icon: event.kind === 'sunrise' ? 'mdi:weather-sunset-up' : 'mdi:weather-sunset-down',
            })) : [];
          const keep = daylight ? (start: number, end: number) => isDaylight(start, end, lat!, lon!, r.daylightOffset) : undefined;
          const daylightNow = !keep || keep(now, now);
          const useFine = daylight && r.periodMs <= 7 * 86400000;
          const filtered: MetricHistory = cumulative
            ? summarizeDailyMax(m.sensor ? this._statsMap.cumulative[m.sensor] : undefined, { days: r.days, now, current: m.value, timeZone: tz })
            : summarizeHourly(m.sensor ? (useFine ? this._statsMap.fine : this._statsMap.hourly)[m.sensor] : undefined,
              { start, now, current: daylightNow ? m.value : null, keep });
          let history = filtered;
          if (filtered && r.display === 'graph') {
            const fineGraph = r.period === 'today' || r.period === '24h';
            const series = cumulative ? filtered.series : summarizeHourly(
              m.sensor ? (fineGraph ? this._statsMap.fine : this._statsMap.hourly)[m.sensor] : undefined,
              { start, now, current: m.value },
            ).series;
            const markerKeep = daylight ? (t: number) => isDaylight(t, t, lat!, lon!, r.daylightOffset) : undefined;
            history = { ...filtered, series, ...seriesExtremes(series, markerKeep) };
          }
          const problemTone = toneFor(m, problems);
          const tone = !cumulative && daylightNow && (m.status === 'low' || m.status === 'high') ? 'problem' : problemTone;
          const short = r.period === '24h' ? '24 h' : `${parseInt(r.period)} d`;
          const long = r.period === '24h' ? '24 h' : `${parseInt(r.period)} days`;
          const periodLabel = cumulative ? r.days === 1 ? 'Today' : `Daily max · ${r.days} d`
            : r.period === 'today' ? daylight ? 'Daylight · today' : 'Today' : `${daylight ? 'Daylight ·' : 'Last'} ${short}`;
          const periodText = cumulative ? r.days === 1 ? 'today' : `daily maximum, last ${r.days} days`
            : `${daylight ? 'daylight, ' : ''}${r.period === 'today' ? 'today' : `last ${long}`}`;
          return html`<div class=${`tile${problemTone === 'problem' ? ' problem' : ''}`} role="button" tabindex="0" aria-label=${describeWithStats(m, history?.stats ?? null, periodText)}
            @pointerover=${this._tilePointerOver} @pointerout=${this._tilePointerOut} @pointerleave=${this._tilePointerLeave}
            @pointerdown=${{ handleEvent: (event: PointerEvent) => this._tilePointerDown(event), capture: true }}
            @click=${() => this._moreInfo(m.sensor ?? cfg.entity)}
            @keydown=${(event: KeyboardEvent) => {
              if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
              if (event.key === ' ') event.preventDefault();
              this._moreInfo(m.sensor ?? cfg.entity);
            }}>
            <mpl-metric-row .measurement=${m} .tone=${tone} .display=${r.display} .history=${history} .events=${events}
              .graphStart=${cumulative ? undefined : start} .graphEnd=${cumulative ? undefined : now}
              .periodLabel=${periodLabel} .periodText=${periodText} .daily=${cumulative && r.days > 1}
               .locale=${this.hass!.locale?.language ?? this.hass!.language} .timeZone=${tz} .hideUnits=${hideUnits}></mpl-metric-row>
          </div>`;
        })}</div>` : nothing}
        ${compact && measurements.length ? html`<div class="gauges" style=${`--mpl-cols: ${columns}`}>${measurements.map((m) => html`
          <button class="gauge-btn" type="button" aria-label=${describeMeasurement(m)}
            @pointerdown=${this._gaugePointerDown} @pointerenter=${this._gaugePointerEnter} @pointerleave=${this._gaugePointerLeave}
            @focus=${this._gaugeFocus} @blur=${this._gaugeBlur}
            @contextmenu=${(event: Event) => event.preventDefault()}
            @click=${(event: MouseEvent) => this._gaugeClick(event, m.sensor ?? cfg.entity)}>
            <mpl-gauge .embedded=${true} .fraction=${m.fraction} .tone=${toneFor(m, problems)} .icon=${m.icon}
              .value=${hideUnits ? '' : formatValue(m.value, m.unit, hideUnits)} .label=${describeMeasurement(m)}></mpl-gauge>
          </button>`)}</div>` : nothing}
        ${compact && this._tooltip && tooltipText ? html`<div class="tooltip" role="tooltip" id="mpl-tooltip" data-source=${this._tooltipSource}
          @pointerenter=${this._tooltipPointerEnter} @pointerleave=${this._tooltipPointerLeave}>
          <span class="tooltip-title">${tooltipText[0]}</span>
          <span class="tooltip-body">${tooltipText[1]}</span>
        </div>` : nothing}
      </ha-card>`;
  }

  static styles = [themeTokens, css`
    :host { display: block; --mpl-tile-gap: 2px; --mpl-tile-margin: 12px; --mpl-tile-padding: 8px 12px; --mpl-tile-corner: 4px; --mpl-tile-outer-corner: 16px; }
    ha-card { position: relative; display: block; box-sizing: border-box; padding: 16px; background: var(--mpl-surface-bg); color: var(--mpl-on-surface); border-radius: var(--ha-card-border-radius, var(--mpl-shape-card)); }
    .tooltip { position: absolute; background: var(--mpl-inverse-surface); color: var(--mpl-inverse-on-surface); font-size: var(--md-sys-typescale-body-small-size, 12px); line-height: 16px; font-weight: 400; padding: 4px 8px; min-height: 24px; box-sizing: border-box; border-radius: var(--md-sys-shape-corner-extra-small, 4px); max-width: calc(100% - 16px); width: max-content; pointer-events: none; z-index: 2; animation: tooltip-enter 150ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }
    .tooltip[data-source='mouse'] { pointer-events: auto; }
    .tooltip-title, .tooltip-body { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tooltip-title { font-weight: 500; }
    @keyframes tooltip-enter { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .tooltip { animation: none; } }
    .header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; }
    .header.no-image { grid-template-columns: minmax(0, 1fr) auto; }
    button { appearance: none; border: 0; margin: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
    button:focus-visible, .tile:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .image-btn { position: relative; width: 56px; height: 56px; border-radius: var(--mpl-shape-full); }
    .photo { display: block; width: 100%; height: 100%; object-fit: cover; mask-image: ${unsafeCSS(cookieMask)}; -webkit-mask-image: ${unsafeCSS(cookieMask)}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; }
    .placeholder { display: grid; place-items: center; background: var(--mpl-secondary-container); color: var(--mpl-on-secondary-container); }
    .problem-badge { position: absolute; bottom: 0; right: 0; display: grid; place-items: center; width: 18px; height: 18px; border-radius: var(--mpl-shape-full); background: var(--mpl-error); box-shadow: 0 0 0 2px var(--mpl-surface-bg); }
    .problem-badge svg { display: block; width: 18px; height: 18px; fill: var(--mpl-on-error); }
    .text-btn { min-width: 0; min-height: 44px; padding: 6px 6px; margin: -6px -6px -6px -6px; text-align: left; border-radius: 12px; }
    .name, .subtitle { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .name { font-size: 16px; font-weight: 500; line-height: 24px; color: var(--mpl-on-surface); }
    .subtitle { font-size: 14px; line-height: 20px; color: var(--mpl-on-surface-variant); }
    .problems { color: var(--mpl-error); }
    .battery { position: relative; display: inline-flex; align-items: center; padding: 4px; border-radius: 8px; }
    /* The 30x15 glyph plus padding stays bare; the invisible hit area is 44x44. */
    .battery::before { content: ''; position: absolute; width: max(100%, 44px); height: max(100%, 44px); left: 50%; top: 50%; transform: translate(-50%, -50%); }
    .gauges { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; margin-top: 12px; }
    .gauge-btn { flex: 0 0 calc((100% - (var(--mpl-cols) - 1) * 4px) / var(--mpl-cols)); display: grid; justify-items: center; min-width: 0; min-height: 44px; border-radius: 12px; }
    .gauge-btn:hover, .text-btn:hover, .battery:hover { background: color-mix(in srgb, var(--mpl-on-surface) 8%, transparent); }
    .gauge-btn { -webkit-touch-callout: none; user-select: none; touch-action: manipulation; }
    .gauge-btn:active, .text-btn:active { background: color-mix(in srgb, var(--mpl-on-surface) 12%, transparent); }
    .tiles { display: flex; flex-direction: column; gap: var(--mpl-tile-gap); margin-top: var(--mpl-tile-margin); }
    .tile { position: relative; box-sizing: border-box; width: 100%; text-align: left; cursor: pointer; padding: var(--mpl-tile-padding); background: var(--mpl-surface-container-high); border-radius: var(--mpl-tile-corner); --mpl-range-bar-ring: var(--mpl-surface-container-high); }
    .tile::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: var(--mpl-on-surface); opacity: 0; pointer-events: none; transition: opacity 150ms; }
    .tile.problem { background: linear-gradient(to right, var(--mpl-surface-container-high) 45%, color-mix(in srgb, var(--mpl-error-container) 40%, var(--mpl-surface-container-high))); }
    .tile:first-child { border-top-left-radius: var(--mpl-tile-outer-corner); border-top-right-radius: var(--mpl-tile-outer-corner); }
    .tile:last-child { border-bottom-left-radius: var(--mpl-tile-outer-corner); border-bottom-right-radius: var(--mpl-tile-outer-corner); }
    /* Touch can leave a sticky :hover after scrubbing; only hover-capable inputs get this layer. */
    @media (hover: hover) {
      .tile:hover:not(.graph-active)::after { opacity: 0.08; }
    }
    .tile:active:not(.graph-active)::after { opacity: 0.12; }
    @media (prefers-reduced-motion: reduce) { .tile::after { transition: none; } }
    .warning { color: var(--mpl-error); }
  `];
}

declare global {
  interface HTMLElementTagNameMap { 'material-plant-card': MaterialPlantCard; }
}
if (!customElements.get(CARD_NAME)) customElements.define(CARD_NAME, MaterialPlantCard);
const cardWindow = window as Window & { customCards?: Record<string, unknown>[] };
cardWindow.customCards ??= [];
if (!cardWindow.customCards.some((card) => card.type === CARD_NAME)) {
  cardWindow.customCards.push({
    type: CARD_NAME, name: CARD_DISPLAY_NAME, description: CARD_DESCRIPTION, preview: true,
    documentationURL: 'https://github.com/lageorgem/ha-material-plant-card',
  });
}
console.info(`${CARD_DISPLAY_NAME} v${CARD_VERSION}`);
