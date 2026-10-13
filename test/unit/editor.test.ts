import { expect, fixture, html } from '@open-wc/testing';
import type { HomeAssistant } from 'custom-card-helpers';
import { MaterialPlantCardEditor } from '../../src/editor';
import '../../src/editor';
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS, DEFAULT_ICONS, type MaterialPlantCardConfig } from '../../src/types';

const base: MaterialPlantCardConfig = { type: 'custom:material-plant-card', entity: 'plant.test' };
type Form = HTMLElement & {
  data: Record<string, unknown>;
  schema: { name: string; selector?: Record<string, unknown>; schema?: Form['schema']; flatten?: boolean; title?: string }[];
  computeLabel: (field: { name: string }) => string;
  computeHelper: (field: { name: string }) => string;
};
async function setup(config: MaterialPlantCardConfig = base) {
  const el = await fixture<MaterialPlantCardEditor>(html`<material-plant-card-editor></material-plant-card-editor>`);
  el.hass = { states: {}, localize: (key: string) => key } as unknown as HomeAssistant;
  el.setConfig(config);
  await el.updateComplete;
  return el;
}
async function click(el: MaterialPlantCardEditor, selector: string) {
  (el.shadowRoot!.querySelector(selector) as HTMLButtonElement).click();
  await el.updateComplete;
}
async function emitted(el: MaterialPlantCardEditor, action: () => void) {
  let event: CustomEvent<{ config: MaterialPlantCardConfig }> | undefined;
  el.addEventListener('config-changed', (e) => { event = e as typeof event; }, { once: true });
  action();
  expect(event, 'config-changed emitted synchronously').not.to.equal(undefined);
  expect(event!.bubbles).to.equal(true);
  expect(event!.composed).to.equal(true);
  expect(Object.keys(event!.detail)).to.deep.equal(['config']);
  await el.updateComplete;
  return event!.detail.config;
}
async function change(el: MaterialPlantCardEditor, form: Form, value: Record<string, unknown>) {
  let leaked = false;
  const listener = () => { leaked = true; };
  el.addEventListener('value-changed', listener);
  const config = await emitted(el, () => form.dispatchEvent(new CustomEvent('value-changed', {
    detail: { value }, bubbles: true, composed: true,
  })));
  el.removeEventListener('value-changed', listener);
  expect(leaked).to.equal(false);
  return config;
}
describe('material-plant-card-editor', () => {
  it('exposes the top schema, flattened Appearance, labels and helpers', async () => {
    const el = await setup();
    const form = el.shadowRoot!.querySelector('ha-form') as Form;
    expect(form.schema.map(s => s.name)).to.deep.equal(['entity', 'name', 'battery_sensor', 'display_type', '']);
    expect(form.schema[0]).to.include({ required: true });
    expect(form.schema[0].selector).to.deep.equal({ entity: { domain: 'plant' } });
    expect(form.schema[2].selector).to.deep.equal({ entity: { domain: 'sensor', device_class: 'battery' } });
    expect(form.schema[3].selector).to.deep.equal({ select: { mode: 'dropdown', options: [
      { value: 'full', label: 'Full' }, { value: 'compact', label: 'Compact' },
    ] } });
    const appearance = form.schema[4];
    expect(appearance).to.include({ title: 'Appearance', flatten: true });
    expect(appearance.schema!.map(s => s.name)).to.deep.equal(['hide_species', 'hide_image', 'hide_units', 'image', 'battery_warn_level']);
    for (const field of [...form.schema.slice(0, 4), ...appearance.schema!]) expect(form.computeLabel(field)).not.to.equal(field.name);
    expect(form.data).to.include({ display_type: 'full', hide_units: false, battery_warn_level: 10 });
  });
  it('preserves unknown keys and legacy show_bars on top-level edits without mutating input', async () => {
    const original = { ...base, show_bars: ['moisture'], name: 'Old', custom: { keep: true } };
    const el = await setup(original);
    const next = await change(el, el.shadowRoot!.querySelector('ha-form') as Form, { name: 'New', image: '' });
    expect(next).to.include({ name: 'New', custom: original.custom });
    expect(next.show_bars).to.deep.equal(['moisture']);
    expect(next).not.to.have.property('image');
    expect(next).not.to.have.property('metrics');
    expect(original.name).to.equal('Old');
  });
  for (const display_type of [undefined, 'full'] as const) it(`hides compact layout for ${display_type ?? 'default'} display`, async () => {
    const el = await setup({ ...base, display_type });
    const form = el.shadowRoot!.querySelector('ha-form') as Form;
    expect(form.schema.some(field => field.title === 'Compact layout')).to.equal(false);
    const fields = form.schema.flatMap(field => field.schema ?? [field]);
    expect(fields.map(field => field.name)).not.to.include('gauges_per_row');
    expect(fields.map(field => field.name)).not.to.include('gauge_size');
  });
  it('exposes flattened compact layout selectors, labels, helpers and configured values', async () => {
    const el = await setup({ ...base, display_type: 'compact', gauges_per_row: 3, gauge_size: 52 });
    const form = el.shadowRoot!.querySelector('ha-form') as Form;
    const layout = form.schema.find(field => field.title === 'Compact layout');
    expect(layout).to.include({ type: 'expandable', icon: 'mdi:view-grid-outline', flatten: true });
    expect(layout!.schema).to.deep.equal([
      { name: 'gauges_per_row', selector: { number: { min: 1, max: 12, step: 1, mode: 'box' } } },
      { name: 'gauge_size', selector: { number: { min: 32, max: 96, step: 4, mode: 'slider', unit_of_measurement: 'px' } } },
    ]);
    expect(form.computeLabel({ name: 'gauges_per_row' })).to.equal('Gauges per row');
    expect(form.computeLabel({ name: 'gauge_size' })).to.equal('Gauge size');
    expect(form.computeHelper({ name: 'gauges_per_row' })).to.equal('Leave empty to balance rows automatically.');
    expect(form.computeHelper({ name: 'gauge_size' })).to.equal('Default 44 px.');
    expect(form.data).to.include({ gauges_per_row: 3, gauge_size: 52 });
  });
  it('updates compact values immutably and removes cleared gauges per row', async () => {
    const original = { ...base, display_type: 'compact' as const, gauges_per_row: 3, gauge_size: 52 };
    const el = await setup(original);
    const form = el.shadowRoot!.querySelector('ha-form') as Form;
    const next = await change(el, form, { gauges_per_row: 4, gauge_size: 60 });
    expect(next).to.include({ gauges_per_row: 4, gauge_size: 60 });
    expect(form.data).to.include({ gauges_per_row: 4, gauge_size: 60 });
    for (const value of ['', null, undefined]) {
      await change(el, form, { gauges_per_row: 4 });
      const cleared = await change(el, form, { gauges_per_row: value });
      expect(cleared).not.to.have.property('gauges_per_row');
      expect(cleared).to.include({ gauge_size: 60 });
    }
    expect(original).to.include({ gauges_per_row: 3, gauge_size: 52 });
  });
  it('updates compact layout visibility when display type changes', async () => {
    const el = await setup();
    const form = el.shadowRoot!.querySelector('ha-form') as Form;
    await change(el, form, { display_type: 'compact' });
    expect(form.schema.some(field => field.title === 'Compact layout')).to.equal(true);
    await change(el, form, { display_type: 'full' });
    expect(form.schema.some(field => field.title === 'Compact layout')).to.equal(false);
  });
  it('adds only missing metrics, appends a bare type and expands one row', async () => {
    const el = await setup({ ...base, metrics: [{ type: 'moisture' }] });
    await click(el, '.add-btn');
    const options = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.add-opt')];
    expect(options.map(o => o.dataset.type)).to.deep.equal(MEASUREMENT_KEYS.filter(k => k !== 'moisture'));
    for (const option of options) {
      const key = option.dataset.type as typeof MEASUREMENT_KEYS[number];
      expect(option.textContent).to.include(MEASUREMENT_LABELS[key]);
      expect(option.querySelector('ha-icon')!.getAttribute('icon')).to.equal(DEFAULT_ICONS[key]);
    }
    const next = await emitted(el, () => options[0].click());
    expect(next.metrics).to.deep.equal([{ type: 'moisture' }, { type: 'conductivity' }]);
    expect(el.shadowRoot!.querySelectorAll('.metric-editor')).to.have.length(1);
    expect(el.shadowRoot!.querySelectorAll('.metric')[1].querySelector('.metric-editor')).not.to.equal(null);
    expect(el.shadowRoot!.querySelector('.add-menu')).to.equal(null);
    await click(el, '[aria-label="Edit metric"]');
    expect(el.shadowRoot!.querySelectorAll('.metric-editor')).to.have.length(1);
    await click(el, '[aria-label="Edit metric"]');
    expect(el.shadowRoot!.querySelector('.metric-editor')).to.equal(null);
  });
  it('hides Add when all ten metrics are present; deletion restores it', async () => {
    const el = await setup({ ...base, metrics: MEASUREMENT_KEYS.map(type => ({ type })) });
    expect(el.shadowRoot!.querySelector('.add-btn')).to.equal(null);
    const next = await emitted(el, () => (el.shadowRoot!.querySelector('[aria-label="Delete metric"]') as HTMLButtonElement).click());
    expect(next.metrics).to.have.length(9);
    await click(el, '.add-btn');
    expect(el.shadowRoot!.querySelectorAll('.add-opt')).to.have.length(1);
    expect(el.shadowRoot!.querySelector<HTMLButtonElement>('.add-opt')!.dataset.type).to.equal('moisture');
  });
  it('migrates show_bars on reorder, stops propagation and ignores invalid indices', async () => {
    const original = { ...base, show_bars: ['dli', 'moisture'] };
    const el = await setup(original);
    const sortable = el.shadowRoot!.querySelector('ha-sortable')!;
    expect(sortable.getAttribute('handle-selector')).to.equal('.handle');
    let leaked = false;
    el.addEventListener('item-moved', () => { leaked = true; });
    const next = await emitted(el, () => sortable.dispatchEvent(new CustomEvent('item-moved', {
      detail: { oldIndex: 0, newIndex: 1 }, bubbles: true, composed: true,
    })));
    expect(next.metrics).to.deep.equal([{ type: 'moisture' }, { type: 'dli' }]);
    expect(next).not.to.have.property('show_bars');
    expect(original.show_bars).to.deep.equal(['dli', 'moisture']);
    expect(leaked).to.equal(false);
    let writes = 0;
    el.addEventListener('config-changed', () => writes++);
    for (const index of [-1, 2, 0.5]) sortable.dispatchEvent(new CustomEvent('item-moved', { detail: { oldIndex: index, newIndex: 0 } }));
    expect(writes).to.equal(0);
  });
  it('migrates on add, delete and metric settings edits', async () => {
    for (const action of ['add', 'delete', 'edit']) {
      const el = await setup({ ...base, show_bars: ['moisture'] });
      let next: MaterialPlantCardConfig;
      if (action === 'edit') {
        await click(el, '[aria-label="Edit metric"]');
        next = await change(el, el.shadowRoot!.querySelector('.metric-editor ha-form') as Form, { display: 'graph' });
      } else {
        if (action === 'add') await click(el, '.add-btn');
        next = await emitted(el, () => (el.shadowRoot!.querySelector(action === 'add' ? '.add-opt' : '[aria-label="Delete metric"]') as HTMLButtonElement).click());
      }
      expect(next).to.have.property('metrics');
      expect(next).not.to.have.property('show_bars');
    }
  });
  for (const type of MEASUREMENT_KEYS) it(`provides ${type} schema, defaults and helpers`, async () => {
    const el = await setup({ ...base, metrics: [{ type }] });
    await click(el, '[aria-label="Edit metric"]');
    const form = el.shadowRoot!.querySelector('.metric-editor ha-form') as Form;
    expect(form.schema.map(s => s.name)).to.deep.equal([
      'icon', 'display', 'problem_trigger', type === 'dli' ? 'days' : 'period',
      ...(type === 'illuminance' ? ['daylight_only', 'daylight_offset'] : []),
    ]);
    expect(form.data).to.include({ display: 'summary', problem_trigger: 'plant' });
    expect(form.data[type === 'dli' ? 'days' : 'period']).to.equal(type === 'dli' ? 7 : 'today');
    expect(form.computeHelper({ name: 'problem_trigger' })).to.equal('Independent of the plant monitor unless set to Follow plant monitor.');
    expect(form.computeHelper({ name: 'days' })).to.equal('DLI uses the maximum value of each day.');
    expect(form.computeHelper({ name: 'daylight_offset' })).to.equal('Minutes after sunrise and before sunset to ignore (default 30).');
    if (type === 'illuminance') expect(form.data).to.include({ daylight_only: true, daylight_offset: 30 });
  });
  it('patches the right metric, prunes defaults, preserves unknown entry fields immutably', async () => {
    const metrics = [{ type: 'moisture' }, { type: 'illuminance', display: 'graph' as const, icon: 'mdi:sun', custom: 42 }];
    const el = await setup({ ...base, metrics });
    await click(el, '.metric:nth-child(2) [aria-label="Edit metric"]');
    const form = el.shadowRoot!.querySelector('.metric-editor ha-form') as Form;
    const next = await change(el, form, { ...form.data, display: 'summary', icon: '', daylight_only: true, daylight_offset: 30, period: 'today', problem_trigger: 'plant' });
    expect(next.metrics).to.deep.equal([{ type: 'moisture' }, { type: 'illuminance', custom: 42 }]);
    const edited = await change(el, form, { daylight_only: false, daylight_offset: 45, period: '7d', problem_trigger: 'high' });
    expect(edited.metrics![1]).to.include({ daylight_only: false, daylight_offset: 45, period: '7d', problem_trigger: 'high' });
    expect(metrics[1]).to.include({ display: 'graph', icon: 'mdi:sun' });
  });
  it('prunes default days and shows resolved summaries, labels and icons', async () => {
    const el = await setup({ ...base, metrics: [
      { type: 'moisture' }, { type: 'dli', display: 'graph', days: 7 }, { type: 'illuminance' },
      { type: 'future', period: '24h', icon: 'mdi:leaf' },
    ] });
    expect([...el.shadowRoot!.querySelectorAll('.metric-title .hint')].map(e => e.textContent)).to.deep.equal([
      'Summary · Today', 'Graph · Daily max 7 d', 'Summary · Daylight · Today', 'Summary · Last 24 hours',
    ]);
    expect(el.shadowRoot!.querySelectorAll('.metric-title > div')[6].textContent).to.equal('future');
    await click(el, '.metric:nth-child(2) [aria-label="Edit metric"]');
    const next = await change(el, el.shadowRoot!.querySelector('.metric-editor ha-form') as Form, { days: 7 });
    expect(next.metrics![1]).to.deep.equal({ type: 'dli', display: 'graph' });
  });
  it('shows an empty state and supports keyboard reorder on the drag handle', async () => {
    const el = await setup({ ...base, metrics: [] });
    expect(el.shadowRoot!.textContent).to.include('No metrics yet. Add a metric below.');
    el.setConfig({ ...base, metrics: [{ type: 'moisture' }, { type: 'dli' }] });
    await el.updateComplete;
    const handle = el.shadowRoot!.querySelector('.handle')!;
    expect(handle.getAttribute('tabindex')).to.equal('0');
    const next = await emitted(el, () => handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    expect(next.metrics).to.deep.equal([{ type: 'dli' }, { type: 'moisture' }]);
  });
});
