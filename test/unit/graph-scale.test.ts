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
  it('preserves two decimal places for VPD observations', () => {
    const scale = graphScale([1.06, 1.16, 1.31], null, null);
    const labels = scale.ticks.map(tick => tick.label);
    expect(new Set(labels).size).to.equal(labels.length);
    for (const label of labels) expect(label).to.match(/^\d+\.\d{2}$/);
    expect(scale.map(1.06)).to.equal(0);
    expect(scale.map(1.31)).to.equal(1);
  });

  it('formats labels from observed spacing rather than value magnitude', () => {
    for (const [values, labels] of [
      [[20, 24], ['20', '22', '24']],
      [[0, 500], ['0', '250', '500']],
      [[1.06, 1.09], ['1.060', '1.075', '1.090']],
      [[0, 0.5], ['0', '0.3', '0.5']],
      [[0, 5], ['0', '3', '5']],
      [[-0.5, 0], ['-0.5', '-0.3', '0']],
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

  it('uses exact observed temperature bounds and the arithmetic mean', () => {
    const scale = graphScale([22, 23.3, 24], 20, 26);
    expect(scale.ticks).to.deep.equal([
      { f: 0, kind: 'min', label: '22.0' },
      { f: scale.ticks[1].f, kind: 'avg', label: '23.1' },
      { f: 1, kind: 'max', label: '24.0' },
    ]);
    expect(scale.map(22)).to.equal(0);
    expect(scale.map(24)).to.equal(1);
    expect(scale.ticks[1].f).to.be.closeTo(0.55, 1e-12);
    expect(scale.thresholdLow).to.equal(-1);
    expect(scale.thresholdHigh).to.equal(2);
    expect(scale.map(18)).to.equal(-2);
    expect(scale.map(28)).to.equal(3);
    expect(new Set(scale.ticks.map(tick => tick.label)).size).to.equal(3);
  });

  it('increases label precision when rounded labels would coincide', () => {
    expect(graphScale([0.51, 0.51, 0.76, 0.76, 4.51], null, null).ticks.map(tick => tick.label))
      .to.deep.equal(['0.5', '1.4', '4.5']);
  });

  it('keeps the average line but hides its label near either edge', () => {
    for (const values of [[0, 0, 0, 0, 10], [0, 10, 10, 10, 10]]) {
      const scale = graphScale(values, null, null);
      expect(scale.ticks.map(tick => tick.kind)).to.deep.equal(['min', 'avg', 'max']);
      expect(scale.ticks[1].label).to.equal('');
      expect(scale.ticks[1].f).to.be.closeTo(values[1] === 0 ? 0.2 : 0.8, 1e-12);
    }
  });

  it('does not emit negative zero labels', () => {
    const scale = graphScale([-0.01, 2, 4], null, null);
    expect(scale.ticks[0].label).to.equal('0');
    expect(graphScale([-0, 0], null, null).ticks[0].label).to.equal('0');
  });

  it('pads flat series by five percent or at least half a unit', () => {
    for (const [value, low, high] of [[20, 19, 21], [-20, -21, -19], [0, -0.5, 0.5], [0.1, -0.4, 0.6]]) {
      const scale = graphScale([value, value], null, null);
      expect(scale.map(low)).to.equal(0);
      expect(scale.map(high)).to.equal(1);
      expect(scale.map(value)).to.be.closeTo((value - low) / (high - low), 1e-12);
      expect(scale.ticks).to.have.length(1);
      expect(scale.ticks[0].f).to.equal(0.5);
      expect(scale.ticks[0].kind).to.equal('avg');
      expect(Number(scale.ticks[0].label)).to.equal(value);
    }
  });

  it('pads nearly flat series below the specified tolerance', () => {
    const scale = graphScale([20, 20 + 5e-10], 12, 32);
    expect(scale.map(19)).to.equal(0);
    expect(scale.map(21 + 5e-10)).to.equal(1);
    expect(scale.ticks).to.have.length(1);
    expect(scale.ticks[0].f).to.equal(0.5);
    expect(scale.ticks[0].kind).to.equal('avg');
  });

  it('ignores null and nonfinite samples and maps invalid inputs to null', () => {
    const scale = graphScale([null, NaN, Infinity, -Infinity, 20.1, 22.4], 12, 32);
    expect(scale.ticks).to.deep.equal(graphScale([20.1, 22.4], 12, 32).ticks);
    for (const tick of scale.ticks) expect(Number.isFinite(tick.f)).to.equal(true);
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
      expect(scale.map(20.1)).to.equal(0);
      expect(scale.map(22.4)).to.equal(1);
    }
  });

  it('uses linear illuminance scaling and compact k labels', () => {
    const scale = graphScale([0, 6700], 2000, 30000);
    expect(scale.ticks).to.deep.equal([
      { f: 0, kind: 'min', label: '0' },
      { f: 0.5, kind: 'avg', label: '3k' },
      { f: 1, kind: 'max', label: '7k' },
    ]);
    expect(scale.map(6700)).to.equal(1);
    expect(scale.thresholdLow).to.equal(2000 / 6700);
    expect(scale.thresholdHigh).to.equal(30000 / 6700);
  });

  it('generates ascending fractional ticks including both decimal domain edges', () => {
    const scale = graphScale([-0.1, 0.27], -0.05, 0.2);
    expect(scale.ticks).to.deep.equal([
      { f: 0, kind: 'min', label: '-0.10' },
      { f: 0.5, kind: 'avg', label: '0.09' },
      { f: 1, kind: 'max', label: '0.27' },
    ]);
    for (const tick of scale.ticks) expect(tick.f).to.be.within(0, 1);
  });
});
