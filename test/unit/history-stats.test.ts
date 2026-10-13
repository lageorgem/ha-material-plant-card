import { expect } from '@open-wc/testing';
import {
  fetchHistory, localDayStart, seriesExtremes, summarizeDailyMax, summarizeHourly, withCurrent,
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
    fine: ['sensor.shared', 'sensor.light', 'sensor.light'], fineStart: at(12, 6),
  };

  it('sends three exact deduplicated requests in parallel and returns raw rows', async () => {
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
    }, {
      type: 'recorder/statistics_during_period',
      start_time: new Date(request.fineStart).toISOString(), end_time: new Date(now).toISOString(),
      statistic_ids: ['sensor.shared', 'sensor.light'], period: '5minute', types: ['min', 'max', 'mean'],
    }]);
    expect(resolvers).to.have.length(3);
    const hourly = { 'sensor.shared': [row(at(12), { min: 1, max: 3, mean: 2 })] };
    const cumulative = { 'sensor.dli': [row(at(12, 23), { state: 9.1216 })] };
    const fine = { 'sensor.light': [{ start: at(12, 6), end: at(12, 6, 5), min: 1, max: 3, mean: 2 }] };
    resolvers[2](fine);
    resolvers[1](cumulative);
    resolvers[0](hourly);
    expect(await pending).to.deep.equal({ hourly, cumulative, fine,
      failedGroups: { hourly: false, cumulative: false, fine: false } });
    expect(request.hourly).to.have.length(2);
    expect(request.cumulative).to.have.length(3);
    expect(request.fine).to.have.length(3);
  });

  it('skips all empty lists', async () => {
    let calls = 0;
    const hass = { callWS: async <T>(): Promise<T> => {
      calls++;
      throw new Error('Unexpected call');
    } };
    expect(await fetchHistory(hass, { ...request, hourly: [], cumulative: [], fine: [] }, now))
      .to.deep.equal({ hourly: {}, cumulative: {}, fine: {},
        failedGroups: { hourly: false, cumulative: false, fine: false } });
    expect(calls).to.equal(0);
  });

  for (const group of ['hourly', 'cumulative', 'fine'] as const) {
    it(`skips an empty ${group} list independently`, async () => {
      const messages: Record<string, unknown>[] = [];
      const hass = { callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
        messages.push(message);
        return {} as T;
      } };
      await fetchHistory(hass, { ...request, [group]: [] }, now);
      expect(messages).to.have.length(2);
      expect(messages.some(message => message.start_time === new Date(request[`${group}Start`]).toISOString()))
        .to.equal(false);
    });

    it(`isolates ${group} rejection and preserves the other result`, async () => {
      const response = { 'sensor.shared': [row(at(12), { state: 7, min: 1, max: 3, mean: 2 })] };
      let calls = 0;
      const hass = { callWS: async <T>(message: Record<string, unknown>): Promise<T> => {
        calls++;
        const messageGroup = message.period === '5minute' ? 'fine' :
          (message.types as string[])[0] === 'state' ? 'cumulative' : 'hourly';
        if (messageGroup === group) throw new Error('Recorder unavailable');
        return response as T;
      } };
      expect(await fetchHistory(hass, request, now)).to.deep.equal({
        hourly: group === 'hourly' ? {} : response,
        cumulative: group === 'cumulative' ? {} : response,
        fine: group === 'fine' ? {} : response,
        failedGroups: { hourly: group === 'hourly', cumulative: group === 'cumulative', fine: group === 'fine' },
      });
      expect(calls).to.equal(3);
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
        hourly: {}, cumulative: {}, fine: {}, failedGroups: { hourly: true, cumulative: true, fine: true },
      });
      expect(calls).to.equal(3);
    }
  });
});

