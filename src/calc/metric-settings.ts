import type { FullDisplay, HistoryPeriod, MaterialPlantCardConfig, ProblemTrigger } from '../types';

export const PERIOD_MS: Readonly<Record<HistoryPeriod, number>> = {
  '24h': 86400000,
  '3d': 259200000,
  '7d': 604800000,
  '14d': 1209600000,
  '30d': 2592000000,
};

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

export function resolveMetric(cfg: MaterialPlantCardConfig, key: string): ResolvedMetric {
  const m = cfg.metrics?.[key] ?? {};
  const period = validPeriod(m.period) ? m.period : validPeriod(cfg.history_period) ? cfg.history_period : '24h';
  const days = typeof m.days === 'number' && Number.isFinite(m.days)
    ? Math.max(1, Math.min(30, Math.round(m.days))) : 7;
  const trigger = validTrigger(m.problem_trigger) ? m.problem_trigger
    : Array.isArray(cfg.problem_sensors) && cfg.problem_sensors.length > 0 && !cfg.problem_sensors.includes(key)
      ? 'never' : cfg.problem_source === 'gauges' ? 'out_of_range' : 'plant';
  const display = validDisplay(m.display) ? m.display : validDisplay(cfg.full_display) ? cfg.full_display : 'summary';
  const daylightOffset = typeof m.daylight_offset === 'number' && Number.isFinite(m.daylight_offset)
    ? Math.max(0, Math.min(180, Math.round(m.daylight_offset))) : 30;
  return {
    icon: typeof m.icon === 'string' && m.icon.length > 0 ? m.icon : undefined,
    period, periodMs: PERIOD_MS[period], days, trigger, display,
    daylightOnly: key === 'illuminance' && (typeof m.daylight_only === 'boolean' ? m.daylight_only : true),
    daylightOffset,
  };
}
