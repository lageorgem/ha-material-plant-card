import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import type { HomeAssistant } from 'custom-card-helpers';
import { MaterialPlantCard } from '../../src/material-plant-card';
import { DEFAULT_GAUGES, type MaterialPlantCardConfig, type PlantInfo } from '../../src/types';
import { configForm } from '../../src/config-form';

const ENTITY = 'plant.test';
const BATTERY = 'sensor.battery';
const IMAGE = '/test/fixtures/plant.svg';
type TestState = { state: string; attributes: Record<string, unknown>; last_updated: string };
const state = (value = 'ok', attributes: Record<string, unknown> = {}, updated = '0'): TestState =>
  ({ state: value, attributes, last_updated: updated });
const cfg = (overrides: Partial<MaterialPlantCardConfig> = {}): MaterialPlantCardConfig =>
  ({ type: 'custom:material-plant-card', entity: ENTITY, ...overrides });
const info: PlantInfo = Object.fromEntries(DEFAULT_GAUGES.map((key) => [key, {
  min: 10, max: 50, current: 25, sensor: `sensor.${key}`, unit_of_measurement: '%',
}]));
function fakeHass(data: PlantInfo = info) {
  const states: Record<string, TestState> = {
    [ENTITY]: state('ok', { friendly_name: 'Orchid', species: 'Phalaenopsis' }),
    [BATTERY]: state('19'),
    ...Object.fromEntries(DEFAULT_GAUGES.map((key) => [`sensor.${key}`, state('25')])),
  };
  const callWS = sinon.stub().resolves({ result: data });
  return { states, callWS };
}
type FakeHass = ReturnType<typeof fakeHass>;
function assign(card: MaterialPlantCard, hass: FakeHass): void {
  card.hass = hass as unknown as HomeAssistant;
}
async function settle(card: MaterialPlantCard): Promise<void> {
  await Promise.resolve();
  await card.updateComplete;
  await Promise.resolve();
  await card.updateComplete;
}
async function settleLayout(card: MaterialPlantCard): Promise<void> {
  for (let frame = 0; frame < 3; frame++) {
    // Observer delivery and the deferred capacity write run in separate frames.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await settle(card);
  }
  for (const gauge of gauges(card)) await gauge.updateComplete;
}
async function mount(config = cfg(), hass = fakeHass()): Promise<MaterialPlantCard> {
  const card = await fixture<MaterialPlantCard>(html`<material-plant-card></material-plant-card>`);
  card.setConfig(config);
  assign(card, hass);
  await settle(card);
  return card;
}
const query = <T extends Element = HTMLElement>(card: MaterialPlantCard, selector: string): T =>
  card.shadowRoot!.querySelector<T>(selector)!;
const gauges = (card: MaterialPlantCard) => [...card.shadowRoot!.querySelectorAll('mpl-gauge')];

