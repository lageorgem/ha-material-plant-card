export interface Stats24h {
  min: number;
  max: number;
  mean: number;
}

export interface HourRow {
  start: number;
  end: number;
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  state?: number | null;
}

export interface Point { t: number; v: number; }

export interface MetricHistory {
  stats: Stats24h | null;
  series: { t: number; v: number | null }[];
  minPoint: Point | null;
  maxPoint: Point | null;
}

export interface HistoryFetch {
  hourly: readonly string[];
  hourlyStart: number;
  cumulative: readonly string[];
  cumulativeStart: number;
}

export interface RawHistory {
  hourly: Record<string, HourRow[]>;
  cumulative: Record<string, HourRow[]>;
  failedGroups: { hourly: boolean; cumulative: boolean };
}

export function withCurrent(stats: Stats24h | null, value: number | null): Stats24h | null {
  if (stats === null || value === null) return stats;
  return { min: Math.min(stats.min, value), max: Math.max(stats.max, value), mean: stats.mean };
}

export async function fetchHistory(
  hass: { callWS: <T>(msg: Record<string, unknown>) => Promise<T> },
  req: HistoryFetch,
  now = Date.now(),
): Promise<RawHistory> {
  const result: RawHistory = {
    hourly: {}, cumulative: {}, failedGroups: { hourly: false, cumulative: false },
  };
  await Promise.all((['hourly', 'cumulative'] as const).map(async (group) => {
    try {
      const ids = [...new Set(req[group])];
      if (ids.length === 0) return;
      result[group] = await hass.callWS<Record<string, HourRow[]>>({
        type: 'recorder/statistics_during_period',
        start_time: new Date(group === 'hourly' ? req.hourlyStart : req.cumulativeStart).toISOString(),
        end_time: new Date(now).toISOString(),
        statistic_ids: ids,
        period: 'hour',
        types: group === 'hourly' ? ['min', 'max', 'mean'] : ['state'],
      });
    } catch {
      result.failedGroups[group] = true;
    }
  }));
  return result;
}

export function localDayStart(t: number, daysBack = 0): number {
  const date = new Date(t);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysBack);
  return date.getTime();
}

export function summarizeHourly(
  rows: readonly HourRow[] | undefined,
  o: { start: number; now: number; current: number | null; keep?: (start: number, end: number) => boolean },
): MetricHistory {
  const history: MetricHistory = { stats: null, series: [], minPoint: null, maxPoint: null };
  let total = 0;
  let count = 0;
  const considered = (rows ?? []).filter((r) => o.start <= r.start && r.start < o.now)
    .sort((a, b) => a.start - b.start);
  for (const row of considered) {
    const t = (row.start + row.end) / 2;
    if (typeof row.min !== 'number' || !Number.isFinite(row.min) ||
      typeof row.max !== 'number' || !Number.isFinite(row.max) ||
      typeof row.mean !== 'number' || !Number.isFinite(row.mean) ||
      (o.keep && !o.keep(row.start, row.end))) {
      history.series.push({ t, v: null });
      continue;
    }
    history.series.push({ t, v: row.mean });
    if (history.minPoint === null || row.min < history.minPoint.v) history.minPoint = { t, v: row.min };
    if (history.maxPoint === null || row.max > history.maxPoint.v) history.maxPoint = { t, v: row.max };
    total += row.mean;
    count++;
  }
  if (history.minPoint !== null && history.maxPoint !== null) {
    history.stats = { min: history.minPoint.v, max: history.maxPoint.v, mean: total / count };
  }
  if (o.current !== null) {
    history.series.push({ t: o.now, v: o.current });
    if (history.minPoint !== null && o.current < history.minPoint.v) {
      history.minPoint = { t: o.now, v: o.current };
    }
    if (history.maxPoint !== null && o.current > history.maxPoint.v) {
      history.maxPoint = { t: o.now, v: o.current };
    }
    history.stats = withCurrent(history.stats, o.current);
  }
  return history;
}

export function summarizeDailyMax(
  rows: readonly HourRow[] | undefined,
  o: { days: number; now: number; current: number | null },
): MetricHistory {
  const days = Math.max(1, Math.min(30, Math.round(o.days)));
  const history: MetricHistory = { stats: null, series: [], minPoint: null, maxPoint: null };
  let total = 0;
  let count = 0;
  for (let i = days - 1; i >= 0; i--) {
    const start = localDayStart(o.now, i);
    const end = localDayStart(o.now, i - 1);
    const dayRows = (rows ?? []).filter((r) => start <= r.start && r.start < end)
      .sort((a, b) => a.start - b.start);
    let value: number | null = null;
    for (const row of dayRows) {
      const state = typeof row.state === 'number' && Number.isFinite(row.state) ? row.state : null;
      if (state !== null) value = value === null ? state : Math.max(value, state);
      if (days === 1) history.series.push({ t: (row.start + row.end) / 2, v: state });
    }
    if (i === 0 && o.current !== null) {
      value = value === null ? o.current : Math.max(value, o.current);
      if (days === 1) history.series.push({ t: o.now, v: o.current });
    }
    if (days === 1) {
      history.stats = value === null ? null : { min: value, max: value, mean: value };
      return history;
    }
    const t = start + 12 * 3600000;
    history.series.push({ t, v: value });
    if (value === null) continue;
    if (history.minPoint === null || value < history.minPoint.v) history.minPoint = { t, v: value };
    if (history.maxPoint === null || value > history.maxPoint.v) history.maxPoint = { t, v: value };
    total += value;
    count++;
  }
  if (history.minPoint !== null && history.maxPoint !== null) {
    history.stats = { min: history.minPoint.v, max: history.maxPoint.v, mean: total / count };
  }
  return history;
}
