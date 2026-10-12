import { expect } from '@open-wc/testing';
import {
  aggregateStatistics, fetch24hStats, withCurrent, type StatRow,
} from '../../src/data/history-stats';

describe('aggregateStatistics', () => {
  it('takes the outer range and arithmetic mean of usable row means', () => {
    expect(aggregateStatistics([
      { start: 1, end: 2, min: 2, max: 10, mean: 6 },
      { start: 2, end: 5, min: -4, max: 8, mean: 2 },
      { min: 0, max: 20, mean: 10 },
    ])).to.deep.equal({ min: -4, max: 20, mean: 6 });
  });

  it('ignores an entire row when any statistic is null, missing or non-finite', () => {
    const invalid: StatRow[] = [];
    for (const key of ['min', 'max', 'mean'] as const) {
      for (const value of [null, undefined, NaN, Infinity, -Infinity]) {
        invalid.push({ min: -100, max: 100, mean: 100, [key]: value });
      }
    }
    expect(aggregateStatistics([
      ...invalid, { min: 0, max: 0, mean: 0 }, { min: 2, max: 4, mean: 2 },
    ])).to.deep.equal({ min: 0, max: 4, mean: 1 });
    expect(aggregateStatistics(invalid)).to.equal(null);
  });

  it('returns null for all-null, empty or undefined rows', () => {
    expect(aggregateStatistics([{ min: null, max: null, mean: null }])).to.equal(null);
    expect(aggregateStatistics([])).to.equal(null);
    expect(aggregateStatistics(undefined)).to.equal(null);
  });
});

describe('withCurrent', () => {
  const stats = { min: 2, max: 8, mean: 5 };

  it('does not create history without statistics', () => {
    expect(withCurrent(null, null)).to.equal(null);
    expect(withCurrent(null, 4)).to.equal(null);
  });

  it('returns the existing statistics when the current value is null', () => {
    expect(withCurrent(stats, null)).to.equal(stats);
  });

  it('extends either boundary without changing the mean or mutating statistics', () => {
    expect(withCurrent(stats, 0)).to.deep.equal({ min: 0, max: 8, mean: 5 });
    expect(withCurrent(stats, 10)).to.deep.equal({ min: 2, max: 10, mean: 5 });
    for (const value of [2, 5, 8]) {
      expect(withCurrent(stats, value)).to.deep.equal(stats);
    }
    expect(stats).to.deep.equal({ min: 2, max: 8, mean: 5 });
  });
});

describe('fetch24hStats', () => {
  const now = Date.parse('2026-10-12T12:34:56.789Z');

  it('sends one exact request with deduplicated ids and aggregates the direct result', async () => {
    const messages: Record<string, unknown>[] = [];
    const response: Record<string, StatRow[]> = {
      'sensor.moisture': [
        { start: 1791828000000, end: 1791831600000, min: 14, max: 14, mean: 14 },
        { min: 10, max: 18, mean: 12 },
        { min: null, max: null, mean: null },
      ],
      'sensor.temperature': [{ min: 20, max: 24, mean: 22 }],
      'sensor.dli': [{ min: null, max: null, mean: null }],
      'sensor.empty': [],
      'sensor.invalid': [{ min: 0, max: Infinity, mean: 1 }],
    };
    const hass = {
      callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
        messages.push(message);
        return response as T;
      },
    };
    const ids = [
      'sensor.moisture', 'sensor.temperature', 'sensor.moisture', 'sensor.dli',
      'sensor.empty', 'sensor.invalid', 'sensor.missing',
    ];
    expect(await fetch24hStats(hass, ids, now)).to.deep.equal({
      'sensor.moisture': { min: 10, max: 18, mean: 13 },
      'sensor.temperature': { min: 20, max: 24, mean: 22 },
    });
    expect(messages).to.deep.equal([{
      type: 'recorder/statistics_during_period',
      start_time: new Date(now - 86400000).toISOString(),
      statistic_ids: [
        'sensor.moisture', 'sensor.temperature', 'sensor.dli', 'sensor.empty',
        'sensor.invalid', 'sensor.missing',
      ],
      period: 'hour',
      types: ['min', 'max', 'mean'],
    }]);
    expect(ids).to.have.length(7);
  });

  it('makes no call for an empty sensor list', async () => {
    let calls = 0;
    const hass = {
      callWS: async <T>(): Promise<T> => {
        calls++;
        throw new Error('Unexpected call');
      },
    };
    expect(await fetch24hStats(hass, [], now)).to.deep.equal({});
    expect(calls).to.equal(0);
  });

  it('returns an empty map on rejection without throwing or retrying', async () => {
    let calls = 0;
    const hass = {
      callWS: async <T>(): Promise<T> => {
        calls++;
        throw new Error('Recorder unavailable');
      },
    };
    expect(await fetch24hStats(hass, ['sensor.moisture'], now)).to.deep.equal({});
    expect(calls).to.equal(1);
  });
});
