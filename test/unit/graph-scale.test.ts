import { expect } from '@open-wc/testing';
import { graphScale, niceStep } from '../../src/calc/graph-scale.js';

describe('niceStep', () => {
  for (const [span, target, expected] of [
    [7, 2, 5], [0.37, 2, 0.2], [6700, 2, 5000], [0, 2, 1], [-1, 2, 1],
    [2, 2, 1], [4, 2, 2], [5, 2, 2.5], [10, 2, 5], [18, 2, 10], [7, 4, 2],
  ]) {
    it(`rounds span ${span} with target ${target} to ${expected}`, () => {
      expect(niceStep(span, target)).to.equal(expected);
    });
  }
});

describe('graphScale', () => {
  it('preserves two decimal places for narrow VPD observations', () => {
    const labels = graphScale([1.06, 1.11], null, null).ticks.map(tick => tick.label);
    expect(new Set(labels).size).to.equal(labels.length);
    for (const label of labels) expect(label).to.match(/^\d+\.\d{2}$/);
  });

  it('formats labels from the step rather than the value magnitude', () => {
    for (const [values, labels] of [
      [[20, 24], ['20', '22', '24']],
      [[0, 500], ['0', '250', '500']],
      [[1.06, 1.09], ['1.06', '1.08', '1.10']],
      [[0, 0.5], ['0', '0.25', '0.50']],
      [[0, 5], ['0', '2.5', '5.0']],
      [[-0.5, 0], ['-0.50', '-0.25', '0']],
      [[2000, 3000], ['2.0k', '2.5k', '3.0k']],
      [[20000, 40000], ['20k', '30k', '40k']],
      [[-3000, -2000], ['-3.0k', '-2.5k', '-2.0k']],
      [[1000, 1004], ['1000', '1002', '1004']],
    ] as const) {
      expect(graphScale(values, null, null).ticks.map(tick => tick.label)).to.deep.equal(labels);
    }
  });

  it('never duplicates tick labels across 200 seeded ranges', () => {
    let seed = 47;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    for (let i = 0; i < 200; i++) {
      const magnitude = 10 ** (Math.floor(random() * 9) - 4);
      const low = (random() - 0.5) * 1000 * magnitude;
      const high = low + (0.01 + random() * 10) * magnitude;
      const labels = graphScale([low, high], null, null).ticks.map(tick => tick.label);
      expect(new Set(labels).size, `range ${low}–${high}: ${labels.join(', ')}`).to.equal(labels.length);
    }
  });

  it('snaps temperature observations to nice bounds independently of ideal bounds', () => {
    const scale = graphScale([20.1, 21, 22.4], 12, 32);
    // span / 2 = 1.15, so the specified ceiling nice step is 2.
    expect(scale.ticks).to.deep.equal([
      { f: 0, label: '20' }, { f: 0.5, label: '22' }, { f: 1, label: '24' },
    ]);
    expect(scale.map(20)).to.equal(0);
    expect(scale.map(24)).to.equal(1);
    expect(scale.map(20.1)).to.be.closeTo(0.025, 1e-12);
    expect(scale.map(22.4)).to.be.closeTo(0.6, 1e-12);
    expect(scale.thresholdLow).to.equal(-2);
    expect(scale.thresholdHigh).to.equal(3);
    expect(scale.map(16)).to.equal(-1);
    expect(scale.map(28)).to.equal(2);
  });

  it('pads flat series by five percent or at least half a unit', () => {
    for (const [value, low, high] of [[20, 19, 21], [-20, -21, -19], [0, -0.5, 0.5], [0.1, -0.5, 1]]) {
      const scale = graphScale([value, value], null, null);
      expect(scale.map(low)).to.equal(0);
      expect(scale.map(high)).to.equal(1);
      expect(scale.map(value)).to.be.closeTo((value - low) / (high - low), 1e-12);
      expect(scale.ticks[0].f).to.equal(0);
      expect(scale.ticks.at(-1)!.f).to.equal(1);
    }
  });

  it('pads nearly flat series below the specified tolerance', () => {
    const scale = graphScale([20, 20 + 5e-10], 12, 32);
    expect(scale.map(18)).to.equal(0);
    expect(scale.map(22)).to.equal(1);
  });

  it('ignores null and nonfinite samples and maps invalid inputs to null', () => {
    const scale = graphScale([null, NaN, Infinity, -Infinity, 20.1, 22.4], 12, 32);
    expect(scale.ticks).to.deep.equal(graphScale([20.1, 22.4], 12, 32).ticks);
    for (const value of [null, NaN, Infinity, -Infinity]) expect(scale.map(value)).to.equal(null);
  });

  it('returns no ticks, thresholds, or mapping when no finite samples exist', () => {
    for (const values of [[], [null], [NaN, Infinity, -Infinity]]) {
      const scale = graphScale(values, 12, 32);
      expect(scale.ticks).to.deep.equal([]);
      expect(scale.thresholdLow).to.equal(null);
      expect(scale.thresholdHigh).to.equal(null);
      for (const value of [null, 20, NaN, Infinity]) expect(scale.map(value)).to.equal(null);
    }
  });

  it('keeps observed scaling but removes thresholds for invalid ideal bounds', () => {
    for (const [min, max] of [
      [null, 32], [12, null], [null, null], [12, 12], [32, 12],
      [NaN, 32], [12, NaN], [Infinity, 32], [12, Infinity], [-Infinity, 32], [12, -Infinity],
    ]) {
      const scale = graphScale([20.1, 22.4], min, max);
      expect(scale.thresholdLow).to.equal(null);
      expect(scale.thresholdHigh).to.equal(null);
      expect(scale.map(20)).to.equal(0);
      expect(scale.map(24)).to.equal(1);
    }
  });

  it('uses linear illuminance scaling and compact k labels', () => {
    const scale = graphScale([0, 6700], 2000, 30000);
    expect(scale.ticks).to.deep.equal([
      { f: 0, label: '0' }, { f: 0.5, label: '5k' }, { f: 1, label: '10k' },
    ]);
    expect(scale.map(6700)).to.equal(0.67);
    expect(scale.thresholdLow).to.equal(0.2);
    expect(scale.thresholdHigh).to.equal(3);
  });

  it('generates ascending fractional ticks including both decimal domain edges', () => {
    const scale = graphScale([-0.1, 0.27], -0.05, 0.2);
    expect(scale.ticks).to.deep.equal([
      { f: 0, label: '-0.2' }, { f: 1 / 3, label: '0' },
      { f: 2 / 3, label: '0.2' }, { f: 1, label: '0.4' },
    ]);
    for (const tick of scale.ticks) expect(tick.f).to.be.within(0, 1);
  });
});
