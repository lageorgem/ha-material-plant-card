export interface GraphTick {
  f: number;
  label: string;
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

function stepDecimals(step: number): number {
  const exponent = Math.floor(Math.log10(step) + 1e-9);
  const leading = step / 10 ** exponent;
  return Math.max(0, -exponent + (Math.abs(leading - 2.5) < 1e-9 ? 1 : 0));
}

function tickLabel(value: number, step: number): string {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1000 && step >= 100) {
    return `${(value / 1000).toFixed(stepDecimals(step / 1000))}k`;
  }
  return value.toFixed(stepDecimals(step));
}

export function graphScale(
  values: readonly (number | null)[],
  min: number | null,
  max: number | null,
): GraphScale {
  let lo0 = Infinity;
  let hi0 = -Infinity;
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    lo0 = Math.min(lo0, value);
    hi0 = Math.max(hi0, value);
  }
  if (lo0 > hi0) return { map: () => null, ticks: [], thresholdLow: null, thresholdHigh: null };
  if (hi0 - lo0 < 1e-9) {
    const pad = Math.max(Math.abs(lo0) * 0.05, 0.5);
    lo0 -= pad;
    hi0 += pad;
  }
  const step = niceStep(hi0 - lo0, 2);
  const lowMultiple = Math.floor(lo0 / step);
  const highMultiple = Math.ceil(hi0 / step);
  const lo = lowMultiple * step;
  const hi = highMultiple * step;
  const map = (value: number | null): number | null =>
    value === null || !Number.isFinite(value) ? null : (value - lo) / (hi - lo);
  const ticks: GraphTick[] = [];
  for (let multiple = lowMultiple; multiple <= highMultiple; multiple++) {
    const value = multiple * step;
    ticks.push({ f: map(value)!, label: tickLabel(value, step) });
  }
  const validIdeal = min !== null && max !== null && Number.isFinite(min) && Number.isFinite(max) && min < max;
  return {
    map, ticks,
    thresholdLow: validIdeal ? map(min) : null,
    thresholdHigh: validIdeal ? map(max) : null,
  };
}