describe('localDayStart', () => {
  it('uses the configured calendar date rather than UTC at the Bucharest reset', () => {
    const instant = Date.parse('2026-10-13T22:00:00Z');
    expect(localDayStart(instant, 0, 'Europe/Bucharest')).to.equal(Date.parse('2026-10-13T21:00:00Z'));
    expect(localDayStart(instant, 0, 'UTC')).to.equal(Date.parse('2026-10-13T00:00:00Z'));
    expect(localDayStart(instant, 1, 'Europe/Bucharest')).to.equal(Date.parse('2026-10-12T21:00:00Z'));
  });

  for (const [date, start, end, hours] of [
    ['2026-03-29T12:00:00Z', '2026-03-28T22:00:00Z', '2026-03-29T21:00:00Z', 23],
    ['2026-10-25T12:00:00Z', '2026-10-24T21:00:00Z', '2026-10-25T22:00:00Z', 25],
  ] as const) {
    it(`uses ${hours}-hour Bucharest DST days`, () => {
      const instant = Date.parse(date);
      expect(localDayStart(instant, 0, 'Europe/Bucharest')).to.equal(Date.parse(start));
      expect(localDayStart(instant, -1, 'Europe/Bucharest')).to.equal(Date.parse(end));
      expect(localDayStart(Date.parse(end), 1, 'Europe/Bucharest')).to.equal(Date.parse(start));
      expect(Date.parse(end) - Date.parse(start)).to.equal(hours * hour);
    });
  }

  it('supports half-hour offsets and calendar-year rollover', () => {
    const instant = Date.parse('2026-01-01T02:00:00Z');
    expect(localDayStart(instant, 0, 'America/St_Johns')).to.equal(Date.parse('2025-12-31T03:30:00Z'));
    expect(localDayStart(instant, -1, 'America/St_Johns')).to.equal(Date.parse('2026-01-01T03:30:00Z'));
  });

  it('returns the first instant of a date when midnight is skipped', () => {
    expect(localDayStart(Date.parse('2026-03-08T12:00:00Z'), 0, 'America/Havana'))
      .to.equal(Date.parse('2026-03-08T05:00:00Z'));
  });

  it('falls back to browser-local behavior for an invalid zone', () => {
    expect(localDayStart(now, 2, 'Not/A_TimeZone')).to.equal(localDayStart(now, 2));
  });

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

describe('seriesExtremes', () => {
  it('selects finite extrema and returns the exact series entries without mutation', () => {
    const series = Object.freeze([
      Object.freeze({ t: 30, v: 4 }), Object.freeze({ t: 10, v: -2 }),
      Object.freeze({ t: 20, v: 9 }), Object.freeze({ t: 40, v: 0 }),
    ]);
    const result = seriesExtremes(series);
    expect(result).to.deep.equal({ minPoint: { t: 10, v: -2 }, maxPoint: { t: 20, v: 9 } });
    expect(result.minPoint).to.equal(series[1]);
    expect(result.maxPoint).to.equal(series[2]);
  });

  it('ignores null, NaN and both infinities', () => {
    const series = [null, NaN, Infinity, -Infinity, 0].map((v, t) => ({ t, v }));
    expect(seriesExtremes(series)).to.deep.equal({ minPoint: series[4], maxPoint: series[4] });
  });

  it('excludes points rejected by the timestamp filter', () => {
    const series = [{ t: 1, v: -100 }, { t: 2, v: 3 }, { t: 3, v: 100 }, { t: 4, v: 7 }];
    expect(seriesExtremes(series, (t) => t % 2 === 0))
      .to.deep.equal({ minPoint: series[1], maxPoint: series[3] });
  });

  it('keeps the first occurrence on ties, not the earliest timestamp', () => {
    const series = [{ t: 40, v: -2 }, { t: 30, v: 9 }, { t: 20, v: -2 }, { t: 10, v: 9 }];
    const result = seriesExtremes(series);
    expect(result.minPoint).to.equal(series[0]);
    expect(result.maxPoint).to.equal(series[1]);
  });

  it('returns null points for empty, entirely invalid or entirely filtered series', () => {
    const empty = { minPoint: null, maxPoint: null };
    expect(seriesExtremes([])).to.deep.equal(empty);
    expect(seriesExtremes([null, NaN, Infinity, -Infinity].map((v, t) => ({ t, v }))))
      .to.deep.equal(empty);
    expect(seriesExtremes([{ t: 1, v: 2 }], () => false)).to.deep.equal(empty);
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
  it('excludes the preceding HA day peak after the Bucharest reset, unlike UTC', () => {
    const instant = Date.parse('2026-10-13T22:00:00Z');
    const rows = [row(Date.parse('2026-10-13T20:00:00Z'), { state: 12 }),
      row(Date.parse('2026-10-13T21:00:00Z'), { state: 0 })];
    const options = { days: 1, now: instant, current: 1 };
    expect(summarizeDailyMax(rows, { ...options, timeZone: 'Europe/Bucharest' }).stats)
      .to.deep.equal({ min: 1, max: 1, mean: 1 });
    expect(summarizeDailyMax(rows, { ...options, timeZone: 'UTC' }).stats)
      .to.deep.equal({ min: 12, max: 12, mean: 12 });
  });

  for (const [start, end] of [
    ['2026-03-28T22:00:00Z', '2026-03-29T21:00:00Z'],
    ['2026-10-24T21:00:00Z', '2026-10-25T22:00:00Z'],
  ]) {
    it(`buckets both sides of the DST boundary ${end} without leaking peaks`, () => {
      const first = Date.parse(start);
      const next = Date.parse(end);
      const rows = [row(first - 1, { state: 100 }), row(first, { state: 2 }),
        row(next - hour, { state: 9 }), row(next, { state: 0 })];
      const result = summarizeDailyMax(rows, {
        days: 2, now: next + hour, current: 1, timeZone: 'Europe/Bucharest',
      });
      expect(result.series).to.deep.equal([{ t: first + 12 * hour, v: 9 },
        { t: next + 12 * hour, v: 1 }]);
    });
  }

  it('uses half-hour reset boundaries and falls back for invalid zones', () => {
    const instant = Date.parse('2026-01-01T06:00:00Z');
    const rows = [row(Date.parse('2026-01-01T03:00:00Z'), { state: 10 }),
      row(Date.parse('2026-01-01T03:30:00Z'), { state: 0 })];
    const options = { days: 1, now: instant, current: 1 };
    expect(summarizeDailyMax(rows, { ...options, timeZone: 'America/St_Johns' }).stats?.max).to.equal(1);
    expect(summarizeDailyMax(rows, { ...options, timeZone: 'Not/A_TimeZone' }))
      .to.deep.equal(summarizeDailyMax(rows, options));
  });

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
