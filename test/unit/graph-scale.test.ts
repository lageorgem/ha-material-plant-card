import { expect } from '@open-wc/testing';
import { graphScale } from '../../src/calc/graph-scale.js';
import { gaugeFraction } from '../../src/calc/measurements.js';

describe('graphScale', () => {
  it('expands below-minimum DLI values and keeps only the minimum threshold', () => {
    const scale = graphScale([0.7, 1, 1.4], 6, 13, 'mol/m²/d');
    expect(scale.mode).to.equal('below');
    expect(scale.thresholdLow).to.equal(0.92);
    expect(scale.thresholdHigh).to.equal(null);
    expect(scale.map(0.7)).to.be.closeTo(0.08, 1e-12);
    expect(scale.map(6)).to.be.closeTo(0.92, 1e-12);
    expect(scale.map(1.4)).to.be.closeTo(0.08 + 0.84 * (1.4 - 0.7) / (6 - 0.7), 1e-12);
    expect(scale.map(-10)).to.equal(0);
    expect(scale.map(100)).to.equal(1);
    expect(scale.map(null)).to.equal(null);
  });

  it('includes samples equal to the minimum when another is below', () => {
    expect(graphScale([1, 6], 6, 13, '').mode).to.equal('below');
  });

  it('expands below-minimum lux in logarithmic space', () => {
    const scale = graphScale([10, 100], 1000, 10000, 'lx');
    expect(scale.mode).to.equal('below');
    expect(scale.map(100)).to.be.closeTo(0.5, 1e-12);
    expect(scale.map(0)).to.equal(0);
    expect(scale.map(-1)).to.equal(0);
    expect(scale.map(1000)).to.be.closeTo(0.92, 1e-12);
  });

  it('uses linear space for lux when the observed low is nonpositive', () => {
    const scale = graphScale([0, 10], 100, 1000, 'lx');
    expect(scale.map(50)).to.be.closeTo(0.5, 1e-12);
  });

  it('expands above-maximum values and keeps only the maximum threshold', () => {
    const scale = graphScale([13, 20, 27], 6, 13, '');
    expect(scale.mode).to.equal('above');
    expect(scale.thresholdLow).to.equal(null);
    expect(scale.thresholdHigh).to.equal(0.08);
    expect(scale.map(13)).to.be.closeTo(0.08, 1e-12);
    expect(scale.map(20)).to.be.closeTo(0.5, 1e-12);
    expect(scale.map(27)).to.be.closeTo(0.92, 1e-12);
    expect(scale.map(-100)).to.equal(0);
    expect(scale.map(100)).to.equal(1);
    expect(scale.map(null)).to.equal(null);
  });

  it('expands above-maximum lux in logarithmic space', () => {
    const scale = graphScale([1000, 100000], 100, 1000, 'lx');
    expect(scale.mode).to.equal('above');
    expect(scale.map(10000)).to.be.closeTo(0.5, 1e-12);
    expect(scale.map(0)).to.equal(0);
    expect(scale.map(-1)).to.equal(0);
  });

  it('uses linear space above a nonpositive lux maximum', () => {
    const scale = graphScale([0, 100], -10, 0, 'lx');
    expect(scale.mode).to.equal('above');
    expect(scale.map(50)).to.be.closeTo(0.5, 1e-12);
  });

  for (const values of [[1, 7], [12, 20], [1, 20], [6, 6], [13, 13]]) {
    it(`uses the full gauge scale for ${values.join(', ')}`, () => {
      for (const unit of ['', 'lx']) {
        const scale = graphScale(values, 6, 13, unit);
        expect(scale.mode).to.equal('full');
        expect(scale.thresholdLow).to.equal(0.2);
        expect(scale.thresholdHigh).to.equal(0.8);
        for (const value of [...values, null, 0, 6, 13]) {
          expect(scale.map(value)).to.equal(gaugeFraction(value, 6, 13, unit));
        }
      }
    });
  }

  it('ignores null and nonfinite samples when selecting adaptive modes', () => {
    expect(graphScale([null, NaN, Infinity, -Infinity, 1], 6, 13, '').mode).to.equal('below');
    expect(graphScale([null, NaN, Infinity, -Infinity, 20], 6, 13, '').mode).to.equal('above');
  });

  it('uses full mode with no finite samples', () => {
    for (const values of [[], [null], [NaN, Infinity, -Infinity]]) {
      const scale = graphScale(values, 6, 13, '');
      expect(scale.mode).to.equal('full');
      expect(scale.thresholdLow).to.equal(0.2);
      expect(scale.thresholdHigh).to.equal(0.8);
      expect(scale.map(7)).to.equal(gaugeFraction(7, 6, 13, ''));
    }
  });

  it('uses full mode with unknown thresholds when either bound is null', () => {
    for (const [min, max] of [[null, 13], [6, null], [null, null]]) {
      const scale = graphScale([1, 20], min, max, '');
      expect(scale.mode).to.equal('full');
      expect(scale.thresholdLow).to.equal(null);
      expect(scale.thresholdHigh).to.equal(null);
      expect(scale.map(1)).to.equal(null);
      expect(scale.map(null)).to.equal(null);
    }
  });
});
