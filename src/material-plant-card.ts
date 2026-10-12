import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { CARD_NAME, CARD_DISPLAY_NAME, CARD_DESCRIPTION, CARD_VERSION } from './const';
import { DEFAULT_GAUGES, type MaterialPlantCardConfig, type PlantInfo } from './types';
import { buildMeasurements, activeProblems, toneFor, formatValue, describeMeasurement, batteryInfo } from './calc/measurements';
import { configForm } from './config-form';
import { themeTokens } from './theme';
import './gauge/plant-gauge';
import './battery/battery-glyph';

const REFRESH_INTERVAL = 5000;
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
  private _gaugesObserver?: ResizeObserver;
  private _gaugesFrame?: number;
  private _imageSrc?: string;
  private _lastFetch = -Infinity;
  private _request = 0;
  private _inFlight?: number;
  private _timer?: ReturnType<typeof setTimeout>;
  private _pending = false;
  @state() private _tooltip?: HTMLButtonElement;
  private _tooltipShowTimer?: ReturnType<typeof setTimeout>;
  private _tooltipHideTimer?: ReturnType<typeof setTimeout>;
  private _press?: { button: HTMLButtonElement; id: number; x: number; y: number; long: boolean };
  private _suppressClick?: HTMLButtonElement;

  private _hideTooltip = (): void => {
    clearTimeout(this._tooltipShowTimer);
    clearTimeout(this._tooltipHideTimer);
    this._tooltipShowTimer = undefined;
    this._tooltipHideTimer = undefined;
    this._tooltip = undefined;
  };

  private _dismissTooltip = (): void => {
    this._hideTooltip();
    this._press = undefined;
  };

  private _tooltipKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this._dismissTooltip();
  };

  private _gaugePointerDown(event: PointerEvent): void {
    this._dismissTooltip();
    this._suppressClick = undefined;
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    const button = event.currentTarget as HTMLButtonElement;
    const press = { button, id: event.pointerId, x: event.clientX, y: event.clientY, long: false };
    this._press = press;
    this._tooltipShowTimer = setTimeout(() => {
      this._tooltipShowTimer = undefined;
      press.long = true;
      this._suppressClick = button;
      this._tooltip = button;
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
    if (press.long) this._tooltipHideTimer = setTimeout(this._hideTooltip, 1500);
  };

  private _gaugePointerCancel = (event: PointerEvent): void => {
    if (event.pointerId === this._press?.id) this._dismissTooltip();
  };

  private _gaugePointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this._dismissTooltip();
    const button = event.currentTarget as HTMLButtonElement;
    this._tooltipShowTimer = setTimeout(() => {
      this._tooltipShowTimer = undefined;
      this._tooltip = button;
    }, 500);
  }

  private _gaugePointerLeave(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this._hideTooltip();
  }

  private _gaugeFocus(event: FocusEvent): void {
    const button = event.currentTarget as HTMLButtonElement;
    if (!button.matches(':focus-visible')) return;
    this._dismissTooltip();
    this._tooltip = button;
  }

  private _gaugeClick(event: MouseEvent, entity: string): void {
    if (event.currentTarget === this._suppressClick) {
      this._suppressClick = undefined;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this._moreInfo(entity);
  }

  protected updated(): void {
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
    this._config = { ...config, show_bars: config.show_bars ? [...config.show_bars] : undefined };
    this._dismissTooltip();
    if (changedEntity) {
      this._info = undefined;
      // Invalidate the old entity even when hass has not arrived yet.
      this._request++;
      this._queueFetch();
    }
  }

  public getCardSize(): number { return this._config?.display_type === 'compact' ? 3 : 4; }
  public getGridOptions(): { columns: number; min_columns: number; rows: 'auto' } {
    return { columns: 6, min_columns: 4, rows: 'auto' };
  }
  public static getConfigForm(): typeof configForm { return configForm; }
  public static getStubConfig(hass: HomeAssistant): MaterialPlantCardConfig {
    return {
      type: `custom:${CARD_NAME}`,
      entity: Object.keys(hass.states).find((id) => id.startsWith('plant.')) ?? 'plant.my_plant',
      show_bars: [...DEFAULT_GAUGES],
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
    this._observeGauges();
    window.addEventListener('pointermove', this._gaugePointerMove, true);
    window.addEventListener('pointerup', this._gaugePointerUp, true);
    window.addEventListener('pointercancel', this._gaugePointerCancel, true);
    window.addEventListener('scroll', this._dismissTooltip, true);
    this.addEventListener('scroll', this._dismissTooltip, true);
    window.addEventListener('keydown', this._tooltipKeydown, true);
  }
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._dismissTooltip();
    this._suppressClick = undefined;
    window.removeEventListener('pointermove', this._gaugePointerMove, true);
    window.removeEventListener('pointerup', this._gaugePointerUp, true);
    window.removeEventListener('pointercancel', this._gaugePointerCancel, true);
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
        if (capacity === this._gaugeCapacity) continue;
        // Host height can change with the rows. Defer writes beyond observer delivery.
        this._gaugesFrame = requestAnimationFrame(() => {
          this._gaugesFrame = undefined;
          if (this.isConnected && capacity !== this._gaugeCapacity) this._gaugeCapacity = capacity;
        });
      }
    });
    this._gaugesObserver.observe(this);
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.has('_tooltip') || changed.has('_config') || changed.has('_info') || changed.has('_failedSrc') || changed.has('_gaugeCapacity')) return true;
    if (!this._config || !this.hass || !changed.has('hass')) return false;
    const old = changed.get('hass') as HomeAssistant | undefined;
    if (!old) return true;
    const ids = new Set([this._config.entity]);
    if (this._config.battery_sensor) ids.add(this._config.battery_sensor);
    // Track configured metadata sensors even when absent, so a newly added sensor renders.
    for (const key of this._config.show_bars ?? DEFAULT_GAUGES) {
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
    const plant = this.hass.states[cfg.entity];
    if (!plant) return html`<ha-card><div class="warning">Entity not available: ${cfg.entity}</div></ha-card>`;
    const compact = cfg.display_type === 'compact';
    const hideUnits = cfg.hide_units ?? compact;
    const measurements = buildMeasurements(this._info, cfg.show_bars ?? DEFAULT_GAUGES, this.hass.states);
    const tooltipIndex = this._tooltip ? Array.from(this.shadowRoot!.querySelectorAll('.gauge-btn')).indexOf(this._tooltip) : -1;
    const tooltipMeasurement = measurements[tooltipIndex];
    const n = measurements.length;
    const rows = Math.ceil(n / this._gaugeCapacity);
    const columns = n ? Math.ceil(n / rows) : 1;
    const problems = activeProblems(plant, measurements, cfg);
    const name = cfg.name || plant.attributes.friendly_name || cfg.entity;
    const subtitle = problems.length
      ? problems.map((problem) => problem.status === 'problem' ? problem.label : `${problem.label} ${problem.status}`).join(' · ')
      : !compact && !cfg.hide_species ? plant.attributes.species : undefined;
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
        ${measurements.length ? html`<div class="gauges" style=${`--mpl-cols: ${columns}`}>${measurements.map((m, index) => html`
          <button class="gauge-btn" type="button" aria-label=${describeMeasurement(m)}
            aria-describedby=${this._tooltip && this._tooltip === this.shadowRoot?.querySelectorAll('.gauge-btn')[index] ? 'mpl-tooltip' : nothing}
            @pointerdown=${this._gaugePointerDown} @pointerenter=${this._gaugePointerEnter} @pointerleave=${this._gaugePointerLeave}
            @focus=${this._gaugeFocus} @blur=${this._hideTooltip}
            @contextmenu=${(event: Event) => event.preventDefault()}
            @click=${(event: MouseEvent) => this._gaugeClick(event, m.sensor ?? cfg.entity)}>
            <mpl-gauge .embedded=${true} .fraction=${m.fraction} .tone=${toneFor(m, problems)} .icon=${m.icon}
              .value=${hideUnits ? '' : formatValue(m.value, m.unit, hideUnits)} .label=${describeMeasurement(m)}></mpl-gauge>
          </button>`)}</div>` : nothing}
        ${this._tooltip && tooltipMeasurement ? html`<div class="tooltip" role="tooltip" id="mpl-tooltip">${describeMeasurement(tooltipMeasurement)}</div>` : nothing}
      </ha-card>`;
  }

  static styles = [themeTokens, css`
    :host { display: block; }
    ha-card { position: relative; display: block; box-sizing: border-box; padding: 16px; background: var(--mpl-surface-bg); color: var(--mpl-on-surface); border-radius: var(--ha-card-border-radius, var(--mpl-shape-card)); }
    .tooltip { position: absolute; background: var(--mpl-inverse-surface); color: var(--mpl-inverse-on-surface); font-size: var(--md-sys-typescale-body-small-size, 12px); line-height: 16px; font-weight: 400; padding: 4px 8px; min-height: 24px; box-sizing: border-box; border-radius: var(--md-sys-shape-corner-extra-small, 4px); max-width: min(220px, calc(100% - 16px)); width: max-content; white-space: normal; overflow-wrap: anywhere; pointer-events: none; z-index: 2; animation: tooltip-enter 150ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }
    @keyframes tooltip-enter { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .tooltip { animation: none; } }
    .header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; align-items: center; }
    .header.no-image { grid-template-columns: minmax(0, 1fr) auto; }
    button { appearance: none; border: 0; margin: 0; padding: 0; background: none; color: inherit; font: inherit; cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--mpl-primary); outline-offset: 2px; }
    .image-btn { position: relative; width: 56px; height: 56px; border-radius: var(--mpl-shape-full); }
    .photo { display: block; width: 100%; height: 100%; object-fit: cover; mask-image: ${unsafeCSS(cookieMask)}; -webkit-mask-image: ${unsafeCSS(cookieMask)}; mask-size: 100% 100%; -webkit-mask-size: 100% 100%; }
    .placeholder { display: grid; place-items: center; background: var(--mpl-secondary-container); color: var(--mpl-on-secondary-container); }
    .problem-badge { position: absolute; bottom: 0; right: 0; display: grid; place-items: center; width: 18px; height: 18px; border-radius: var(--mpl-shape-full); background: var(--mpl-error); box-shadow: 0 0 0 2px var(--mpl-surface-bg); }
    .problem-badge svg { display: block; width: 18px; height: 18px; fill: var(--mpl-on-error); }
    .text-btn { min-width: 0; min-height: 44px; text-align: left; border-radius: 12px; }
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
    .compact .image-btn { width: 40px; height: 40px; }
    .compact .gauges { margin-top: 8px; }
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
