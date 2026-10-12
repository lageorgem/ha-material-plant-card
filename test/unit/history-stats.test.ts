import { expect } from '@open-wc/testing';
import {
  aggregateDailyTotals, aggregateStatistics, fetchHistoryStats, withCurrent,
  type DailyRow, type StatRow,
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

describe('aggregateDailyTotals', () => {
  const now = Date.parse('2026-10-12T12:34:56.789Z');

  it('aggregates the complete busu days, excluding the current partial day', () => {
    const rows = [9.71, 10.23, 8.23, 7.79, 8.68, 9.12].map((change, index) => ({
      start: now - (7 - index) * 86400000,
      end: now - (6 - index) * 86400000,
      change,
    }));
    const stats = aggregateDailyTotals([...rows, { end: now + 86400000, change: 0.70 }], now);
    expect(stats?.min).to.equal(7.79);
    expect(stats?.max).to.equal(10.23);
    expect(stats?.mean).to.be.closeTo(8.96, 0.001);
  });

  it('requires finite change and end, accepts the exact end boundary and zero', () => {
    const invalid: DailyRow[] = [];
    for (const change of [null, undefined, NaN, Infinity, -Infinity]) {
      invalid.push({ end: now, change });
    }
    for (const end of [undefined, NaN, Infinity, -Infinity, now + 1]) {
      invalid.push({ end, change: 100 });
    }
    expect(aggregateDailyTotals([...invalid, { end: now, change: 0 }], now))
      .to.deep.equal({ min: 0, max: 0, mean: 0 });
    expect(aggregateDailyTotals(invalid, now)).to.equal(null);
    expect(aggregateDailyTotals([], now)).to.equal(null);
    expect(aggregateDailyTotals(undefined, now)).to.equal(null);
  });
});

describe('fetchHistoryStats', () => {
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
    expect(await fetchHistoryStats(hass, { range: ids, dailyTotals: [], window: '24h' }, now))
      .to.deep.equal({ range: {
      'sensor.moisture': { min: 10, max: 18, mean: 13 },
      'sensor.temperature': { min: 20, max: 24, mean: 22 },
    }, dailyTotals: {}, failed: false });
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

  it('makes no call for empty lists', async () => {
    let calls = 0;
    const hass = {
      callWS: async <T>(): Promise<T> => {
        calls++;
        throw new Error('Unexpected call');
      },
    };
    expect(await fetchHistoryStats(hass, { range: [], dailyTotals: [], window: '7d' }, now))
      .to.deep.equal({ range: {}, dailyTotals: {}, failed: false });
    expect(calls).to.equal(0);
  });

  it('returns empty groups on rejection without throwing or retrying', async () => {
    let calls = 0;
    const hass = {
      callWS: async <T>(): Promise<T> => {
        calls++;
        throw new Error('Recorder unavailable');
      },
    };
    expect(await fetchHistoryStats(hass, {
      range: ['sensor.moisture'], dailyTotals: ['sensor.dli'], window: '24h',
    }, now)).to.deep.equal({ range: {}, dailyTotals: {}, failed: true });
    expect(calls).to.equal(2);
  });

  it('sends exact 7d and daily requests in parallel and deduplicates each group', async () => {
    const messages: Record<string, unknown>[] = [];
    const resolvers: Array<(value: unknown) => void> = [];
    const hass = {
      callWS: <T>(message: Record<string, unknown>): Promise<T> => {
        messages.push(message);
        return new Promise<T>((resolve) => resolvers.push((value) => resolve(value as T)));
      },
    };
    const request = {
      range: ['sensor.shared', 'sensor.shared'],
      dailyTotals: ['sensor.shared', 'sensor.shared', 'sensor.empty', 'sensor.missing', 'sensor.partial'],
      window: '7d' as const,
    };
    const pending = fetchHistoryStats(hass, request, now);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 7);
    expect(messages).to.deep.equal([{
      type: 'recorder/statistics_during_period',
      start_time: new Date(now - 7 * 86400000).toISOString(),
      statistic_ids: ['sensor.shared'], period: 'hour', types: ['min', 'max', 'mean'],
    }, {
      type: 'recorder/statistics_during_period', start_time: start.toISOString(),
      statistic_ids: ['sensor.shared', 'sensor.empty', 'sensor.missing', 'sensor.partial'],
      period: 'day', types: ['change'],
    }]);
    expect(resolvers).to.have.length(2);
    resolvers[0]({ 'sensor.shared': [{ min: 1, max: 3, mean: 2 }] });
    resolvers[1]({
      'sensor.shared': [{ end: now, change: 9 }, { end: now - 1, change: 7 }],
      'sensor.empty': [], 'sensor.partial': [{ end: now + 1, change: 0.7 }],
      'sensor.unrequested': [{ end: now, change: 100 }],
    });
    expect(await pending).to.deep.equal({
      range: { 'sensor.shared': { min: 1, max: 3, mean: 2 } },
      dailyTotals: { 'sensor.shared': { min: 7, max: 9, mean: 8 } }, failed: false,
    });
    expect(request.range).to.have.length(2);
    expect(request.dailyTotals).to.have.length(5);
  });

  it('makes only the daily call when the range list is empty', async () => {
    const messages: Record<string, unknown>[] = [];
    const hass = {
      callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
        messages.push(message);
        return { 'sensor.dli': [{ end: now, change: 9 }] } as T;
      },
    };
    expect(await fetchHistoryStats(hass, {
      range: [], dailyTotals: ['sensor.dli'], window: '24h',
    }, now)).to.deep.equal({
      range: {}, dailyTotals: { 'sensor.dli': { min: 9, max: 9, mean: 9 } }, failed: false,
    });
    expect(messages).to.have.length(1);
    expect(messages[0].period).to.equal('day');
  });

  for (const failedPeriod of ['hour', 'day']) {
    it(`preserves the other group's result when ${failedPeriod} rejects`, async () => {
      const messages: Record<string, unknown>[] = [];
      const hass = {
        callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
          messages.push(message);
          if (message.period === failedPeriod) throw new Error('Recorder unavailable');
          return (message.period === 'hour'
            ? { 'sensor.moisture': [{ min: 1, max: 3, mean: 2 }] }
            : { 'sensor.dli': [{ end: now, change: 9 }] }) as T;
        },
      };
      expect(await fetchHistoryStats(hass, {
        range: ['sensor.moisture'], dailyTotals: ['sensor.dli'], window: '24h',
      }, now)).to.deep.equal({
        range: failedPeriod === 'hour' ? {} : { 'sensor.moisture': { min: 1, max: 3, mean: 2 } },
        dailyTotals: failedPeriod === 'day' ? {} : { 'sensor.dli': { min: 9, max: 9, mean: 9 } },
        failed: true,
      });
      expect(messages).to.have.length(2);
    });
  }

  it('contains synchronous transport errors too', async () => {
    const hass = { callWS: <T>(): Promise<T> => { throw new Error('Disconnected'); } };
    expect(await fetchHistoryStats(hass, {
      range: ['sensor.moisture'], dailyTotals: ['sensor.dli'], window: '24h',
    }, now)).to.deep.equal({ range: {}, dailyTotals: {}, failed: true });
  });
});
