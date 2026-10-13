import { gaugeFraction } from './measurements';

export interface GraphScale {
  mode: 'full' | 'below' | 'above';
  map: (v: number | null) => number | null;
  thresholdLow: number | null;
  thresholdHigh: number | null;
}

export function graphScale(
  values: readonly (number | null)[],
  min: number | null,
  max: number | null,
  unit: string,
): GraphScale {
  let lo = Infinity;
  let hi = -Infinity;
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    lo = Math.min(lo, value);
    hi = Math.max(hi, value);
  }
  const known = min !== null && max !== null;
  if (known && lo <= hi) {
    const below = hi <= min && lo < min;
    const above = lo >= max && hi > max;
    if (below || above) {
      const low = below ? lo : max;
      const high = below ? min : hi;
      const logarithmic = unit === 'lx' && low > 0;
      const base = logarithmic ? Math.log(low) : low;
      const span = (logarithmic ? Math.log(high) : high) - base;
      return {
        mode: below ? 'below' : 'above',
        map: value => {
          if (value === null) return null;
          const transformed = logarithmic ? (value <= 0 ? -Infinity : Math.log(value)) : value;
          return Math.max(0, Math.min(1, 0.08 + 0.84 * (transformed - base) / span));
        },
        thresholdLow: below ? 0.92 : null,
        thresholdHigh: above ? 0.08 : null,
      };
    }
  }
  return {
    mode: 'full',
    map: value => gaugeFraction(value, min, max, unit),
    thresholdLow: known ? 0.2 : null,
    thresholdHigh: known ? 0.8 : null,
  };
}
