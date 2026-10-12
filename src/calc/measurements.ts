import { DEFAULT_ICONS, MEASUREMENT_LABELS } from '../types';
import type {
  BatteryInfo, GaugeStatus, GaugeTone, MaterialPlantCardConfig, Measurement,
  MeasurementKey, PlantInfo, Problem,
} from '../types';

function labelFor(key: string): string {
  if (Object.prototype.hasOwnProperty.call(MEASUREMENT_LABELS, key)) {
    return MEASUREMENT_LABELS[key as MeasurementKey];
  }
  const label = key.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function toNumber(v: unknown): number | null {
  if (typeof v !== 'number' && typeof v !== 'string') return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  const number = Number(v);
  return Number.isFinite(number) ? number : null;
}

export function gaugeStatus(value: number | null, min: number | null, max: number | null): GaugeStatus {
  if (value === null || min === null || max === null || min >= max) return 'unknown';
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'ok';
}

export function gaugeFraction(value: number | null, min: number | null, max: number | null, unit: string): number | null {
  if (value === null || min === null || max === null || min >= max) return null;
  let t = (value - min) / (max - min);
  if (unit === 'lx' && min > 0) {
    t = value <= 0 ? -Infinity : (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));
  }
  return Math.max(0, Math.min(1, 0.2 + 0.6 * t));
}

export function buildMeasurements(
  info: PlantInfo | undefined,
  keys: readonly string[],
  states: Record<string, { state: string; attributes: Record<string, unknown> }>,
): Measurement[] {
  const measurements: Measurement[] = [];
  for (const key of new Set(keys)) {
    if (!info || !Object.prototype.hasOwnProperty.call(info, key)) continue;
    const entry = info[key];
    if (!entry) continue;
    const sensor = entry.sensor || undefined;
    const state = sensor ? states[sensor] : undefined;
    if (sensor && !state) continue;
    const value = toNumber(state ? state.state : entry.current);
    const min = toNumber(entry.min);
    const max = toNumber(entry.max);
    const unit = String(state?.attributes.unit_of_measurement ?? entry.unit_of_measurement ?? '');
    const fallbackIcon = Object.prototype.hasOwnProperty.call(DEFAULT_ICONS, key)
      ? DEFAULT_ICONS[key as MeasurementKey] : 'mdi:help-circle-outline';
    const icon = typeof entry.icon === 'string' && entry.icon.length > 0 ? entry.icon : fallbackIcon;
    measurements.push({
      key, label: labelFor(key), sensor, icon, unit, value, min, max,
      status: gaugeStatus(value, min, max), fraction: gaugeFraction(value, min, max, unit),
    });
  }
  return measurements;
}

export function formatValue(value: number | null, unit: string, hideUnits = false): string {
  if (value === null) return '—';
  const magnitude = Math.abs(value);
  let text: string;
  if (magnitude >= 10000) text = `${Math.round(value / 1000)}k`;
  else if (magnitude >= 1000) text = `${Number((value / 1000).toFixed(1))}k`;
  else if (magnitude >= 100) text = String(Math.round(value));
  else text = String(Number(value.toFixed(magnitude >= 10 ? 1 : 2)));
  const suffix = hideUnits ? '' : unit === '%' ? '%' : ['°C', '°F', '°'].includes(unit) ? '°' : '';
  return text + suffix;
}

export function describeMeasurement(m: Measurement): string {
  const unit = m.unit ? ` ${m.unit}` : '';
  const value = m.value === null ? '—' : String(m.value);
  const range = m.min === null || m.max === null ? '' : ` (${String(m.min)}–${String(m.max)}${unit})`;
  return `${m.label}: ${value}${unit}${range}`.replace(/ {2,}/g, ' ');
}

export function toneFor(m: Measurement, problems: readonly Problem[]): GaugeTone {
  if (m.status === 'unknown') return 'unknown';
  if (m.status === 'ok') return 'ok';
  return problems.some(problem => problem.key === m.key) ? 'problem' : 'advisory';
}

export function activeProblems(
  plant: { state: string; attributes: Record<string, unknown> } | undefined,
  measurements: readonly Measurement[],
  config: Pick<MaterialPlantCardConfig, 'problem_source' | 'problem_sensors'>,
): Problem[] {
  const allowed = Array.isArray(config.problem_sensors) ? new Set(config.problem_sensors) : undefined;
  const problems: Problem[] = [];
  const seen = new Set<string>();
  if (config.problem_source === 'gauges') {
    for (const m of measurements) {
      if (m.status !== 'low' && m.status !== 'high') continue;
      if ((allowed && !allowed.has(m.key)) || seen.has(m.key)) continue;
      problems.push({ key: m.key, label: m.label, status: m.status });
      seen.add(m.key);
    }
  } else {
    const entries = plant?.attributes.problems;
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') continue;
        const { sensor_type: key, status } = entry as Record<string, unknown>;
        if (typeof key !== 'string' || (allowed && !allowed.has(key)) || seen.has(key)) continue;
        const text = typeof status === 'string' ? status : '';
        problems.push({ key, label: labelFor(key), status: /low/i.test(text) ? 'low' : /high/i.test(text) ? 'high' : 'problem' });
        seen.add(key);
      }
    } else if (plant?.state === 'problem') {
      problems.push({ key: 'plant', label: 'Needs attention', status: 'problem' });
    }
  }
  return problems;
}

export function batteryInfo(state: { state: string } | undefined, warn = 20, ok = 40): BatteryInfo {
  const value = toNumber(state?.state);
  const level = value === null ? null : Math.max(0, Math.min(100, Math.round(value)));
  const icon = level === null ? 'mdi:battery-unknown' : level >= 95 ? 'mdi:battery'
    : level <= 5 ? 'mdi:battery-outline' : `mdi:battery-${Math.round(level / 10) * 10}`;
  const tone = level === null ? 'unknown' : level >= ok ? 'ok' : level >= warn ? 'warn' : 'low';
  return { level, icon, tone };
}
