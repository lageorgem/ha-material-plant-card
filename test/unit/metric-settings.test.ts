import { expect } from '@open-wc/testing';
import { PERIOD_MS, periodStart, resolveMetric } from '../../src/calc/metric-settings';
import type { MaterialPlantCardConfig, MetricConfig } from '../../src/types';

const config = (overrides: Partial<MaterialPlantCardConfig> = {}): MaterialPlantCardConfig => ({
  type: 'custom:material-plant-card', entity: 'plant.test', ...overrides,
});

describe('resolveMetric', () => {
  it('exports every period and resolves defaults for any metric', () => {
    expect(PERIOD_MS).to.deep.equal({
      today: 86400000, '24h': 86400000, '3d': 259200000, '7d': 604800000, '14d': 1209600000, '30d': 2592000000,
    });
    expect(resolveMetric(config(), 'custom')).to.deep.equal({
      icon: undefined, period: 'today', periodMs: 86400000, days: 7, trigger: 'plant',
      display: 'summary', daylightOnly: false, daylightOffset: 30,
    });
    expect(resolveMetric(config(), 'illuminance').daylightOnly).to.equal(true);
  });

  it('inherits valid global settings and overrides every metric setting independently', () => {
    const cfg = config({ history_period: '3d', full_display: 'graph', metrics: {
      illuminance: { icon: 'mdi:sun', period: '14d', days: 12.6, problem_trigger: 'high',
        display: 'summary', daylight_only: false, daylight_offset: 45.6 },
    } });
    expect(resolveMetric(cfg, 'illuminance')).to.deep.equal({
      icon: 'mdi:sun', period: '14d', periodMs: PERIOD_MS['14d'], days: 13, trigger: 'high',
      display: 'summary', daylightOnly: false, daylightOffset: 46,
    });
    expect(resolveMetric(cfg, 'moisture')).to.include({ period: '3d', display: 'graph', days: 7 });
    for (const period of ['today', '24h', '3d', '7d', '14d', '30d'] as const) {
      expect(resolveMetric(config({ metrics: { moisture: { period } } }), 'moisture'))
        .to.include({ period, periodMs: PERIOD_MS[period] });
      expect(resolveMetric(config({ history_period: period }), 'moisture').period).to.equal(period);
    }
    for (const problem_trigger of ['plant', 'out_of_range', 'low', 'high', 'never'] as const) {
      expect(resolveMetric(config({ metrics: { moisture: { problem_trigger } } }), 'moisture').trigger)
        .to.equal(problem_trigger);
    }
  });

  it('preserves source and sensor defaults but explicit triggers override both', () => {
    expect(resolveMetric(config({ problem_source: 'gauges' }), 'moisture').trigger).to.equal('out_of_range');
    expect(resolveMetric(config({ problem_sensors: ['temperature'] }), 'moisture').trigger).to.equal('never');
    expect(resolveMetric(config({ problem_source: 'gauges', problem_sensors: ['temperature'] }), 'moisture').trigger)
      .to.equal('never');
    expect(resolveMetric(config({ problem_sensors: [] }), 'moisture').trigger).to.equal('plant');
    expect(resolveMetric(config({ problem_source: 'gauges', problem_sensors: ['moisture'] }), 'moisture').trigger)
      .to.equal('out_of_range');
    expect(resolveMetric(config({ problem_sensors: ['temperature'], metrics: {
      moisture: { problem_trigger: 'low' },
    } }), 'moisture').trigger).to.equal('low');
  });

  it('falls back from invalid runtime values rather than coercing them', () => {
    for (const invalid of [null, '', false, {}, NaN, Infinity, 'invalid']) {
      const metric = { icon: invalid, period: invalid, days: invalid, problem_trigger: invalid,
        display: invalid, daylight_only: invalid, daylight_offset: invalid } as unknown as MetricConfig;
      const resolved = resolveMetric(config({ history_period: '7d', full_display: 'graph',
        problem_source: 'gauges', metrics: { illuminance: metric } }), 'illuminance');
      expect(resolved).to.deep.equal({ icon: typeof invalid === 'string' && invalid.length > 0 ? invalid : undefined,
        period: '7d', periodMs: PERIOD_MS['7d'], days: 7, trigger: 'out_of_range', display: 'graph',
        // `false` is a valid daylight_only value, not an invalid one.
        daylightOnly: invalid !== false, daylightOffset: 30 });
    }
    const cfg = config({ history_period: 'bad', full_display: 'bad' } as unknown as Partial<MaterialPlantCardConfig>);
    expect(resolveMetric(cfg, 'moisture')).to.include({ period: 'today', display: 'summary' });
    const strings = { days: '15', daylight_offset: '60' } as unknown as MetricConfig;
    expect(resolveMetric(config({ metrics: { moisture: strings } }), 'moisture'))
      .to.include({ days: 7, daylightOffset: 30 });
  });

  it('rounds and clamps finite days and offsets', () => {
    for (const [days, expected] of [[-10, 1], [0, 1], [1, 1], [7.4, 7], [7.5, 8], [30, 30], [100, 30]]) {
      expect(resolveMetric(config({ metrics: { dli: { days } } }), 'dli').days).to.equal(expected);
    }
    for (const [daylight_offset, expected] of [[-10, 0], [0, 0], [30.4, 30], [30.5, 31], [180, 180], [200, 180]]) {
      expect(resolveMetric(config({ metrics: { illuminance: { daylight_offset } } }), 'illuminance').daylightOffset)
        .to.equal(expected);
    }
  });

  it('enables daylight filtering only for illuminance', () => {
    for (const key of ['moisture', 'dli', 'custom']) {
      expect(resolveMetric(config({ metrics: { [key]: { daylight_only: true } } }), key).daylightOnly).to.equal(false);
    }
    for (const daylight_only of [true, false]) {
      expect(resolveMetric(config({ metrics: { illuminance: { daylight_only } } }), 'illuminance').daylightOnly)
        .to.equal(daylight_only);
    }
  });
});

describe('periodStart', () => {
  it('starts today at midnight in the requested zone, not 24 hours ago', () => {
    const now = Date.parse('2026-06-15T22:30:00Z');
    expect(periodStart('today', now, 'Europe/Bucharest')).to.equal(Date.parse('2026-06-15T21:00:00Z'));
    expect(periodStart('today', now, 'UTC')).to.equal(Date.parse('2026-06-15T00:00:00Z'));
  });

  it('uses the midnight offset even across a daylight-saving transition', () => {
    const now = Date.parse('2026-03-29T12:00:00Z');
    expect(periodStart('today', now, 'Europe/Bucharest')).to.equal(Date.parse('2026-03-28T22:00:00Z'));
  });

  it('defaults today to browser-local midnight', () => {
    const now = Date.parse('2026-06-15T22:30:00Z');
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    expect(periodStart('today', now)).to.equal(midnight.getTime());
  });

  it('keeps other periods as fixed rolling windows regardless of zone', () => {
    const now = Date.parse('2026-06-15T22:30:00Z');
    for (const period of ['24h', '3d', '7d', '14d', '30d'] as const) {
      expect(periodStart(period, now, 'Europe/Bucharest')).to.equal(now - PERIOD_MS[period]);
      expect(periodStart(period, now)).to.equal(now - PERIOD_MS[period]);
    }
  });
});
