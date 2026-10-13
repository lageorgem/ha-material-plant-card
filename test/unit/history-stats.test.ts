import { expect } from '@open-wc/testing';
import {
  fetchHistory, localDayStart, summarizeDailyMax, summarizeHourly, withCurrent,
  type HistoryFetch, type HourRow,
} from '../../src/data/history-stats';

const hour = 3600000;
const at = (day: number, h = 0, minute = 0) => new Date(2026, 9, day, h, minute).getTime();
const now = at(13, 12);
const row = (start: number, values: Partial<HourRow> = {}): HourRow => ({
  start, end: start + hour, ...values,
});
const midpoint = (r: HourRow) => (r.start + r.end) / 2;

describe('fetchHistory', () => {
  const request: HistoryFetch = {
    hourly: ['sensor.shared', 'sensor.shared'], hourlyStart: at(10, 12),
    cumulative: ['sensor.shared', 'sensor.dli', 'sensor.dli'], cumulativeStart: at(7),
  };

  it('sends exact deduplicated hourly requests in parallel and returns raw rows', async () => {
    const messages: Record<string, unknown>[] = [];
    const resolvers: Array<(value: Record<string, HourRow[]>) => void> = [];
    const hass = {
      callWS: <T>(message: Record<string, unknown>): Promise<T> => {
        messages.push(message);
        return new Promise<T>((resolve) => resolvers.push((value) => resolve(value as T)));
      },
    };
    const pending = fetchHistory(hass, request, now);
    expect(messages).to.deep.equal([{
      type: 'recorder/statistics_during_period',
      start_time: new Date(request.hourlyStart).toISOString(), end_time: new Date(now).toISOString(),
      statistic_ids: ['sensor.shared'], period: 'hour', types: ['min', 'max', 'mean'],
    }, {
      type: 'recorder/statistics_during_period',
      start_time: new Date(request.cumulativeStart).toISOString(), end_time: new Date(now).toISOString(),
      statistic_ids: ['sensor.shared', 'sensor.dli'], period: 'hour', types: ['state'],
    }]);
    expect(resolvers).to.have.length(2);
    const hourly = { 'sensor.shared': [row(at(12), { min: 1, max: 3, mean: 2 })] };
    const cumulative = { 'sensor.dli': [row(at(12, 23), { state: 9.1216 })] };
    resolvers[1](cumulative);
    resolvers[0](hourly);
    expect(await pending).to.deep.equal({ hourly, cumulative,
      failedGroups: { hourly: false, cumulative: false } });
    expect(request.hourly).to.have.length(2);
    expect(request.cumulative).to.have.length(3);
  });

  it('skips both empty lists', async () => {
    let calls = 0;
    const hass = { callWS: async <T>(): Promise<T> => {
      calls++;
      throw new Error('Unexpected call');
    } };
    expect(await fetchHistory(hass, { ...request, hourly: [], cumulative: [] }, now))
      .to.deep.equal({ hourly: {}, cumulative: {}, failedGroups: { hourly: false, cumulative: false } });
    expect(calls).to.equal(0);
  });

  for (const group of ['hourly', 'cumulative'] as const) {
    it(`skips an empty ${group} list independently`, async () => {
      const messages: Record<string, unknown>[] = [];
      const hass = { callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
        messages.push(message);
        return {} as T;
      } };
      await fetchHistory(hass, { ...request, [group]: [] }, now);
      expect(messages).to.have.length(1);
      expect(messages[0].types).to.deep.equal(group === 'hourly' ? ['state'] : ['min', 'max', 'mean']);
    });

    it(`isolates ${group} rejection and preserves the other result`, async () => {
      const response = { 'sensor.shared': [row(at(12), { state: 7, min: 1, max: 3, mean: 2 })] };
      let calls = 0;
      const hass = { callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
        calls++;
        const isHourly = (message.types as string[])[0] === 'min';
        if (isHourly === (group === 'hourly')) throw new Error('Recorder unavailable');
        return response as T;
      } };
      expect(await fetchHistory(hass, request, now)).to.deep.equal({
        hourly: group === 'hourly' ? {} : response,
        cumulative: group === 'cumulative' ? {} : response,
        failedGroups: { hourly: group === 'hourly', cumulative: group === 'cumulative' },
      });
      expect(calls).to.equal(2);
    });
  }

  it('contains synchronous throws and rejected promises without retrying', async () => {
    for (const sync of [true, false]) {
      let calls = 0;
      const hass = { callWS: <T>(): Promise<T> => {
        calls++;
        if (sync) throw new Error('Disconnected');
        return Promise.reject(new Error('Disconnected'));
      } };
      expect(await fetchHistory(hass, request, now)).to.deep.equal({
        hourly: {}, cumulative: {}, failedGroups: { hourly: true, cumulative: true },
      });
      expect(calls).to.equal(2);
    }
  });
});

