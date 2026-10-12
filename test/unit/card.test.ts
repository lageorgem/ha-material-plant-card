import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import type { HomeAssistant } from 'custom-card-helpers';
import { MaterialPlantCard } from '../../src/material-plant-card';
import { DEFAULT_GAUGES, type MaterialPlantCardConfig, type PlantInfo } from '../../src/types';
import { configForm } from '../../src/config-form';
import { describeWithStats, type MplMetricRow } from '../../src/full/metric-row';

const ENTITY = 'plant.test';
const BATTERY = 'sensor.battery';
const IMAGE = '/test/fixtures/plant.svg';
type TestState = { state: string; attributes: Record<string, unknown>; last_updated: string };
const state = (value = 'ok', attributes: Record<string, unknown> = {}, updated = '0'): TestState =>
  ({ state: value, attributes, last_updated: updated });
const cfg = (overrides: Partial<MaterialPlantCardConfig> = {}): MaterialPlantCardConfig =>
  ({ type: 'custom:material-plant-card', entity: ENTITY, display_type: 'compact', ...overrides });
const info: PlantInfo = Object.fromEntries(DEFAULT_GAUGES.map((key) => [key, {
  min: 10, max: 50, current: 25, sensor: `sensor.${key}`, unit_of_measurement: '%',
}]));
function fakeHass(data: PlantInfo = info) {
  const states: Record<string, TestState> = {
    [ENTITY]: state('ok', { friendly_name: 'Orchid', species: 'Phalaenopsis' }),
    [BATTERY]: state('19'),
    ...Object.fromEntries(DEFAULT_GAUGES.map((key) => [`sensor.${key}`, state('25')])),
  };
  const callWS = sinon.stub().callsFake(async (msg: Record<string, unknown>) => {
    if (msg.type === 'plant/get_info') return { result: data };
    if (msg.type === 'history/history_during_period') {
      return Object.fromEntries((msg.entity_ids as string[]).map((id) => [id,
        ['0', '2000', '4000'].map((s, index) => ({ s, lu: Date.now() / 1000 - (3 - index) * 3600 })),
      ]));
    }
    if (msg.type === 'recorder/statistics_during_period') {
      return Object.fromEntries((msg.statistic_ids as string[]).map((id) => [id, msg.period === 'day'
        ? [{ end: Date.now() - 86400000, change: 8 }, { end: Date.now(), change: 12 }, { end: Date.now() + 86400000, change: 0.7 }]
        : [{ min: 15, max: 35, mean: 25 }]]));
    }
    throw new Error(`Unexpected WebSocket request: ${String(msg.type)}`);
  });
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

  describe('full metric tiles and history', () => {
    const full = (overrides: Partial<MaterialPlantCardConfig> = {}) => cfg({ display_type: undefined, ...overrides });
    const rows = (card: MaterialPlantCard) => [...card.shadowRoot!.querySelectorAll<MplMetricRow>('mpl-metric-row')];
    const calls = (hass: FakeHass) => hass.callWS.getCalls().filter((call) => call.args[0].type === 'recorder/statistics_during_period');
    const daytimeCalls = (hass: FakeHass) => hass.callWS.getCalls().filter((call) => call.args[0].type === 'history/history_during_period');
    const clockForStats = () => sinon.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const illuminanceHass = (value = '0') => {
      const hass = fakeHass({ ...info, illuminance: { min: 2000, max: 30000, sensor: 'sensor.illuminance', unit_of_measurement: 'lx' } });
      hass.states['sensor.illuminance'] = state(value);
      return hass;
    };

    it('routes default illuminance only to daytime history and excludes current zero from its span', async () => {
      const hass = illuminanceHass();
      const card = await mount(full({ show_bars: ['moisture', 'illuminance'] }), hass);
      await settle(card);
      expect(calls(hass)).to.have.length(1);
      expect(calls(hass)[0].args[0].period).to.equal('hour');
      expect(calls(hass)[0].args[0].statistic_ids).to.deep.equal(['sensor.moisture']);
      expect(daytimeCalls(hass)).to.have.length(1);
      expect(daytimeCalls(hass)[0].args[0].entity_ids).to.deep.equal(['sensor.illuminance']);
      const row = rows(card)[1];
      expect(row.stats).to.deep.equal({ min: 2000, max: 4000, mean: 3000 });
      expect(row.measurement.value).to.equal(0);
      expect(row.tone).not.to.equal('problem');
      expect(row.periodLabel).to.equal('Daytime · 24 h');
      const button = card.shadowRoot!.querySelectorAll('.tile-btn')[1];
      expect(button.classList.contains('problem')).to.equal(false);
      expect(button.getAttribute('aria-label')).to.equal(describeWithStats(row.measurement, row.stats, 'daytime, last 24 h'));
      await row.updateComplete;
      expect(row.shadowRoot!.textContent).to.include('Daytime · 24 h');
      card.remove();
    });

    it('merges positive current illuminance into daytime history and keeps the out-of-bounds tone', async () => {
      const hass = illuminanceHass();
      const card = await mount(full({ show_bars: ['illuminance'] }), hass);
      await settle(card);
      assign(card, { ...hass, states: { ...hass.states, 'sensor.illuminance': state('1500') } });
      await settle(card);
      expect(rows(card)[0].stats).to.deep.equal({ min: 1500, max: 4000, mean: 3000 });
      expect(rows(card)[0].tone).to.equal('problem');
      expect(daytimeCalls(hass)).to.have.length(1);
      card.remove();
    });

    it('retains plant-reported illuminance problems for current zero', async () => {
      const hass = illuminanceHass();
      hass.states[ENTITY] = state('problem', { problems: [{ sensor_type: 'illuminance', status: 'Low' }] });
      const card = await mount(full({ show_bars: ['illuminance'] }), hass);
      await settle(card);
      expect(rows(card)[0].tone).to.equal('problem');
      expect(query(card, '.tile-btn').classList.contains('problem')).to.equal(true);
      expect(rows(card)[0].stats).to.deep.equal({ min: 2000, max: 4000, mean: 3000 });
      card.remove();
    });

    it('uses the previous hourly range, label and zero error tone when daytime filtering is disabled', async () => {
      const hass = illuminanceHass();
      const card = await mount(full({ show_bars: ['illuminance'], illuminance_daytime_only: false }), hass);
      await settle(card);
      expect(daytimeCalls(hass)).to.have.length(0);
      expect(calls(hass)).to.have.length(1);
      expect(calls(hass)[0].args[0].period).to.equal('hour');
      expect(calls(hass)[0].args[0].statistic_ids).to.deep.equal(['sensor.illuminance']);
      const row = rows(card)[0];
      expect(row.stats).to.deep.equal({ min: 0, max: 35, mean: 25 });
      expect(row.periodLabel).to.equal('Last 24 h');
      expect(row.tone).to.equal('problem');
      expect(query(card, '.tile-btn').getAttribute('aria-label')).to.equal(describeWithStats(row.measurement, row.stats, 'last 24 h'));
      card.remove();
    });

    it('labels seven-day illuminance history as daytime in visible and accessible text', async () => {
      const clock = clockForStats();
      const hass = illuminanceHass();
      const card = await mount(full({ show_bars: ['illuminance'], history_period: '7d' }), hass);
      await settle(card);
      expect(calls(hass)).to.have.length(0);
      expect(daytimeCalls(hass)).to.have.length(1);
      expect(daytimeCalls(hass)[0].args[0].start_time).to.equal(new Date(Date.now() - 7 * 86400000).toISOString());
      const row = rows(card)[0];
      expect(row.periodLabel).to.equal('Daytime · 7 d');
      expect(query(card, '.tile-btn').getAttribute('aria-label')).to.equal(describeWithStats(row.measurement, row.stats, 'daytime, last 7 days'));
      await row.updateComplete;
      expect(row.shadowRoot!.textContent).to.include('Daytime · 7 d');
      card.remove();
      expect(clock.countTimers()).to.equal(0);
    });

    it('refetches illuminance when toggled between daytime and hourly groups', async () => {
      const clock = clockForStats();
      const hass = illuminanceHass();
      const card = await mount(full({ show_bars: ['illuminance'] }), hass);
      await settle(card);
      expect(daytimeCalls(hass)).to.have.length(1);
      card.setConfig(full({ show_bars: ['illuminance'], illuminance_daytime_only: false }));
      await settle(card);
      await clock.tickAsync(60000);
      await settle(card);
      expect(calls(hass)).to.have.length(1);
      expect(rows(card)[0].stats).to.deep.equal({ min: 0, max: 35, mean: 25 });
      card.setConfig(full({ show_bars: ['illuminance'] }));
      await settle(card);
      await clock.tickAsync(60000);
      await settle(card);
      expect(daytimeCalls(hass)).to.have.length(2);
      expect(rows(card)[0].stats).to.deep.equal({ min: 2000, max: 4000, mean: 3000 });
      card.remove();
    });

    it('keeps cumulative illuminance in the daily totals group', async () => {
      const hass = illuminanceHass();
      hass.states['sensor.illuminance'] = state('0', { state_class: 'total_increasing' });
      const card = await mount(full({ show_bars: ['illuminance'] }), hass);
      await settle(card);
      expect(daytimeCalls(hass)).to.have.length(0);
      expect(calls(hass)).to.have.length(1);
      expect(calls(hass)[0].args[0].period).to.equal('day');
      expect(rows(card)[0].stats).to.deep.equal({ min: 8, max: 12, mean: 10 });
      expect(rows(card)[0].periodLabel).to.equal('Daily · 7 d');
      card.remove();
    });

    it('renders ordered grouped 84px tiles at 327px with named sensor actions and no tooltip', async () => {
      const hass = fakeHass();
      const card = await mount(full(), hass);
      card.style.width = '327px';
      await settleLayout(card);
      const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.tile-btn')];
      expect(buttons).to.have.length(6);
      expect(rows(card).map((row) => row.measurement.sensor)).to.deep.equal(DEFAULT_GAUGES.map((key) => `sensor.${key}`));
      const events = sinon.spy();
      card.addEventListener('hass-more-info', events);
      for (const [index, button] of buttons.entries()) {
        const row = rows(card)[index];
        expect(row.tone).to.equal('ok');
        expect(row.hideUnits).to.equal(false);
        expect(row.showHistory).to.equal(true);
        expect(button.getAttribute('aria-label')).to.equal(describeWithStats(row.measurement, row.stats,
          row.measurement.key === 'illuminance' ? 'daytime, last 24 h' : 'last 24 h'));
        expect(button.getBoundingClientRect().height).to.equal(84);
        const style = getComputedStyle(button);
        expect(style.padding).to.equal('8px 12px');
        expect(button.classList.contains('problem')).to.equal(false);
        expect(style.boxShadow).to.equal('none');
        expect(style.backgroundImage).to.equal('none');
        expect(style.borderTopLeftRadius).to.equal(index === 0 ? '16px' : '4px');
        expect(style.borderTopRightRadius).to.equal(index === 0 ? '16px' : '4px');
        expect(style.borderBottomLeftRadius).to.equal(index === 5 ? '16px' : '4px');
        expect(style.borderBottomRightRadius).to.equal(index === 5 ? '16px' : '4px');
        button.click();
        expect(events.lastCall.args[0].detail.entityId).to.equal(row.measurement.sensor);
        button.focus();
      }
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      expect(gauges(card)).to.have.length(0);
      card.setConfig(full({ show_bars: ['temperature'], hide_units: true }));
      await settle(card);
      const style = getComputedStyle(query(card, '.tile-btn'));
      expect([style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius, style.borderBottomRightRadius]).to.deep.equal(['16px', '16px', '16px', '16px']);
      expect(rows(card)[0].hideUnits).to.equal(true);
      expect(card.getCardSize()).to.equal(4);
      card.remove();
    });

    it('accents only real problem tiles while keeping out-of-bounds values red', async () => {
      const hass = fakeHass();
      hass.states[ENTITY] = state('problem', { problems: [{ sensor_type: 'moisture', status: 'Low' }] });
      hass.states['sensor.moisture'] = state('5');
      const card = await mount(full(), hass);
      card.style.setProperty('--mpl-error', 'rgb(190, 1, 2)');
      const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.tile-btn')];
      expect(rows(card)[0].tone).to.equal('problem');
      expect(buttons[0].classList.contains('problem')).to.equal(true);
      const style = getComputedStyle(buttons[0]);
      expect(style.boxShadow).to.include('inset');
      expect(style.boxShadow).to.include('4px 0px 0px 0px');
      expect(style.boxShadow).to.include('rgb(190, 1, 2)');
      expect(style.backgroundImage).to.include('linear-gradient');
      for (const button of buttons.slice(1)) {
        expect(button.classList.contains('problem')).to.equal(false);
        expect(getComputedStyle(button).boxShadow).to.equal('none');
        expect(getComputedStyle(button).backgroundImage).to.equal('none');
      }
      card.setConfig(full({ problem_sensors: ['temperature'] }));
      await settle(card);
      expect(rows(card)[0].tone).to.equal('problem');
      expect(buttons[0].classList.contains('problem')).to.equal(false);
      expect(getComputedStyle(buttons[0]).boxShadow).to.equal('none');
      expect(getComputedStyle(buttons[0]).backgroundImage).to.equal('none');
      card.remove();
    });

    for (const value of ['5', '60']) {
      it(`uses error tone without a problem accent for a non-cumulative value ${value}`, async () => {
        const hass = fakeHass();
        hass.states['sensor.moisture'] = state(value);
        const card = await mount(full({ show_bars: ['moisture'], problem_sensors: [] }), hass);
        expect(rows(card)[0].tone).to.equal('problem');
        expect(query(card, '.tile-btn').classList.contains('problem')).to.equal(false);
        expect(query(card, '.problem-badge')).to.equal(null);
        card.remove();
      });
    }

    for (const stateClass of ['total', 'total_increasing']) {
      it(`uses complete daily totals and advisory current tone for ${stateClass} sensors`, async () => {
        const hass = fakeHass();
        hass.states['sensor.dli'] = state('0.7', { state_class: stateClass });
        const card = await mount(full({ show_bars: ['moisture', 'dli'] }), hass);
        await settle(card);
        expect(calls(hass)).to.have.length(2);
        expect(calls(hass).find((call) => call.args[0].period === 'hour')!.args[0].statistic_ids).to.deep.equal(['sensor.moisture']);
        expect(calls(hass).find((call) => call.args[0].period === 'day')!.args[0].statistic_ids).to.deep.equal(['sensor.dli']);
        const row = rows(card)[1];
        expect(row.stats).to.deep.equal({ min: 8, max: 12, mean: 10 });
        expect(row.periodLabel).to.equal('Daily · 7 d');
        expect(row.tone).to.equal('advisory');
        const button = card.shadowRoot!.querySelectorAll('.tile-btn')[1];
        expect(button.classList.contains('problem')).to.equal(false);
        expect(button.getAttribute('aria-label')).to.equal(describeWithStats(row.measurement, row.stats, 'daily totals, last 7 days'));
        assign(card, { ...hass, states: { ...hass.states, 'sensor.dli': state('60', { state_class: stateClass }) } });
        await settle(card);
        expect(rows(card)[1].stats).to.deep.equal({ min: 8, max: 12, mean: 10 });
        expect(rows(card)[1].tone).to.equal('advisory');
        card.remove();
      });
    }

    it('fetches seven-day ranges and refetches a changed window after the throttle', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      const card = await mount(full({ show_bars: ['moisture'], history_period: '7d' }), hass);
      await settle(card);
      expect(calls(hass)[0].args[0].start_time).to.equal(new Date(Date.now() - 7 * 86400000).toISOString());
      expect(rows(card)[0].periodLabel).to.equal('Last 7 d');
      expect(query(card, '.tile-btn').getAttribute('aria-label')).to.equal(describeWithStats(rows(card)[0].measurement, rows(card)[0].stats, 'last 7 days'));
      card.setConfig(full({ show_bars: ['moisture'], history_period: '24h' }));
      await settle(card);
      await clock.tickAsync(59999);
      expect(calls(hass)).to.have.length(1);
      await clock.tickAsync(1);
      await settle(card);
      expect(calls(hass)).to.have.length(2);
      expect(calls(hass)[1].args[0].start_time).to.equal(new Date(Date.now() - 86400000).toISOString());
      expect(rows(card)[0].periodLabel).to.equal('Last 24 h');
      card.remove();
    });

    it('refetches when a sensor changes from range to cumulative history', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      const card = await mount(full({ show_bars: ['dli'] }), hass);
      await settle(card);
      expect(calls(hass)[0].args[0].period).to.equal('hour');
      assign(card, { ...hass, states: { ...hass.states, 'sensor.dli': state('25', { state_class: 'total_increasing' }) } });
      await settle(card);
      await clock.tickAsync(60000);
      await settle(card);
      expect(calls(hass)).to.have.length(2);
      expect(calls(hass)[1].args[0].period).to.equal('day');
      expect(rows(card)[0].stats).to.deep.equal({ min: 8, max: 12, mean: 10 });
      card.remove();
    });

    it('preserves both previous history maps when either group fails', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      hass.states['sensor.dli'] = state('0.7', { state_class: 'total_increasing' });
      const card = await mount(full({ show_bars: ['moisture', 'dli'] }), hass);
      await settle(card);
      hass.callWS.onCall(hass.callWS.callCount).resolves({ 'sensor.moisture': [{ min: 1, max: 99, mean: 50 }] });
      hass.callWS.onCall(hass.callWS.callCount + 1).rejects(new Error('offline'));
      await clock.tickAsync(600000);
      await settle(card);
      expect(rows(card)[0].stats).to.deep.equal({ min: 15, max: 35, mean: 25 });
      expect(rows(card)[1].stats).to.deep.equal({ min: 8, max: 12, mean: 10 });
      card.remove();
    });

    it('waits for info then fetches only rendered sensor ids once and extends stats with live values', async () => {
      const hass = fakeHass();
      let resolve!: (value: { result: PlantInfo }) => void;
      hass.callWS.onFirstCall().returns(new Promise((done) => { resolve = done; }));
      const card = await mount(full({ show_bars: ['temperature', 'missing', 'moisture'] }), hass);
      expect(calls(hass)).to.have.length(0);
      resolve({ result: info });
      await settle(card);
      await settle(card);
      expect(calls(hass)).to.have.length(1);
      expect(calls(hass)[0].args[0].statistic_ids).to.deep.equal(['sensor.temperature', 'sensor.moisture']);
      expect(rows(card)[1].stats).to.deep.equal({ min: 15, max: 35, mean: 25 });
      assign(card, { ...hass, states: { ...hass.states, 'sensor.moisture': state('60') } });
      await settle(card);
      expect(rows(card)[1].stats).to.deep.equal({ min: 15, max: 60, mean: 25 });
      expect(calls(hass)).to.have.length(1);
      card.remove();
    });

    it('refetches every ten minutes and keeps good history on error', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      const card = await mount(full(), hass);
      await settle(card);
      expect(calls(hass)).to.have.length(1);
      hass.callWS.onCall(hass.callWS.callCount).rejects(new Error('offline'));
      await clock.tickAsync(600000);
      await settle(card);
      expect(calls(hass)).to.have.length(2);
      expect(rows(card)[0].stats).to.deep.equal({ min: 15, max: 35, mean: 25 });
      await clock.tickAsync(600000);
      expect(calls(hass)).to.have.length(3);
      card.remove();
    });

    it('coalesces rapid configs and ignores stale history responses', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      let resolve!: (value: Record<string, { min: number; max: number; mean: number }[]>) => void;
      hass.callWS.onSecondCall().returns(new Promise((done) => { resolve = done; }));
      const card = await mount(full(), hass);
      card.setConfig(full({ show_bars: ['temperature'] }));
      await settle(card);
      card.setConfig(full({ show_bars: ['moisture'] }));
      await settle(card);
      resolve({ 'sensor.moisture': [{ min: 1, max: 99, mean: 50 }] });
      await settle(card);
      expect(rows(card)[0].stats).to.equal(null);
      await clock.tickAsync(59999);
      expect(calls(hass)).to.have.length(1);
      await clock.tickAsync(1);
      await settle(card);
      expect(calls(hass)).to.have.length(2);
      expect(calls(hass)[1].args[0].statistic_ids).to.deep.equal(['sensor.moisture']);
      expect(rows(card)[0].stats).to.deep.equal({ min: 15, max: 35, mean: 25 });
      card.remove();
    });

    it('refetches when the rendered sensor set changes without a config change', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      const card = await mount(full({ show_bars: ['moisture', 'temperature'] }), hass);
      await settle(card);
      const states = { ...hass.states };
      delete states['sensor.temperature'];
      assign(card, { ...hass, states });
      await settle(card);
      await clock.tickAsync(60000);
      await settle(card);
      expect(calls(hass)).to.have.length(2);
      expect(calls(hass)[1].args[0].statistic_ids).to.deep.equal(['sensor.moisture']);
      expect(rows(card)).to.have.length(1);
      card.remove();
    });

    it('does not fetch for an empty sensor set and uses plant more-info for a sensorless tile', async () => {
      const hass = fakeHass({ temperature: { current: 20, min: 0, max: 40 } });
      const card = await mount(full({ show_bars: ['temperature'] }), hass);
      const moreInfo = sinon.spy();
      card.addEventListener('hass-more-info', moreInfo);
      query(card, '.tile-btn').click();
      expect(moreInfo.firstCall.args[0].detail.entityId).to.equal(ENTITY);
      expect(rows(card)[0].stats).to.equal(null);
      expect(calls(hass)).to.have.length(0);
      card.setConfig(full({ show_bars: [] }));
      await settle(card);
      expect(rows(card)).to.have.length(0);
      expect(card.getCardSize()).to.equal(2);
      card.remove();
    });

    for (const config of [full({ hide_history: true }), cfg()]) {
      it(`does not fetch history for ${config.hide_history ? 'hide_history' : 'compact'}`, async () => {
        const clock = clockForStats();
        const hass = fakeHass();
        const card = await mount(config, hass);
        await clock.tickAsync(600000);
        expect(calls(hass)).to.have.length(0);
        expect(daytimeCalls(hass)).to.have.length(0);
        for (const row of rows(card)) {
          expect(row.stats).to.equal(null);
          expect(row.showHistory).to.equal(false);
        }
        expect(clock.countTimers()).to.equal(0);
        card.remove();
      });
    }

    it('drops history and stops its timer when disabled or switched to compact', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      const card = await mount(full(), hass);
      await settle(card);
      card.setConfig(full({ hide_history: true }));
      await settle(card);
      expect(rows(card).every((row) => row.stats === null)).to.equal(true);
      expect(rows(card).every((row) => row.showHistory === false)).to.equal(true);
      expect(clock.countTimers()).to.equal(0);
      card.setConfig(cfg());
      await settle(card);
      await clock.tickAsync(600000);
      expect(calls(hass)).to.have.length(1);
      card.remove();
    });

    it('clears history timer on disconnect and refetches on reconnect after ten minutes', async () => {
      const clock = clockForStats();
      const hass = fakeHass();
      const card = await mount(full(), hass);
      await settle(card);
      card.remove();
      expect(clock.countTimers()).to.equal(0);
      await clock.tickAsync(600001);
      expect(calls(hass)).to.have.length(1);
      document.body.append(card);
      await settle(card);
      expect(calls(hass)).to.have.length(2);
      card.remove();
      expect(clock.countTimers()).to.equal(0);
    });
  });

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
    expect(query(card, '.gauge-btn').hasAttribute('title')).to.equal(false);
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
      expect(button.hasAttribute('title')).to.equal(false);
      expect(gauge.shadowRoot!.querySelector('[role="meter"]')).to.equal(null);
    }
  });

  describe('gauge tooltips', () => {
    const pointer = (target: EventTarget, type: string, pointerType = 'touch', x = 20, y = 20) =>
      target.dispatchEvent(new PointerEvent(type, { pointerType, pointerId: 1, clientX: x, clientY: y, bubbles: true, composed: true }));
    const clockForTooltip = () => sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    for (const pointerType of ['touch', 'pen']) {
      it(`shows exact text on ${pointerType} long-press, suppresses click and persists until pointerdown`, async () => {
        const hass = fakeHass({ moisture: { min: 15, max: 60, sensor: 'sensor.moisture', unit_of_measurement: '%' } });
        hass.states['sensor.moisture'] = state('6');
        const card = await mount(cfg(), hass);
        const clock = clockForTooltip();
        const moreInfo = sinon.spy();
        const clicks = sinon.spy();
        card.addEventListener('hass-more-info', moreInfo);
        card.addEventListener('click', clicks);
        const button = query(card, '.gauge-btn');
        pointer(button, 'pointerdown', pointerType);
        await clock.tickAsync(449);
        expect(query(card, '.tooltip')).to.equal(null);
        await clock.tickAsync(1);
        await settle(card);
        expect(query(card, '[role="tooltip"] .tooltip-title').textContent).to.equal('Moisture · too low');
        expect(query(card, '[role="tooltip"] .tooltip-body').textContent).to.equal('6 % · ideal 15–60 %');
        expect(button.getAttribute('aria-label')).to.equal('Moisture: 6 % (15–60 %) · low');
        expect(button.hasAttribute('aria-describedby')).to.equal(false);
        pointer(button, 'pointerup', pointerType);
        const click = new MouseEvent('click', { detail: 1, bubbles: true, composed: true, cancelable: true });
        expect(button.dispatchEvent(click)).to.equal(false);
        expect(moreInfo.called).to.equal(false);
        expect(clicks.called).to.equal(false);
        await clock.tickAsync(2000);
        expect(query(card, '.tooltip')).not.to.equal(null);
        pointer(document, 'pointerdown');
        await settle(card);
        expect(query(card, '.tooltip')).to.equal(null);
        expect(button.hasAttribute('aria-describedby')).to.equal(false);
        button.click();
        expect(moreInfo.calledOnce).to.equal(true);
        card.remove();
      });
    }

    it('lets the first header tap through a persistent touch tooltip', async () => {
      const card = await mount();
      card.style.width = '327px';
      await settleLayout(card);
      const clock = clockForTooltip();
      const moreInfo = sinon.spy();
      card.addEventListener('hass-more-info', moreInfo);
      const button = query(card, '.gauge-btn');
      pointer(button, 'pointerdown');
      await clock.tickAsync(450);
      pointer(button, 'pointerup');
      await settle(card);
      const tooltip = query(card, '.tooltip');
      expect(getComputedStyle(tooltip).pointerEvents).to.equal('none');
      const name = query<HTMLButtonElement>(card, '.name');
      const bounds = name.getBoundingClientRect();
      const surface = query(card, 'ha-card');
      const surfaceBounds = surface.getBoundingClientRect();
      // Force the reported overlap independently of font and header dimensions.
      tooltip.style.animation = 'none';
      tooltip.style.left = `${bounds.left - surfaceBounds.left - surface.clientLeft}px`;
      tooltip.style.top = `${bounds.top - surfaceBounds.top - surface.clientTop}px`;
      tooltip.style.width = `${bounds.width}px`;
      tooltip.style.height = `${bounds.height}px`;
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const target = card.shadowRoot!.elementFromPoint(x, y)!;
      expect(target).to.equal(name);
      pointer(target, 'pointerdown', 'touch', x, y);
      target.dispatchEvent(new PointerEvent('click', { pointerType: 'touch', pointerId: 1, detail: 1, bubbles: true, composed: true }));
      expect(moreInfo.calledOnce).to.equal(true);
      expect(moreInfo.firstCall.args[0].detail.entityId).to.equal(ENTITY);
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      card.remove();
    });

    for (const dismissal of ['cancel', 'keydown', 'keyboard-click', 'timeout', 'other-pointer', 'suppressed'] as const) {
      it(`scopes long-press suppression: ${dismissal}`, async () => {
        const card = await mount();
        const clock = clockForTooltip();
        const button = query<HTMLButtonElement>(card, '.gauge-btn');
        const moreInfo = sinon.spy();
        card.addEventListener('hass-more-info', moreInfo);
        pointer(button, 'pointerdown');
        await clock.tickAsync(450);
        if (dismissal === 'cancel') pointer(button, 'pointercancel');
        else pointer(button, 'pointerup');
        if (dismissal === 'keydown' || dismissal === 'cancel') {
          button.focus();
          button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
        }
        if (dismissal === 'timeout') await clock.tickAsync(801);
        const click = new PointerEvent('click', {
          detail: ['cancel', 'keyboard-click'].includes(dismissal) ? 0 : 1,
          pointerId: dismissal === 'other-pointer' ? 2 : 1,
          bubbles: true, composed: true, cancelable: true,
        });
        expect(button.dispatchEvent(click)).to.equal(dismissal !== 'suppressed');
        expect(moreInfo.callCount).to.equal(dismissal === 'suppressed' ? 0 : 1);
        button.click();
        expect(moreInfo.callCount).to.equal(dismissal === 'suppressed' ? 1 : 2);
        card.remove();
      });
    }

    for (const dismissal of ['pointerdown', 'Escape', 'disconnect'] as const) {
      it(`removes the visible touch tooltip document listener on ${dismissal}`, async () => {
        const card = await mount();
        const clock = clockForTooltip();
        const add = sinon.spy(document, 'addEventListener');
        const remove = sinon.spy(document, 'removeEventListener');
        const button = query(card, '.gauge-btn');
        pointer(button, 'pointerdown');
        await clock.tickAsync(450);
        await settle(card);
        const registration = add.getCalls().find((call) => call.args[0] === 'pointerdown');
        expect(registration).not.to.equal(undefined);
        if (dismissal === 'pointerdown') pointer(document, 'pointerdown');
        if (dismissal === 'Escape') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        if (dismissal === 'disconnect') card.remove();
        await settle(card);
        expect(query(card, '.tooltip')).to.equal(null);
        expect(remove.calledWith('pointerdown', registration!.args[1], true)).to.equal(true);
        card.remove();
      });
    }

    it('bridges the hover gap and retains the tooltip while hovered or focused', async () => {
      const card = await mount();
      const clock = clockForTooltip();
      const button = query<HTMLButtonElement>(card, '.gauge-btn');
      pointer(button, 'pointerenter', 'mouse');
      await clock.tickAsync(500);
      await settle(card);
      const tooltip = query(card, '.tooltip');
      expect(getComputedStyle(tooltip).pointerEvents).to.equal('auto');
      pointer(button, 'pointerleave', 'mouse');
      await clock.tickAsync(149);
      pointer(tooltip, 'pointerenter', 'mouse');
      await clock.tickAsync(500);
      expect(query(card, '.tooltip')).to.equal(tooltip);
      pointer(tooltip, 'pointerleave', 'mouse');
      await clock.tickAsync(149);
      expect(query(card, '.tooltip')).to.equal(tooltip);
      pointer(button, 'pointerenter', 'mouse');
      await clock.tickAsync(500);
      expect(query(card, '.tooltip')).to.equal(tooltip);
      sinon.stub(button, 'matches').withArgs(':focus-visible').returns(true);
      button.focus();
      pointer(button, 'pointerleave', 'mouse');
      await clock.tickAsync(150);
      await settle(card);
      expect(query(card, '.tooltip')).not.to.equal(null);
      expect(getComputedStyle(query(card, '.tooltip')).pointerEvents).to.equal('none');
      button.blur();
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      pointer(button, 'pointerenter', 'mouse');
      await clock.tickAsync(500);
      await settle(card);
      pointer(button, 'pointerleave', 'mouse');
      pointer(query(card, '.tooltip'), 'pointerenter', 'mouse');
      pointer(query(card, '.tooltip'), 'pointerleave', 'mouse');
      await clock.tickAsync(150);
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      card.remove();
    });

    it('repositions a visible tooltip on a same-capacity resize', async () => {
      const card = await mount();
      card.style.width = '350px';
      await settleLayout(card);
      const button = card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')[3];
      sinon.stub(button, 'matches').withArgs(':focus-visible').returns(true);
      button.focus();
      await settle(card);
      const tooltip = query(card, '.tooltip');
      tooltip.style.animation = 'none';
      const left = tooltip.style.left;
      card.style.width = '327px';
      await settleLayout(card);
      expect(query(card, '.gauges').style.getPropertyValue('--mpl-cols')).to.equal('6');
      expect(tooltip.style.left).not.to.equal(left);
      const bounds = query(card, 'ha-card').getBoundingClientRect();
      expect(tooltip.getBoundingClientRect().left).to.be.at.least(bounds.left + 8);
      expect(tooltip.getBoundingClientRect().right).to.be.at.most(bounds.right - 8);
    });

    it('keeps short taps as more-info without a tooltip', async () => {
      const card = await mount();
      const clock = clockForTooltip();
      const moreInfo = sinon.spy();
      card.addEventListener('hass-more-info', moreInfo);
      const button = query(card, '.gauge-btn');
      pointer(button, 'pointerdown');
      await clock.tickAsync(449);
      pointer(button, 'pointerup');
      button.click();
      await clock.tickAsync(2000);
      expect(moreInfo.calledOnce).to.equal(true);
      expect(query(card, '.tooltip')).to.equal(null);
      card.remove();
    });

    for (const cancellation of ['move', 'cancel']) {
      it(`cancels a pending long-press on ${cancellation}`, async () => {
        const card = await mount();
        const clock = clockForTooltip();
        pointer(query(card, '.gauge-btn'), 'pointerdown');
        pointer(window, cancellation === 'move' ? 'pointermove' : 'pointercancel', 'touch', 29);
        await clock.tickAsync(450);
        expect(query(card, '.tooltip')).to.equal(null);
        expect(clock.countTimers()).to.equal(0);
        card.remove();
      });
    }

    it('delays mouse hover, cancels on leave, and replaces another gauge tooltip', async () => {
      const card = await mount();
      const clock = clockForTooltip();
      const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')];
      pointer(buttons[0], 'pointerenter', 'mouse');
      await clock.tickAsync(499);
      expect(query(card, '.tooltip')).to.equal(null);
      await clock.tickAsync(1);
      await settle(card);
      expect(query(card, '.tooltip-title').textContent).to.equal('Moisture');
      expect(query(card, '.tooltip-body').textContent).to.equal('25 % · ideal 10–50 %');
      pointer(buttons[1], 'pointerenter', 'mouse');
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      await clock.tickAsync(500);
      await settle(card);
      expect(query(card, '.tooltip-title').textContent).to.equal('Conductivity');
      expect(query(card, '.tooltip-body').textContent).to.equal('25 % · ideal 10–50 %');
      pointer(buttons[1], 'pointerleave', 'mouse');
      await clock.tickAsync(150);
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      pointer(buttons[0], 'pointerenter', 'mouse');
      pointer(buttons[0], 'pointerleave', 'mouse');
      await clock.tickAsync(500);
      expect(query(card, '.tooltip')).to.equal(null);
      card.remove();
    });

    it('shows on focus-visible, hides on blur and Escape, and prevents context menus', async () => {
      const card = await mount();
      const button = query<HTMLButtonElement>(card, '.gauge-btn');
      sinon.stub(button, 'matches').withArgs(':focus-visible').returns(true);
      button.focus();
      await settle(card);
      expect(getComputedStyle(query(card, '.tooltip')).pointerEvents).to.equal('none');
      expect(query(card, '.tooltip-title').textContent).to.equal('Moisture');
      expect(query(card, '.tooltip-body').textContent).to.equal('25 % · ideal 10–50 %');
      button.blur();
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      button.focus();
      await settle(card);
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      await settle(card);
      expect(query(card, '.tooltip')).to.equal(null);
      expect(button.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true }))).to.equal(false);
    });

    for (const dismissal of ['scroll', 'disconnect']) {
      it(`clears pending and visible tooltip timers on ${dismissal}`, async () => {
        const card = await mount();
        const clock = clockForTooltip();
        const button = query(card, '.gauge-btn');
        const dismiss = () => dismissal === 'scroll' ? window.dispatchEvent(new Event('scroll')) : card.remove();
        pointer(button, 'pointerdown');
        dismiss();
        await clock.tickAsync(500);
        await settle(card);
        expect(query(card, '.tooltip')).to.equal(null);
        expect(clock.countTimers()).to.equal(0);
        if (!card.isConnected) document.body.append(card);
        pointer(button, 'pointerdown');
        await clock.tickAsync(450);
        pointer(button, 'pointerup');
        await settle(card);
        expect(query(card, '.tooltip')).not.to.equal(null);
        dismiss();
        await settle(card);
        expect(query(card, '.tooltip')).to.equal(null);
        expect(clock.countTimers()).to.equal(0);
        card.remove();
      });
    }

    it('keeps rounded tooltip lines at 16px high without wrapping at 327px', async () => {
      const hass = fakeHass({
        humidity: { current: 65.56, min: 20, max: 60, unit_of_measurement: '%' },
        illuminance: { current: 22, min: 2000, max: 30000, unit_of_measurement: 'lx' },
        temperature: { current: 21.6, min: 15, max: 32, unit_of_measurement: '°C' },
      });
      const card = await mount(cfg({ show_bars: ['humidity', 'illuminance', 'temperature'] }), hass);
      card.style.width = '327px';
      await settleLayout(card);
      const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')];
      for (const [index, title, body] of [
        [0, 'Air humidity · too high', '65.6 % · ideal 20–60 %'],
        [1, 'Illuminance · too low', '22 lx · ideal 2000–30000 lx'],
        [2, 'Temperature', '21.6 °C · ideal 15–32 °C'],
      ] as const) {
        const button = buttons[index];
        sinon.stub(button, 'matches').withArgs(':focus-visible').returns(true);
        button.focus();
        await settle(card);
        query(card, '.tooltip').style.animation = 'none';
        expect(query(card, '.tooltip-title').textContent).to.equal(title);
        expect(query(card, '.tooltip-body').textContent).to.equal(body);
        for (const selector of ['.tooltip-title', '.tooltip-body']) {
          const line = query(card, selector);
          const style = getComputedStyle(line);
          expect(style.whiteSpace).to.equal('nowrap');
          expect(style.lineHeight).to.equal('16px');
          expect(style.fontSize).to.equal('12px');
          expect(style.fontWeight).to.equal(selector === '.tooltip-title' ? '500' : '400');
          expect(line.getBoundingClientRect().height).to.equal(16);
        }
        button.blur();
        await settle(card);
      }
    });

    it('clamps first and last gauge tooltips within a 240px card and places them 4px above', async () => {
      const card = await mount();
      card.style.width = '240px';
      await settleLayout(card);
      const buttons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.gauge-btn')];
      const bounds = query(card, 'ha-card').getBoundingClientRect();
      for (const button of [buttons[0], buttons[buttons.length - 1]]) {
        sinon.stub(button, 'matches').withArgs(':focus-visible').returns(true);
        button.focus();
        await settle(card);
        const tooltip = query(card, '.tooltip');
        tooltip.style.animation = 'none';
        const box = tooltip.getBoundingClientRect();
        expect(box.left).to.be.at.least(bounds.left + 8);
        expect(box.right).to.be.at.most(bounds.right - 8);
        expect(box.bottom).to.be.closeTo(button.getBoundingClientRect().top - 4, 1);
        button.blur();
        await settle(card);
      }
    });
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

  it('hides species only when requested in either mode', async () => {
    for (const config of [cfg({ hide_species: true }), cfg({ display_type: 'full', hide_species: true })]) {
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
    const card = await mount(cfg({ display_type: undefined }));
    expect(card.getCardSize()).to.equal(13);
    card.setConfig(cfg({ display_type: 'compact' }));
    expect(card.getCardSize()).to.equal(4);
    expect(card.getGridOptions()).to.deep.equal({ columns: 6, min_columns: 4, rows: 'auto' });
    expect(MaterialPlantCard.getConfigForm()).to.equal(configForm);
    expect(MaterialPlantCard.getStubConfig({ states: { 'light.first': state(), 'plant.first': state(), 'plant.second': state() } } as unknown as HomeAssistant))
      .to.deep.equal({ type: 'custom:material-plant-card', entity: 'plant.first', show_bars: [...DEFAULT_GAUGES] });
    expect(MaterialPlantCard.getStubConfig({ states: {} } as HomeAssistant).entity).to.equal('plant.my_plant');
  });

  it('keeps species, 56px photo and units in compact, with explicit hide override', async () => {
    const card = await mount(cfg({ display_type: 'compact' }));
    expect(query(card, '.subtitle').textContent).to.equal('Phalaenopsis');
    expect(getComputedStyle(query(card, '.image-btn')).width).to.equal('56px');
    expect(gauges(card)[0]).to.have.property('value', '25%');
    card.setConfig(cfg({ display_type: 'compact', hide_units: true }));
    await settle(card);
    expect(gauges(card)[0]).to.have.property('value', '');
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
