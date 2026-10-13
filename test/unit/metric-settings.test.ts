import { expect } from '@open-wc/testing';
import { normalizeMetrics, PERIOD_MS, periodStart, resolveMetric } from '../../src/calc/metric-settings';
import { DEFAULT_GAUGES } from '../../src/types';
import type { MaterialPlantCardConfig, MetricConfig } from '../../src/types';

const config = (overrides: Partial<MaterialPlantCardConfig> = {}): MaterialPlantCardConfig => ({
  type: 'custom:material-plant-card', entity: 'plant.test', ...overrides,
});

describe('normalizeMetrics', () => {
  it('keeps ordered valid entries, unknown types, and the first duplicate with its settings', () => {
    const first = { type: 'moisture', icon: 'mdi:water', days: 12 };
    const metrics = [null, false, 42, 'dli', [], {}, { type: '' }, { type: 1 },
      first, { type: 'custom_key' }, { type: 'moisture', days: 2 }, { type: 'dli' }];
    expect(normalizeMetrics(config({ metrics } as unknown as Partial<MaterialPlantCardConfig>)))
      .to.deep.equal([first, { type: 'custom_key' }, { type: 'dli' }]);
  });

  it('uses an explicit array even when empty or entirely invalid instead of show_bars', () => {
    expect(normalizeMetrics(config({ metrics: [], show_bars: ['dli'] }))).to.deep.equal([]);
    expect(normalizeMetrics(config({ metrics: [null, {}], show_bars: ['dli'] } as unknown as
      Partial<MaterialPlantCardConfig>))).to.deep.equal([]);
  });

  it('falls back to ordered deduplicated show_bars strings when metrics is not an array', () => {
    for (const metrics of [undefined, null, {}, 'invalid']) {
      expect(normalizeMetrics(config({ metrics, show_bars: ['dli', 'custom', 'dli', 42, null] } as unknown as
        Partial<MaterialPlantCardConfig>))).to.deep.equal([{ type: 'dli' }, { type: 'custom' }]);
    }
    expect(normalizeMetrics(config({ show_bars: [] }))).to.deep.equal([]);
  });

  it('maps defaults when neither field is an array and returns independently editable entries', () => {
    for (const show_bars of [undefined, null, {}, 'dli']) {
      expect(normalizeMetrics(config({ show_bars } as unknown as Partial<MaterialPlantCardConfig>)))
        .to.deep.equal(DEFAULT_GAUGES.map(type => ({ type })));
    }
    const metrics = normalizeMetrics(config());
    metrics[0].icon = 'mdi:custom';
    expect(normalizeMetrics(config())[0].icon).to.equal(undefined);
  });
});

describe('resolveMetric', () => {
  it('exports every period and resolves defaults for any metric', () => {
    expect(PERIOD_MS).to.deep.equal({
      today: 86400000, '24h': 86400000, '3d': 259200000, '7d': 604800000, '14d': 1209600000, '30d': 2592000000,
    });
    expect(resolveMetric({ type: 'custom' })).to.deep.equal({
      icon: undefined, period: 'today', periodMs: 86400000, days: 7, trigger: 'plant',
      display: 'summary', daylightOnly: false, daylightOffset: 30,
    });
    expect(resolveMetric({ type: 'illuminance' }).daylightOnly).to.equal(true);
  });

  it('overrides every metric setting independently', () => {
    expect(resolveMetric({ type: 'illuminance', icon: 'mdi:sun', period: '14d', days: 12.6,
      problem_trigger: 'high', display: 'summary', daylight_only: false, daylight_offset: 45.6 })).to.deep.equal({
      icon: 'mdi:sun', period: '14d', periodMs: PERIOD_MS['14d'], days: 13, trigger: 'high',
      display: 'summary', daylightOnly: false, daylightOffset: 46,
    });
    for (const period of ['today', '24h', '3d', '7d', '14d', '30d'] as const) {
      expect(resolveMetric({ type: 'moisture', period }))
        .to.include({ period, periodMs: PERIOD_MS[period] });
    }
    for (const problem_trigger of ['plant', 'out_of_range', 'low', 'high', 'never'] as const) {
      expect(resolveMetric({ type: 'moisture', problem_trigger }).trigger)
        .to.equal(problem_trigger);
    }
    expect(resolveMetric({ type: 'moisture', display: 'graph' }).display).to.equal('graph');
  });

  it('falls back from invalid runtime values rather than coercing them', () => {
    for (const invalid of [null, '', false, {}, NaN, Infinity, 'invalid']) {
      const metric = { type: 'illuminance', icon: invalid, period: invalid, days: invalid, problem_trigger: invalid,
        display: invalid, daylight_only: invalid, daylight_offset: invalid } as unknown as MetricConfig;
      const resolved = resolveMetric(metric);
      expect(resolved).to.deep.equal({ icon: typeof invalid === 'string' && invalid.length > 0 ? invalid : undefined,
        period: 'today', periodMs: PERIOD_MS.today, days: 7, trigger: 'plant', display: 'summary',
        // `false` is a valid daylight_only value, not an invalid one.
        daylightOnly: invalid !== false, daylightOffset: 30 });
    }
    const strings = { type: 'moisture', days: '15', daylight_offset: '60' } as unknown as MetricConfig;
    expect(resolveMetric(strings))
      .to.include({ days: 7, daylightOffset: 30 });
  });

  it('rounds and clamps finite days and offsets', () => {
    for (const [days, expected] of [[-10, 1], [0, 1], [1, 1], [7.4, 7], [7.5, 8], [30, 30], [100, 30]]) {
      expect(resolveMetric({ type: 'dli', days }).days).to.equal(expected);
    }
    for (const [daylight_offset, expected] of [[-10, 0], [0, 0], [30.4, 30], [30.5, 31], [180, 180], [200, 180]]) {
      expect(resolveMetric({ type: 'illuminance', daylight_offset }).daylightOffset)
        .to.equal(expected);
    }
  });

  it('enables daylight filtering only for illuminance', () => {
    for (const key of ['moisture', 'dli', 'custom']) {
      expect(resolveMetric({ type: key, daylight_only: true }).daylightOnly).to.equal(false);
    }
    for (const daylight_only of [true, false]) {
      expect(resolveMetric({ type: 'illuminance', daylight_only }).daylightOnly)
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