describe('localDayStart', () => {
  it('uses local calendar midnight with daysBack, including month and DST boundaries', () => {
    expect(localDayStart(at(13, 12, 34))).to.equal(at(13));
    expect(localDayStart(at(13, 12), 6)).to.equal(at(7));
    expect(localDayStart(at(1, 12), 1)).to.equal(new Date(2026, 8, 30).getTime());
    expect(localDayStart(at(13), -1)).to.equal(at(14));
    for (const date of [new Date(2026, 2, 30, 12), new Date(2026, 10, 2, 12)]) {
      const expected = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 2);
      expect(localDayStart(date.getTime(), 2)).to.equal(expected.getTime());
    }
  });
});

describe('summarizeHourly', () => {
  const first = row(at(13, 8), { min: 2, max: 10, mean: 6 });
  const second = row(at(13, 9), { min: -4, max: 8, mean: 2 });
  const options = { start: first.start, now, current: null };

  it('filters [start, now), sorts without mutation, and computes row extrema and mean', () => {
    const rows = [second, row(now, { min: -100, max: 100, mean: 100 }), first,
      row(first.start - 1, { min: -100, max: 100, mean: 100 })];
    const original = [...rows];
    expect(summarizeHourly(rows, options)).to.deep.equal({
      stats: { min: -4, max: 10, mean: 4 },
      series: [{ t: midpoint(first), v: 6 }, { t: midpoint(second), v: 2 }],
      minPoint: { t: midpoint(second), v: -4 }, maxPoint: { t: midpoint(first), v: 10 },
    });
    expect(rows).to.deep.equal(original);
  });

  it('retains gaps for every invalid statistic and keep=false row', () => {
    const invalid: HourRow[] = [];
    for (const key of ['min', 'max', 'mean'] as const) {
      for (const value of [null, undefined, NaN, Infinity, -Infinity]) {
        invalid.push(row(at(13, 10) + invalid.length, { min: 0, max: 20, mean: 10, [key]: value }));
      }
    }
    const result = summarizeHourly([first, second, ...invalid], {
      ...options, keep: (start, end) => start === first.start && end === first.end,
    });
    expect(result).to.deep.equal({
      stats: { min: 2, max: 10, mean: 6 },
      series: [{ t: midpoint(first), v: 6 }, { t: midpoint(second), v: null },
        ...invalid.map((r) => ({ t: midpoint(r), v: null }))],
      minPoint: { t: midpoint(first), v: 2 }, maxPoint: { t: midpoint(first), v: 10 },
    });
  });

  it('appends current and extends extrema and points without changing the mean', () => {
    for (const current of [-5, 0, 11]) {
      const result = summarizeHourly([first, second], { ...options, current });
      expect(result.stats).to.deep.equal({ min: Math.min(-4, current), max: Math.max(10, current), mean: 4 });
      expect(result.series[result.series.length - 1]).to.deep.equal({ t: now, v: current });
      expect(result.minPoint).to.deep.equal(current < -4 ? { t: now, v: current } : { t: midpoint(second), v: -4 });
      expect(result.maxPoint).to.deep.equal(current > 10 ? { t: now, v: current } : { t: midpoint(first), v: 10 });
    }
  });

  it('does not move tied extrema to current', () => {
    expect(summarizeHourly([first], { ...options, current: 2 }).minPoint)
      .to.deep.equal({ t: midpoint(first), v: 2 });
    expect(summarizeHourly([first], { ...options, current: 10 }).maxPoint)
      .to.deep.equal({ t: midpoint(first), v: 10 });
  });

  it('keeps statistics and markers null without kept rows, even with current', () => {
    for (const rows of [undefined, [], [row(at(13, 9), { min: null })]]) {
      for (const current of [null, 0]) {
        expect(summarizeHourly(rows, { ...options, current })).to.deep.equal({
          stats: null, series: [...(rows ?? []).map((r) => ({ t: midpoint(r), v: null })),
            ...(current === null ? [] : [{ t: now, v: current }])],
          minPoint: null, maxPoint: null,
        });
      }
    }
    expect(summarizeHourly([first], { ...options, current: 5, keep: () => false }))
      .to.deep.equal({ stats: null, series: [{ t: midpoint(first), v: null }, { t: now, v: 5 }],
        minPoint: null, maxPoint: null });
  });
});

