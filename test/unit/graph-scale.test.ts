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
