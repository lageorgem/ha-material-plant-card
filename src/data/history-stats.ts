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

export function withCurrent(stats: Stats24h | null, value: number | null): Stats24h | null {
  if (stats === null || value === null) return stats;
  return { min: Math.min(stats.min, value), max: Math.max(stats.max, value), mean: stats.mean };
}

export async function fetch24hStats(
  hass: { callWS: <T>(msg: Record<string, unknown>) => Promise<T> },
  sensorIds: readonly string[],
  now: number = Date.now(),
): Promise<Record<string, Stats24h>> {
  const ids = [...new Set(sensorIds)];
  if (ids.length === 0) return {};
  try {
    const response = await hass.callWS<Record<string, StatRow[]>>({
      type: 'recorder/statistics_during_period',
      start_time: new Date(now - 86400000).toISOString(),
      statistic_ids: ids,
      period: 'hour',
      types: ['min', 'max', 'mean'],
    });
    const result: Record<string, Stats24h> = {};
    for (const id of ids) {
      const stats = aggregateStatistics(response[id]);
      if (stats !== null) result[id] = stats;
    }
    return result;
  } catch {
    return {};
  }
}