describe('summarizeDailyMax', () => {
  it('uses seven local-day maxima, missing-day gaps, today current, and extrema markers', () => {
    const rows = [row(at(6, 23), { state: 100 }), row(at(7, 22), { state: 10.23 }),
      row(at(7, 23), { state: 9 }), row(at(8, 23), { state: 8.23 }),
      row(at(10, 23), { state: 7.79 }), row(at(11, 23), { state: 8.68 }),
      row(at(12, 22), { state: 9.1216 }), row(at(12, 23), { state: 9.1216 }),
      row(at(13), { state: 0 }), row(at(13, 10), { state: 0.7 }),
      row(at(14), { state: 100 })];
    const result = summarizeDailyMax(rows.reverse(), { days: 7, now, current: 1.2 });
    expect(result.series).to.deep.equal([10.23, 8.23, null, 7.79, 8.68, 9.1216, 1.2]
      .map((v, i) => ({ t: at(7 + i) + 12 * hour, v })));
    expect(result.stats?.min).to.equal(1.2);
    expect(result.stats?.max).to.equal(10.23);
    expect(result.stats?.mean).to.be.closeTo((10.23 + 8.23 + 7.79 + 8.68 + 9.1216 + 1.2) / 6, 1e-10);
    expect(result.minPoint).to.deep.equal({ t: at(13) + 12 * hour, v: 1.2 });
    expect(result.maxPoint).to.deep.equal({ t: at(7) + 12 * hour, v: 10.23 });
  });

  it('assigns midnight resets to the new day, and does not lower today max with current', () => {
    const result = summarizeDailyMax([
      row(at(12, 23), { state: 9.1216 }), row(at(13), { state: 0 }),
    ], { days: 2, now, current: null });
    expect(result.series.map((p) => p.v)).to.deep.equal([9.1216, 0]);
    expect(result.stats).to.deep.equal({ min: 0, max: 9.1216, mean: 9.1216 / 2 });
    expect(summarizeDailyMax([row(at(13, 10), { state: 3 })], { days: 1, now, current: 1 }).stats)
      .to.deep.equal({ min: 3, max: 3, mean: 3 });
  });

  it('uses sorted today hourly series with invalid gaps and current, but single-value stats', () => {
    const rows = [row(at(13, 10), { state: 2 }), row(at(12, 23), { state: 100 }),
      row(at(13), { state: 0 }), ...[null, undefined, NaN, Infinity, -Infinity]
        .map((state, i) => row(at(13, 1 + i), { state }))];
    const original = [...rows];
    expect(summarizeDailyMax(rows, { days: 1, now, current: 3 })).to.deep.equal({
      stats: { min: 3, max: 3, mean: 3 },
      series: [{ t: midpoint(rows[2]), v: 0 }, ...rows.slice(3).map((r) => ({ t: midpoint(r), v: null })),
        { t: midpoint(rows[0]), v: 2 }, { t: now, v: 3 }],
      minPoint: null, maxPoint: null,
    });
    expect(rows).to.deep.equal(original);
  });

  it('clamps zero days to today and 45 days to 30', () => {
    expect(summarizeDailyMax(undefined, { days: 0, now, current: 0 })).to.deep.equal({
      stats: { min: 0, max: 0, mean: 0 }, series: [{ t: now, v: 0 }], minPoint: null, maxPoint: null,
    });
    const result = summarizeDailyMax(undefined, { days: 45, now, current: null });
    expect(result.series).to.have.length(30);
    expect(result.series[0]).to.deep.equal({ t: localDayStart(now, 29) + 12 * hour, v: null });
    expect(result.stats).to.equal(null);
    expect(result.minPoint).to.equal(null);
    expect(result.maxPoint).to.equal(null);
  });

  it('returns null stats without finite values and leaves single-day markers null', () => {
    for (const rows of [undefined, [], [row(at(13), { state: Infinity })]]) {
      const result = summarizeDailyMax(rows, { days: 1, now, current: null });
      expect(result.stats).to.equal(null);
      expect(result.minPoint).to.equal(null);
      expect(result.maxPoint).to.equal(null);
      expect(result.series).to.deep.equal((rows ?? []).map((r) => ({ t: midpoint(r), v: null })));
    }
  });
});

describe('withCurrent', () => {
  it('preserves null and extends only extrema without mutating stats', () => {
    const stats = { min: 2, max: 8, mean: 5 };
    expect(withCurrent(null, 4)).to.equal(null);
    expect(withCurrent(null, null)).to.equal(null);
    expect(withCurrent(stats, null)).to.equal(stats);
    expect(withCurrent(stats, 0)).to.deep.equal({ min: 0, max: 8, mean: 5 });
    expect(withCurrent(stats, 10)).to.deep.equal({ min: 2, max: 10, mean: 5 });
    expect(withCurrent(stats, 5)).to.deep.equal(stats);
    expect(stats).to.deep.equal({ min: 2, max: 8, mean: 5 });
  });
});
