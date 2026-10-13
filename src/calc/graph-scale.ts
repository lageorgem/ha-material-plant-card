export interface GraphTick {
  f: number;
  label: string;
  kind: 'min' | 'avg' | 'max';
}

export interface GraphScale {
  map: (v: number | null) => number | null;
  ticks: GraphTick[];
  thresholdLow: number | null;
  thresholdHigh: number | null;
}

export function niceStep(span: number, targetTicks: number): number {
  if (span <= 0) return 1;
  const raw = span / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const factor of [1, 2, 2.5, 5, 10]) {
    const step = magnitude * factor;
    if (step >= raw) return step;
  }
  return magnitude * 10;
}

function spacingDecimals(spacing: number): number {
  return Math.max(0, -Math.floor(Math.log10(spacing) + 1e-9));
}

function tickLabel(value: number, span: number, extraDecimals = 0): string {
  if (value === 0) return '0';
  const compact = Math.abs(value) >= 1000 && span >= 400;
  const divisor = compact ? 1000 : 1;
  const label = (value / divisor).toFixed(spacingDecimals(span / divisor / 4) + extraDecimals);
  return Number(label) === 0 && value < 0 ? '0' : `${label}${compact ? 'k' : ''}`;
}

export function graphScale(
  values: readonly (number | null)[],
  min: number | null,
  max: number | null,
): GraphScale {
  let lo0 = Infinity;
  let hi0 = -Infinity;
  let count = 0;
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    lo0 = Math.min(lo0, value);
    hi0 = Math.max(hi0, value);
    count++;
  }
  if (lo0 > hi0) return { map: () => null, ticks: [], thresholdLow: null, thresholdHigh: null };
  let avg = 0;
  for (const value of values) {
    if (value !== null && Number.isFinite(value)) avg += value / count;
  }
  const flat = hi0 - lo0 < 1e-9;
  const observedLow = lo0;
  if (flat) {
    const pad = Math.max(Math.abs(lo0) * 0.05, 0.5);
    lo0 -= pad;
    hi0 += pad;
  }
  const lo = lo0;
  const hi = hi0;
  const span = hi - lo;
  const map = (value: number | null): number | null =>
    value === null || !Number.isFinite(value) ? null : (value - lo) / span;
  let ticks: GraphTick[];
  if (flat) {
    ticks = [{ f: 0.5, kind: 'avg', label: tickLabel(observedLow, span) }];
  } else {
    let labels = [lo, avg, hi].map(value => tickLabel(value, span));
    for (let extra = 1; extra <= 3 && new Set(labels).size < 3; extra++) {
      labels = [lo, avg, hi].map(value => tickLabel(value, span, extra));
    }
    const averageFraction = map(avg)!;
    ticks = [
      { f: 0, kind: 'min', label: labels[0] },
      {
        f: averageFraction, kind: 'avg',
        label: Math.abs(averageFraction) < 0.22 || Math.abs(averageFraction - 1) < 0.22 ? '' : labels[1],
      },
      { f: 1, kind: 'max', label: labels[2] },
    ];
  }
  const validIdeal = min !== null && max !== null && Number.isFinite(min) && Number.isFinite(max) && min < max;
  return {
    map, ticks,
    thresholdLow: validIdeal ? map(min) : null,
    thresholdHigh: validIdeal ? map(max) : null,
  };
}
