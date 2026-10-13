import { DEFAULT_ICONS, MEASUREMENT_LABELS } from '../types';
import { resolveMetric } from './metric-settings';
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
  iconOverrides?: Partial<Record<string, string>>,
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
    const override = iconOverrides?.[key];
    const icon = typeof override === 'string' && override.length > 0 ? override
      : typeof entry.icon === 'string' && entry.icon.length > 0 ? entry.icon : fallbackIcon;
    measurements.push({
      key, label: labelFor(key), sensor, icon, unit, value, min, max,
      status: gaugeStatus(value, min, max), fraction: gaugeFraction(value, min, max, unit),
    });
  }
  return measurements;
}

function roundDecimal(value: number, digits: number): number {
  // Shift the decimal exponent instead of multiplying binary floats; ties round away from zero.
  const [coefficient, exponent = '0'] = String(Math.abs(value)).split('e');
  const shifted = Number(`${coefficient}e${Number(exponent) + digits}`);
  return Math.sign(value) * Math.round(shifted) / 10 ** digits;
}

export function formatValue(value: number | null, unit: string, hideUnits = false): string {
  if (value === null) return '—';
  const magnitude = Math.abs(value);
  let text: string;
  if (magnitude >= 10000) text = `${roundDecimal(value / 1000, 0)}k`;
  else if (magnitude >= 1000) text = `${roundDecimal(value / 1000, 1)}k`;
  else if (magnitude >= 100) text = String(roundDecimal(value, 0));
  else text = String(roundDecimal(value, magnitude >= 10 ? 1 : 2));
  const suffix = hideUnits ? '' : unit === '%' ? '%' : ['°C', '°F', '°'].includes(unit) ? '°' : '';
  return text + suffix;
}

export function tooltipLines(m: Measurement): [string, string] {
  const num = (value: number): string => {
    const magnitude = Math.abs(value);
    return String(roundDecimal(value, magnitude >= 100 ? 0 : magnitude >= 10 ? 1 : 2));
  };
  const unit = m.unit ? ` ${m.unit}` : '';
  const status = m.status === 'low' ? ' · too low' : m.status === 'high' ? ' · too high' : '';
  const value = m.value === null ? '—' : num(m.value);
  const range = m.min === null || m.max === null ? '' : ` · ideal ${num(m.min)}–${num(m.max)}${unit}`;
  return [m.label + status, `${value}${unit}${range}`];
}

export function describeMeasurement(m: Measurement): string {
  const unit = m.unit ? ` ${m.unit}` : '';
  const value = m.value === null ? '—' : String(m.value);
  const range = m.min === null || m.max === null ? '' : ` (${String(m.min)}–${String(m.max)}${unit})`;
  const status = m.status === 'low' || m.status === 'high' ? ` · ${m.status}` : '';
  return `${m.label}: ${value}${unit}${range}${status}`.replace(/ {2,}/g, ' ');
}

export function toneFor(m: Measurement, problems: readonly Problem[]): GaugeTone {
  if (m.status === 'unknown') return 'unknown';
  if (m.status === 'ok') return 'ok';
  return problems.some(problem => problem.key === m.key) ? 'problem' : 'advisory';
}

export function activeProblems(
  plant: { state: string; attributes: Record<string, unknown> } | undefined,
  measurements: readonly Measurement[],
  config: MaterialPlantCardConfig,
): Problem[] {
  const problems: Problem[] = [];
  const seen = new Set<string>();
  const entries = plant?.attributes.problems;
  const plantProblems = new Map<string, Problem>();
  if (Array.isArray(entries)) {
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const { sensor_type: key, status } = entry as Record<string, unknown>;
      if (typeof key !== 'string' || plantProblems.has(key)) continue;
      const text = typeof status === 'string' ? status : '';
      plantProblems.set(key, {
        key, label: labelFor(key), status: /low/i.test(text) ? 'low' : /high/i.test(text) ? 'high' : 'problem',
      });
    }
  }
  for (const m of measurements) {
    if (seen.has(m.key)) continue;
    const trigger = resolveMetric(config, m.key).trigger;
    if (trigger === 'plant') {
      const problem = plantProblems.get(m.key);
      if (!problem) continue;
      problems.push({ ...problem, label: m.label });
    } else {
      if (m.status !== 'low' && m.status !== 'high') continue;
      if (trigger !== 'out_of_range' && trigger !== m.status) continue;
      problems.push({ key: m.key, label: m.label, status: m.status });
    }
    seen.add(m.key);
  }
  const shown = new Set(measurements.map(m => m.key));
  for (const [key, problem] of plantProblems) {
    if (shown.has(key) || seen.has(key) || resolveMetric(config, key).trigger !== 'plant') continue;
    problems.push(problem);
    seen.add(key);
  }
  if (!Array.isArray(entries) && plant?.state === 'problem' && config.problem_source !== 'gauges' && !seen.has('plant')) {
    problems.push({ key: 'plant', label: 'Needs attention', status: 'problem' });
  }
  return problems;
}

export function batteryInfo(state: { state: string } | undefined, warn = 10): BatteryInfo {
  const value = toNumber(state?.state);
  const level = value === null ? null : Math.max(0, Math.min(100, Math.round(value)));
  const threshold = Number.isFinite(warn) ? warn : 10;
  const tone = level === null ? 'unknown' : level < threshold ? 'low' : 'ok';
  return { level, tone };
}