describe('material-plant-card', () => {
  afterEach(() => sinon.restore());

  it('validates plant entity configuration', () => {
    const card = new MaterialPlantCard();
    for (const entity of ['', 'sensor.test', undefined, 7]) {
      expect(() => card.setConfig({ ...cfg(), entity } as MaterialPlantCardConfig))
        .to.throw('Specify a plant entity');
    }
    expect(() => card.setConfig(cfg())).not.to.throw();
  });

  it('shows a single missing-entity warning', async () => {
    const hass = fakeHass();
    delete hass.states[ENTITY];
    const card = await mount(cfg(), hass);
    expect(query(card, '.warning').textContent).to.equal(`Entity not available: ${ENTITY}`);
    expect(query(card, 'ha-card').children.length).to.equal(1);
  });

  it('reads result and renders configured gauges in order, skipping absent keys', async () => {
    const hass = fakeHass();
    const card = await mount(cfg({ show_bars: ['temperature', 'missing', 'moisture'] }), hass);
    expect(hass.callWS.firstCall.args).to.deep.equal([{ type: 'plant/get_info', entity_id: ENTITY }]);
    expect(gauges(card).length).to.equal(2);
    expect(gauges(card)[0]).to.have.property('label').that.matches(/^Temperature:/);
    expect(gauges(card)[1]).to.have.property('label').that.matches(/^Moisture:/);
    expect(query(card, '.gauge-btn').getAttribute('title')).to.match(/^Temperature:/);
    card.setConfig(cfg({ show_bars: [] }));
    await settle(card);
    expect(gauges(card)).to.have.length(0);
  });

  it('uses explicit name, friendly name, then entity id (including empty name)', async () => {
    const hass = fakeHass();
    const card = await mount(cfg({ name: 'My plant' }), hass);
    expect(query(card, '.name').textContent).to.equal('My plant');
    card.setConfig(cfg({ name: '' }));
    await settle(card);
    expect(query(card, '.name').textContent).to.equal('Orchid');
    assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state() } });
    await settle(card);
    expect(query(card, '.name').textContent).to.equal(ENTITY);
  });

  it('embeds every gauge in a button named by its measurement description', async () => {
    const card = await mount();
    const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')];
    expect(buttons).to.have.length(DEFAULT_GAUGES.length);
    for (const button of buttons) {
      const gauge = button.querySelector('mpl-gauge')!;
      await gauge.updateComplete;
      expect(gauge.embedded).to.equal(true);
      expect(button.getAttribute('aria-label')).to.equal(gauge.label);
      expect(button.getAttribute('aria-label')).to.equal(button.getAttribute('title'));
      expect(gauge.shadowRoot!.querySelector('[role="meter"]')).to.equal(null);
    }
  });

  it('replaces species with problem text and shows badge only for problems', async () => {
    const hass = fakeHass();
    const card = await mount(cfg(), hass);
    expect(query(card, '.subtitle').textContent).to.equal('Phalaenopsis');
    expect(query(card, '.problem-badge')).to.equal(null);
    assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('problem', {
      species: 'Phalaenopsis', problems: [
        { sensor_type: 'moisture', status: 'Low' },
        { sensor_type: 'temperature', status: 'High' },
      ],
    }) } });
    await settle(card);
    expect(query(card, '.subtitle').textContent).to.equal('Moisture low · Temperature high');
    expect(query(card, '.problem-badge')).not.to.equal(null);
    const badge = query(card, '.problem-badge');
    const svg = badge.querySelector('svg')!;
    expect(svg).not.to.equal(null);
    expect(badge.querySelector('ha-icon')).to.equal(null);
    expect(badge.getAttribute('aria-label')).to.equal('Needs attention');
    const badgeBox = badge.getBoundingClientRect();
    const svgBox = svg.getBoundingClientRect();
    expect(svgBox.width).to.equal(18);
    expect(svgBox.height).to.equal(18);
    expect(svgBox.x + svgBox.width / 2).to.be.closeTo(badgeBox.x + badgeBox.width / 2, 0.5);
    expect(svgBox.y + svgBox.height / 2).to.be.closeTo(badgeBox.y + badgeBox.height / 2, 0.5);
    card.setConfig(cfg({ hide_species: true }));
    await settle(card);
    expect(query(card, '.subtitle').textContent).to.include('Moisture low');
    card.setConfig(cfg({ display_type: 'compact' }));
    await settle(card);
    expect(query(card, '.subtitle').textContent).to.include('Moisture low');
  });

  it('switches conflicting plant and gauge problems with problem_source', async () => {
    const hass = fakeHass();
    hass.states[ENTITY] = state('problem', {
      species: 'Phalaenopsis', problems: [{ sensor_type: 'moisture', status: 'High' }],
    });
    hass.states['sensor.moisture'] = state('5');
    hass.states['sensor.temperature'] = state('60');
    const card = await mount(cfg({ show_bars: ['moisture', 'temperature'], problem_source: 'plant' }), hass);
    expect(query(card, '.subtitle').textContent).to.equal('Moisture high');
    expect(query(card, '.problem-badge')).not.to.equal(null);
    expect(gauges(card)[0]).to.have.property('tone', 'problem');
    expect(gauges(card)[1]).to.have.property('tone', 'advisory');
    card.setConfig(cfg({ show_bars: ['moisture', 'temperature'], problem_source: 'gauges' }));
    await settle(card);
    expect(query(card, '.subtitle').textContent).to.equal('Moisture low · Temperature high');
    expect(query(card, '.problem-badge')).not.to.equal(null);
    expect(gauges(card)[0]).to.have.property('tone', 'problem');
    expect(gauges(card)[1]).to.have.property('tone', 'problem');
  });

  for (const source of ['plant', 'gauges'] as const) {
    it(`filters ${source} problem subtitles, badges and gauge tones with problem_sensors`, async () => {
      const hass = fakeHass();
      hass.states[ENTITY] = state('problem', { species: 'Phalaenopsis', problems: [
        { sensor_type: 'moisture', status: 'Low' },
        { sensor_type: 'temperature', status: 'High' },
      ] });
      hass.states['sensor.moisture'] = state('5');
      hass.states['sensor.temperature'] = state('60');
      const config = cfg({ show_bars: ['moisture', 'temperature'], problem_source: source });
      const card = await mount(config, hass);
      expect(gauges(card)[0]).to.have.property('tone', 'problem');
      expect(gauges(card)[1]).to.have.property('tone', 'problem');
      card.setConfig({ ...config, problem_sensors: ['temperature'] });
      await settle(card);
      expect(query(card, '.subtitle').textContent).to.equal('Temperature high');
      expect(query(card, '.problem-badge')).not.to.equal(null);
      expect(gauges(card)[0]).to.have.property('tone', 'advisory');
      expect(gauges(card)[1]).to.have.property('tone', 'problem');
      card.setConfig({ ...config, problem_sensors: ['illuminance'] });
      await settle(card);
      expect(query(card, '.subtitle').textContent).to.equal('Phalaenopsis');
      expect(query(card, '.problem-badge')).to.equal(null);
      expect(gauges(card)[0]).to.have.property('tone', 'advisory');
      expect(gauges(card)[1]).to.have.property('tone', 'advisory');
    });
  }

  it('hides species when requested and in compact mode', async () => {
    for (const config of [cfg({ hide_species: true }), cfg({ display_type: 'compact' })]) {
      expect(query(await mount(config), '.subtitle')).to.equal(null);
    }
  });

  for (const [value, tone, level] of [['49', 'ok', 49], ['10', 'ok', 10],
    ['8', 'low', 8], ['unknown', 'unknown', null]] as const) {
    it(`renders a bare ${tone} battery glyph for ${value}`, async () => {
      const hass = fakeHass();
      hass.states[BATTERY] = state(value);
      const card = await mount(cfg({ battery_sensor: BATTERY }), hass);
      const button = query(card, '.battery');
      const glyph = query(card, '.battery mpl-battery');
      expect(glyph).to.have.property('level', level);
      expect(glyph).to.have.property('tone', tone);
      expect(button.children).to.have.length(1);
      expect(button.querySelector('ha-icon')).to.equal(null);
      expect(button.querySelector('span')).to.equal(null);
      expect(button.hasAttribute('data-tone')).to.equal(false);
      expect(button.getAttribute('aria-label')).to.equal(`Battery: ${level === null ? 'unknown' : `${level}%`}. More information`);
      expect(getComputedStyle(button).backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    });
  }

  it('hides battery without an existing entity', async () => {
    expect(query(await mount(), '.battery')).to.equal(null);
    expect(query(await mount(cfg({ battery_sensor: 'sensor.missing' })), '.battery')).to.equal(null);
  });

  it('uses the configured battery warning level and ignores battery_ok_level', async () => {
    const hass = fakeHass();
    const card = await mount(cfg({ battery_sensor: BATTERY, battery_warn_level: 35, battery_ok_level: 60 }), hass);
    for (const [value, tone] of [['34', 'low'], ['35', 'ok'], ['59', 'ok'], ['60', 'ok']]) {
      assign(card, { ...hass, states: { ...hass.states, [BATTERY]: state(value) } });
      await settle(card);
      expect(query(card, '.battery mpl-battery'), `battery ${value}%`).to.have.property('tone', tone);
      expect(query(card, '.battery mpl-battery')).to.have.property('level', Number(value));
    }
  });

  it('dispatches composed more-info for plant, battery, sensor and sensorless gauge', async () => {
    const hass = fakeHass({ moisture: info.moisture, temperature: { min: 0, max: 40, current: 20 } });
    const card = await mount(cfg({ battery_sensor: BATTERY, show_bars: ['moisture', 'temperature'] }), hass);
    const events: CustomEvent<{ entityId: string }>[] = [];
    const clicks = sinon.spy();
    card.addEventListener('click', clicks);
    card.addEventListener('hass-more-info', (event) => events.push(event as CustomEvent<{ entityId: string }>));
    query(card, '.image-btn').click();
    query(card, '.text-btn').click();
    query(card, '.battery').click();
    expect(clicks.callCount).to.equal(2);
    card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn').forEach((button) => button.click());
    expect(events.map((event) => event.detail.entityId)).to.deep.equal([
      ENTITY, ENTITY, BATTERY, 'sensor.moisture', ENTITY,
    ]);
    expect(events.every((event) => event.bubbles && event.composed)).to.equal(true);
  });

  it('throttles state timestamp changes with exactly one trailing call', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    const card = await mount(cfg(), hass);
    await clock.tickAsync(1000);
    for (const timestamp of ['1', '2']) {
      assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, timestamp) } });
      await settle(card);
    }
    expect(hass.callWS.callCount).to.equal(1);
    await clock.tickAsync(3999);
    expect(hass.callWS.callCount).to.equal(1);
    await clock.tickAsync(1);
    await settle(card);
    expect(hass.callWS.callCount).to.equal(2);
    card.remove();
  });

  it('ignores stale responses after switching entity', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    let resolveOld!: (response: { result: PlantInfo }) => void;
    hass.callWS.onFirstCall().returns(new Promise((resolve) => { resolveOld = resolve; }));
    hass.states['plant.other'] = state('ok', { friendly_name: 'Other' });
    hass.callWS.onSecondCall().resolves({ result: { temperature: info.temperature } });
    const card = await mount(cfg(), hass);
    card.setConfig(cfg({ entity: 'plant.other' }));
    await clock.tickAsync(5000);
    await settle(card);
    resolveOld({ result: info });
    await settle(card);
    expect(gauges(card)).to.have.length(1);
    expect(gauges(card)[0]).to.have.property('label').that.matches(/^Temperature:/);
    card.remove();
  });

  for (const timing of ['during the throttle window', 'after the trailing response']) {
    it(`ignores an old same-entity response ${timing}`, async () => {
      const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      const hass = fakeHass({ temperature: info.temperature });
      let resolveOld!: (response: { result: PlantInfo }) => void;
      hass.callWS.onSecondCall().returns(new Promise((resolve) => { resolveOld = resolve; }));
      hass.callWS.onThirdCall().resolves({ result: { moisture: info.moisture } });
      const card = await mount(cfg(), hass);
      await clock.tickAsync(5000);
      assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, '1') } });
      await settle(card);
      expect(hass.callWS.callCount).to.equal(2);
      await clock.tickAsync(1000);
      assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, '2') } });
      await settle(card);
      if (timing === 'during the throttle window') {
        resolveOld({ result: { conductivity: info.conductivity } });
        await settle(card);
      }
      expect(hass.callWS.callCount).to.equal(2);
      expect(gauges(card)).to.have.length(1);
      expect(gauges(card)[0]).to.have.property('label').that.matches(/^Temperature:/);
      await clock.tickAsync(4000);
      await settle(card);
      expect(hass.callWS.callCount).to.equal(3);
      expect(hass.callWS.args.every(([request]) => request.entity_id === ENTITY)).to.equal(true);
      expect(gauges(card)).to.have.length(1);
      expect(gauges(card)[0]).to.have.property('label').that.matches(/^Moisture:/);
      if (timing === 'after the trailing response') {
        resolveOld({ result: { conductivity: info.conductivity } });
        await settle(card);
        expect(gauges(card)).to.have.length(1);
        expect(gauges(card)[0]).to.have.property('label').that.matches(/^Moisture:/);
      }
      card.remove();
    });
  }

  it('keeps last good info when a later request fails, including synchronous throws', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    const card = await mount(cfg(), hass);
    hass.callWS.onSecondCall().rejects(new Error('offline'));
    await clock.tickAsync(5000);
    assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, '1') } });
    await settle(card);
    expect(gauges(card)).to.have.length(6);
    hass.callWS.onThirdCall().throws(new Error('offline'));
    await clock.tickAsync(5000);
    expect(() => assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, '2') } })).not.to.throw();
    await settle(card);
    expect(gauges(card)).to.have.length(6);
    card.remove();
  });

  it('exposes sizing, grid, form and first-plant stub defaults', async () => {
    const card = await mount();
    expect(card.getCardSize()).to.equal(4);
    card.setConfig(cfg({ display_type: 'compact' }));
    expect(card.getCardSize()).to.equal(3);
    expect(card.getGridOptions()).to.deep.equal({ columns: 6, min_columns: 4, rows: 'auto' });
    expect(MaterialPlantCard.getConfigForm()).to.equal(configForm);
    expect(MaterialPlantCard.getStubConfig({ states: { 'light.first': state(), 'plant.first': state(), 'plant.second': state() } } as unknown as HomeAssistant))
      .to.deep.equal({ type: 'custom:material-plant-card', entity: 'plant.first', show_bars: [...DEFAULT_GAUGES] });
    expect(MaterialPlantCard.getStubConfig({ states: {} } as HomeAssistant).entity).to.equal('plant.my_plant');
  });

  it('hides gauge values in compact by default, with explicit override', async () => {
    const card = await mount(cfg({ display_type: 'compact' }));
    expect(gauges(card)[0]).to.have.property('value', '');
    card.setConfig(cfg({ display_type: 'compact', hide_units: false }));
    await settle(card);
    expect(gauges(card)[0]).to.have.property('value', '25%');
  });

  it('falls back to masked placeholder on image error and retries a new source', async () => {
    const card = await mount(cfg({ image: `${IMAGE}?first` }));
    query(card, 'img').dispatchEvent(new Event('error'));
    await settle(card);
    expect(query(card, 'img')).to.equal(null);
    expect(query(card, '.placeholder')).not.to.equal(null);
    card.setConfig(cfg({ image: `${IMAGE}?second` }));
    await settle(card);
    expect(query(card, 'img').getAttribute('src')).to.equal(`${IMAGE}?second`);
    card.setConfig(cfg({ hide_image: true }));
    await settle(card);
    expect(query(card, '.image-btn')).to.equal(null);
  });

  it('uses entity picture without rewriting relative paths, with config override', async () => {
    const hass = fakeHass();
    hass.states[ENTITY] = state('ok', { entity_picture: IMAGE });
    const card = await mount(cfg(), hass);
    expect(query(card, 'img').getAttribute('src')).to.equal(IMAGE);
    card.setConfig(cfg({ image: `${IMAGE}?override` }));
    await settle(card);
    expect(query(card, 'img').getAttribute('src')).to.equal(`${IMAGE}?override`);
  });

  it('uses live sensor values without refetching unchanged plant timestamps', async () => {
    const hass = fakeHass();
    const card = await mount(cfg(), hass);
    assign(card, { ...hass, states: { ...hass.states, 'sensor.moisture': state('5') } });
    await settle(card);
    expect(gauges(card)[0]).to.have.property('value', '5%');
    expect(gauges(card)[0]).to.have.property('tone', 'advisory');
    expect(hass.callWS.callCount).to.equal(1);
    expect(query(card, '.problem-badge')).to.equal(null);
  });

  it('cancels the trailing request when disconnected', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    const card = await mount(cfg(), hass);
    assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, '1') } });
    card.remove();
    await clock.tickAsync(5000);
    expect(hass.callWS.callCount).to.equal(1);
    expect(clock.countTimers()).to.equal(0);
    document.body.append(card);
    await settle(card);
    expect(hass.callWS.callCount).to.equal(2);
    expect(gauges(card)).to.have.length(6);
    card.remove();
  });

  it('defers initial detached configuration and hass until connected', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    const card = new MaterialPlantCard();
    card.setConfig(cfg());
    assign(card, hass);
    expect(hass.callWS.callCount).to.equal(0);
    expect(clock.countTimers()).to.equal(0);
    document.body.append(card);
    await settle(card);
    expect(hass.callWS.callCount).to.equal(1);
    expect(gauges(card)).to.have.length(6);
    card.remove();
  });

  for (const elapsed of [1000, 5000]) {
    it(`defers detached timestamp demand after ${elapsed}ms and respects the throttle on reconnect`, async () => {
      const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      const hass = fakeHass();
      const card = await mount(cfg(), hass);
      card.remove();
      await clock.tickAsync(elapsed);
      for (const timestamp of ['1', '2']) {
        assign(card, { ...hass, states: { ...hass.states, [ENTITY]: state('ok', {}, timestamp) } });
      }
      expect(hass.callWS.callCount).to.equal(1);
      expect(clock.countTimers()).to.equal(0);
      document.body.append(card);
      expect(hass.callWS.callCount).to.equal(elapsed < 5000 ? 1 : 2);
      await clock.tickAsync(5000 - elapsed);
      await settle(card);
      expect(hass.callWS.callCount).to.equal(2);
      expect(clock.countTimers()).to.equal(0);
      expect(gauges(card)).to.have.length(6);
      card.remove();
    });
  }

  it('defers detached entity changes and fetches only the latest configuration on reconnect', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    hass.states['plant.other'] = state();
    const card = await mount(cfg(), hass);
    card.remove();
    card.setConfig(cfg({ entity: 'plant.other' }));
    expect(hass.callWS.callCount).to.equal(1);
    expect(clock.countTimers()).to.equal(0);
    await clock.tickAsync(5000);
    card.setConfig(cfg());
    expect(hass.callWS.callCount).to.equal(1);
    expect(clock.countTimers()).to.equal(0);
    document.body.append(card);
    await settle(card);
    expect(hass.callWS.callCount).to.equal(2);
    expect(hass.callWS.lastCall.args).to.deep.equal([{ type: 'plant/get_info', entity_id: ENTITY }]);
    expect(gauges(card)).to.have.length(6);
    card.remove();
  });

  it('reconnects without refetching when there is no pending demand', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    const card = await mount(cfg(), hass);
    card.remove();
    assign(card, { ...hass, states: { ...hass.states, 'sensor.moisture': state('30') } });
    card.setConfig(cfg({ name: 'Moved plant' }));
    await clock.tickAsync(5000);
    document.body.append(card);
    await settle(card);
    expect(hass.callWS.callCount).to.equal(1);
    expect(clock.countTimers()).to.equal(0);
    expect(gauges(card)).to.have.length(6);
    expect(gauges(card)[0]).to.have.property('value', '30%');
    card.remove();
  });

  it('retries an invalidated in-flight request on reconnect', async () => {
    const clock = sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hass = fakeHass();
    let resolveOld!: (response: { result: PlantInfo }) => void;
    hass.callWS.onFirstCall().returns(new Promise((resolve) => { resolveOld = resolve; }));
    const card = await mount(cfg(), hass);
    card.remove();
    resolveOld({ result: { temperature: info.temperature } });
    await settle(card);
    expect(gauges(card)).to.have.length(0);
    expect(clock.countTimers()).to.equal(0);
    await clock.tickAsync(5000);
    document.body.append(card);
    await settle(card);
    expect(hass.callWS.callCount).to.equal(2);
    expect(gauges(card)).to.have.length(6);
    card.remove();
  });

  it('ignores unrelated entity changes but renders tracked plant, battery and sensor changes', async () => {
    let hass = fakeHass();
    const card = await mount(cfg({ battery_sensor: BATTERY }), hass);
    const updated = sinon.spy();
    card.addController({ hostUpdated: updated });
    hass = { ...hass, states: { ...hass.states, 'light.other': state('on') } };
    assign(card, hass);
    await settle(card);
    expect(updated.callCount).to.equal(0);
    for (const id of [ENTITY, BATTERY, 'sensor.moisture']) {
      hass = { ...hass, states: { ...hass.states, [id]: { ...hass.states[id] } } };
      assign(card, hass);
      await settle(card);
    }
    expect(updated.callCount).to.equal(3);
  });

  it('uses a gentle nine-lobe photo mask with approximately 12% radial depth', async () => {
    const card = await mount();
    const mask = getComputedStyle(query(card, '.photo')).maskImage;
    const svg = decodeURIComponent(mask.slice(mask.indexOf(',') + 1).replace(/"\)$/, ''));
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(document.documentElement.getAttribute('viewBox')).to.equal('0 0 100 100');
    const path = document.querySelector('path')!.getAttribute('d')!;
    const points = [...path.matchAll(/([\d.]+),([\d.]+)/g)];
    expect(points).to.have.length(180);
    const radii = points.map(([, x, y]) => Math.hypot(Number(x) - 50, Number(y) - 50));
    const max = Math.max(...radii);
    expect(max).to.be.closeTo(50, 0.001);
    expect(Math.min(...radii) / max).to.be.closeTo(0.88, 0.0001);
    expect(radii.filter((radius, index) => radius > radii[(index + 179) % 180] && radius > radii[(index + 1) % 180])).to.have.length(9);
  });

  for (const [width, count, columns] of [[327, 7, 4], [327, 8, 4], [327, 9, 5], [327, 10, 5], [240, 6, 3], [240, 5, 3]]) {
    it(`balances ${count} gauges into ${columns}+${count - columns} rows at ${width}px`, async () => {
      const container = await fixture<HTMLDivElement>(html`<div style=${`width:${width}px`}><material-plant-card></material-plant-card></div>`);
      const card = container.firstElementChild as MaterialPlantCard;
      const keys = Array.from({ length: count }, (_, index) => `measurement_${index}`);
      const data: PlantInfo = Object.fromEntries(keys.map((key) => [key, { min: 10, max: 50, current: 25 }]));
      card.setConfig(cfg({ show_bars: ['missing', ...keys] }));
      assign(card, fakeHass(data));
      await settleLayout(card);
      const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')];
      expect(buttons).to.have.length(count);
      const tops = buttons.map((button) => button.offsetTop);
      const rows = [...new Set(tops)];
      expect(rows).to.have.length(2);
      expect(tops.filter((top) => top === rows[0])).to.have.length(columns);
      expect(tops.filter((top) => top === rows[1])).to.have.length(count - columns);
      expect(query(card, '.gauges').style.getPropertyValue('--mpl-cols')).to.equal(String(columns));
      const bounds = query(card, '.gauges').getBoundingClientRect();
      const secondRow = buttons.filter((button) => button.offsetTop === rows[1]);
      const leftGap = secondRow[0].getBoundingClientRect().left - bounds.left;
      const rightGap = bounds.right - secondRow[secondRow.length - 1].getBoundingClientRect().right;
      expect(leftGap).to.be.closeTo(rightGap, 2);
    });
  }

  it('rebalances six gauges from one row to 3/3 when resized from 327px to 240px', async () => {
    const container = await fixture<HTMLDivElement>(html`<div style="width:327px"><material-plant-card></material-plant-card></div>`);
    const card = container.firstElementChild as MaterialPlantCard;
    card.setConfig(cfg());
    assign(card, fakeHass());
    await settleLayout(card);
    const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')];
    expect(new Set(buttons.map((button) => button.offsetTop)).size).to.equal(1);
    container.style.width = '240px';
    await settleLayout(card);
    const tops = buttons.map((button) => button.offsetTop);
    const rows = [...new Set(tops)];
    expect(rows).to.have.length(2);
    expect(tops.filter((top) => top === rows[0])).to.have.length(3);
    expect(tops.filter((top) => top === rows[1])).to.have.length(3);
    expect(gauges(card)).to.have.length(6);
    for (const gauge of gauges(card)) {
      await gauge.updateComplete;
      expect(gauge.getBoundingClientRect().right).to.be.at.most(container.getBoundingClientRect().right);
    }
  });

  it('fits six real gauges in one row at 327px and is at most 170px tall', async () => {
    const container = await fixture<HTMLDivElement>(html`<div style="width:327px"><material-plant-card></material-plant-card></div>`);
    const card = container.firstElementChild as MaterialPlantCard;
    card.setConfig(cfg());
    assign(card, fakeHass());
    await settleLayout(card);
    for (const gauge of gauges(card)) {
      await (gauge as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
    }
    const surface = query(card, 'ha-card');
    expect(gauges(card)).to.have.length(6);
    expect(surface.offsetHeight).to.be.greaterThan(100);
    expect(surface.offsetHeight).to.be.at.most(170);
    const tops = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')].map((button) => button.offsetTop);
    expect(new Set(tops).size).to.equal(1);
  });
});
