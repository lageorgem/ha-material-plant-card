import { DEFAULT_GAUGES } from '../types';
import type { FullDisplay, HistoryPeriod, MaterialPlantCardConfig, MetricConfig, ProblemTrigger } from '../types';
import { localDayStart } from '../data/history-stats';

export const PERIOD_MS: Readonly<Record<HistoryPeriod, number>> = {
  today: 86400000, // Fetch sizing only; today's actual start is local midnight.
  '24h': 86400000,
  '3d': 259200000,
  '7d': 604800000,
  '14d': 1209600000,
  '30d': 2592000000,
};

export function periodStart(period: HistoryPeriod, now: number, timeZone?: string): number {
  return period === 'today' ? localDayStart(now, 0, timeZone) : now - PERIOD_MS[period];
}

export interface ResolvedMetric {
  icon?: string;
  period: HistoryPeriod;
  periodMs: number;
  days: number;
  trigger: ProblemTrigger;
  display: FullDisplay;
  daylightOnly: boolean;
  daylightOffset: number;
}

function validPeriod(value: unknown): value is HistoryPeriod {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PERIOD_MS, value);
}

function validDisplay(value: unknown): value is FullDisplay {
  return value === 'summary' || value === 'graph';
}

function validTrigger(value: unknown): value is ProblemTrigger {
  return value === 'plant' || value === 'out_of_range' || value === 'low' || value === 'high' || value === 'never';
}

export function normalizeMetrics(cfg: MaterialPlantCardConfig): MetricConfig[] {
  if (Array.isArray(cfg.metrics)) {
    const seen = new Set<string>();
    return cfg.metrics.filter((entry): entry is MetricConfig => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)
        || typeof entry.type !== 'string' || entry.type.length === 0 || seen.has(entry.type)) return false;
      seen.add(entry.type);
      return true;
    });
  }
  if (Array.isArray(cfg.show_bars)) {
    return [...new Set(cfg.show_bars.filter(type => typeof type === 'string'))].map(type => ({ type }));
  }
  return DEFAULT_GAUGES.map(type => ({ type }));
}

export function resolveMetric(m: MetricConfig): ResolvedMetric {
  const period = validPeriod(m.period) ? m.period : 'today';
  const days = typeof m.days === 'number' && Number.isFinite(m.days)
    ? Math.max(1, Math.min(30, Math.round(m.days))) : 7;
  const trigger = validTrigger(m.problem_trigger) ? m.problem_trigger : 'plant';
  const display = validDisplay(m.display) ? m.display : 'summary';
  const daylightOffset = typeof m.daylight_offset === 'number' && Number.isFinite(m.daylight_offset)
    ? Math.max(0, Math.min(180, Math.round(m.daylight_offset))) : 30;
  return {
    icon: typeof m.icon === 'string' && m.icon.length > 0 ? m.icon : undefined,
    period, periodMs: PERIOD_MS[period], days, trigger, display,
    daylightOnly: m.type === 'illuminance' && (typeof m.daylight_only === 'boolean' ? m.daylight_only : true),
    daylightOffset,
  };
}
