export interface Stats24h {
  min: number;
  max: number;
  mean: number;
}

export interface StatRow {
  start?: number;
  end?: number;
  min?: number | null;
  max?: number | null;
  mean?: number | null;
}

export function aggregateStatistics(rows: readonly StatRow[] | undefined): Stats24h | null {
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let count = 0;
  for (const row of rows ?? []) {
    if (typeof row.min !== 'number' || !Number.isFinite(row.min) ||
      typeof row.max !== 'number' || !Number.isFinite(row.max) ||
      typeof row.mean !== 'number' || !Number.isFinite(row.mean)) continue;
    min = Math.min(min, row.min);
    max = Math.max(max, row.max);
    total += row.mean;
    count++;
  }
  return count ? { min, max, mean: total / count } : null;
}

export function aggregateDaytime(
  points: readonly { s?: unknown; lu?: number }[] | undefined,
  start: number,
  now: number,
): Stats24h | null {
  const sorted = (points ?? [])
    .filter((point) => typeof point.lu === 'number' && Number.isFinite(point.lu))
    .slice().sort((a, b) => a.lu! - b.lu!);
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let duration = 0;
  for (let index = 0; index < sorted.length; index++) {
    const point = sorted[index];
    const value = typeof point.s === 'number' ? point.s
      : typeof point.s === 'string' && point.s.trim() !== '' ? Number(point.s) : NaN;
    const from = Math.max(point.lu! * 1000, start);
    const to = Math.min(index + 1 < sorted.length ? sorted[index + 1].lu! * 1000 : now, now);
    const length = to - from;
    if (!Number.isFinite(value) || value <= 0 || length <= 0) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
    total += value * length;
    duration += length;
  }
  return duration > 0 ? { min, max, mean: total / duration } : null;
}

export function withCurrent(stats: Stats24h | null, value: number | null): Stats24h | null {
  if (stats === null || value === null) return stats;
  return { min: Math.min(stats.min, value), max: Math.max(stats.max, value), mean: stats.mean };
}

export type HistoryWindow = '24h' | '7d';

export interface DailyRow {
  start?: number;
  end?: number;
  change?: number | null;
}

export function aggregateDailyTotals(rows: readonly DailyRow[] | undefined, now: number): Stats24h | null {
  let min = Infinity;
  let max = -Infinity;
  let total = 0;
  let count = 0;
  for (const row of rows ?? []) {
    if (typeof row.change !== 'number' || !Number.isFinite(row.change) ||
      typeof row.end !== 'number' || !Number.isFinite(row.end) || !(row.end <= now)) continue;
    min = Math.min(min, row.change);
    max = Math.max(max, row.change);
    total += row.change;
    count++;
  }
  return count ? { min, max, mean: total / count } : null;
}

export interface HistoryRequest {
  range: readonly string[];
  dailyTotals: readonly string[];
  daytime: readonly string[];
  window: HistoryWindow;
}

export interface HistoryResult {
  range: Record<string, Stats24h>;
  dailyTotals: Record<string, Stats24h>;
  daytime: Record<string, Stats24h>;
  failed: boolean;
}

export async function fetchHistoryStats(
  hass: { callWS: <T>(msg: Record<string, unknown>) => Promise<T> },
  req: HistoryRequest,
  now: number = Date.now(),
): Promise<HistoryResult> {
  const result: HistoryResult = { range: {}, dailyTotals: {}, daytime: {}, failed: false };
  await Promise.all([
    (async () => {
      const ids = [...new Set(req.range)];
      if (ids.length === 0) return;
      try {
        const response = await hass.callWS<Record<string, StatRow[]>>({
          type: 'recorder/statistics_during_period',
          start_time: new Date(now - (req.window === '7d' ? 7 * 86400000 : 86400000)).toISOString(),
          statistic_ids: ids,
          period: 'hour',
          types: ['min', 'max', 'mean'],
        });
        const range: Record<string, Stats24h> = {};
        for (const id of ids) {
          const stats = aggregateStatistics(response[id]);
          if (stats !== null) range[id] = stats;
        }
        result.range = range;
      } catch {
        result.failed = true;
      }
    })(),
    (async () => {
      const ids = [...new Set(req.dailyTotals)];
      if (ids.length === 0) return;
      try {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 7);
        const response = await hass.callWS<Record<string, DailyRow[]>>({
          type: 'recorder/statistics_during_period',
          start_time: start.toISOString(),
          statistic_ids: ids,
          period: 'day',
          types: ['change'],
        });
        const dailyTotals: Record<string, Stats24h> = {};
        for (const id of ids) {
          const stats = aggregateDailyTotals(response[id], now);
          if (stats !== null) dailyTotals[id] = stats;
        }
        result.dailyTotals = dailyTotals;
      } catch {
        result.failed = true;
      }
    })(),
    (async () => {
      const ids = [...new Set(req.daytime)];
      if (ids.length === 0) return;
      try {
        const start = now - (req.window === '7d' ? 7 * 86400000 : 86400000);
        const response = await hass.callWS<Record<string, { s?: unknown; lu?: number }[]>>({
          type: 'history/history_during_period',
          start_time: new Date(start).toISOString(),
          end_time: new Date(now).toISOString(),
          entity_ids: ids,
          minimal_response: true,
          no_attributes: true,
          significant_changes_only: false,
        });
        const daytime: Record<string, Stats24h> = {};
        for (const id of ids) {
          const stats = aggregateDaytime(response[id], start, now);
          if (stats !== null) daytime[id] = stats;
        }
        result.daytime = daytime;
      } catch {
        result.failed = true;
      }
    })(),
  ]);
  return result;
}
