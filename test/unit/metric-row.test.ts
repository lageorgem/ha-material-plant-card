import { expect, fixture, html } from '@open-wc/testing';
import { describeWithStats, MplMetricRow } from '../../src/full/metric-row';
import { describeMeasurement, gaugeFraction } from '../../src/calc/measurements';
import type { GaugeTone, Measurement } from '../../src/types';
import type { Stats24h } from '../../src/data/history-stats';

const moisture: Measurement = {
  key: 'moisture', label: 'Moisture', icon: 'mdi:water', unit: '%',
  value: 13, min: 15, max: 65, status: 'low', fraction: 0.99,
};
const stats: Stats24h = { min: 12, max: 31, mean: 22 };

async function row(
  measurement = moisture,
  history: Stats24h | null = stats,
  tone: GaugeTone = 'problem',
  hideUnits = false,
): Promise<MplMetricRow> {
  return fixture<MplMetricRow>(html`
    <mpl-metric-row .measurement=${measurement} .stats=${history}
      .tone=${tone} .hideUnits=${hideUnits}></mpl-metric-row>
  `);
}

function element(el: MplMetricRow, selector: string): HTMLElement {
  return el.shadowRoot!.querySelector<HTMLElement>(selector)!;
}

describe('mpl-metric-row', () => {
  it('renders the moisture example in a 40px content grid', async () => {
    const el = await row();
    const style = getComputedStyle(el);
    expect(style.display).to.equal('grid');
    expect(style.gridTemplateRows).to.equal('16px 24px');
    expect(style.gridTemplateColumns.split(' ').slice(0, 2)).to.deep.equal(['40px', '76px']);
    expect(style.columnGap).to.equal('12px');
    expect(el.getBoundingClientRect().height).to.equal(40);
    expect(element(el, '.label').textContent).to.equal('Moisture');
    expect(element(el, '.value').textContent!.trim()).to.equal('13%');
    expect(element(el, '.unit').textContent).to.equal('%');
    expect(element(el, 'ha-icon').getAttribute('icon')).to.equal('mdi:water');
    expect(element(el, '.ideal').textContent).to.equal('Ideal 15–65');
    expect(element(el, '.history').textContent).to.equal('24h 12–31');
  });

  it('abbreviates illuminance captions and formats the number without its unit', async () => {
    const el = await row({ ...moisture, key: 'illuminance', label: 'Illuminance',
      value: 22, min: 2000, max: 30000, unit: 'lx' });
    expect(element(el, '.ideal').textContent).to.equal('Ideal 2k–30k');
    expect(element(el, '.value').textContent!.trim()).to.equal('22lx');
  });

  it('omits units when hidden or empty and shows an em dash for a null value', async () => {
    for (const [measurement, hideUnits] of [
      [moisture, true], [{ ...moisture, unit: '' }, false],
    ] as const) {
      const el = await row(measurement, stats, 'ok', hideUnits);
      expect(el.shadowRoot!.querySelector('.unit')).to.equal(null);
      expect(element(el, '.value').textContent!.trim()).to.equal('13');
    }
    const el = await row({ ...moisture, value: null }, null, 'unknown', true);
    expect(element(el, '.value').textContent!.trim()).to.equal('—');
  });

  it('omits only the unavailable caption parts', async () => {
    for (const measurement of [{ ...moisture, min: null }, { ...moisture, max: null }]) {
      const el = await row(measurement);
      expect(el.shadowRoot!.querySelector('.ideal')).to.equal(null);
      expect(element(el, '.history').textContent).to.equal('24h 12–31');
    }
    const el = await row(moisture, null);
    expect(el.shadowRoot!.querySelector('.history')).to.equal(null);
    expect(element(el, '.ideal').textContent).to.equal('Ideal 15–65');
    const neither = await row({ ...moisture, min: null }, null);
    expect(element(neither, '.caption').children.length).to.equal(0);
  });

  it('maps all range-bar properties from the raw values, including logarithmic lx', async () => {
    for (const measurement of [moisture, { ...moisture, value: 4000, min: 2000, max: 30000, unit: 'lx' }]) {
      const history = measurement.unit === 'lx' ? { min: 3000, max: 20000, mean: 10000 } : stats;
      const el = await row(measurement, history);
      const bar = element(el, 'mpl-range-bar') as HTMLElement & {
        value: number | null; spanFrom: number | null; spanTo: number | null;
        avg: number | null; tone: GaugeTone;
      };
      const fraction = (value: number | null) => gaugeFraction(value, measurement.min, measurement.max, measurement.unit);
      expect(bar.value).to.equal(fraction(measurement.value));
      expect(bar.spanFrom).to.equal(fraction(history.min));
      expect(bar.spanTo).to.equal(fraction(history.max));
      expect(bar.avg).to.equal(fraction(history.mean));
      expect(bar.tone).to.equal('problem');
      el.stats = null;
      el.tone = 'advisory';
      await el.updateComplete;
      expect(bar.spanFrom).to.equal(null);
      expect(bar.spanTo).to.equal(null);
      expect(bar.avg).to.equal(null);
      expect(bar.tone).to.equal('advisory');
      el.measurement = { ...measurement, value: null, min: null };
      el.stats = stats;
      await el.updateComplete;
      expect(bar.value).to.equal(null);
      expect(bar.spanFrom).to.equal(null);
      expect(bar.spanTo).to.equal(null);
      expect(bar.avg).to.equal(null);
    }
  });

  it('uses ancestor semantic tokens for every tone and value style', async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div style="--mpl-success:#008000; --mpl-error:#ff0000;
        --mpl-error-container:#ffeeee; --mpl-on-error-container:#800000;
        --mpl-surface-container-highest:#dddddd; --mpl-on-surface-variant:#444444;
        --mpl-on-surface:#111111">
        <span class="mix-reference" style="background:color-mix(in srgb, var(--mpl-success) 20%, transparent)"></span>
        <mpl-metric-row .measurement=${moisture}></mpl-metric-row>
      </div>
    `);
    const el = wrapper.querySelector('mpl-metric-row')!;
    const cases: [GaugeTone, string, string, string, string][] = [
      ['ok', getComputedStyle(wrapper.querySelector('.mix-reference')!).backgroundColor,
        'rgb(0, 128, 0)', 'rgb(17, 17, 17)', '500'],
      ['problem', 'rgb(255, 238, 238)', 'rgb(128, 0, 0)', 'rgb(255, 0, 0)', '700'],
      ['advisory', 'rgb(221, 221, 221)', 'rgb(68, 68, 68)', 'rgb(17, 17, 17)', '500'],
      ['unknown', 'rgb(221, 221, 221)', 'rgb(68, 68, 68)', 'rgb(17, 17, 17)', '500'],
    ];
    for (const [tone, background, iconColor, valueColor, weight] of cases) {
      el.tone = tone;
      await el.updateComplete;
      expect(getComputedStyle(element(el, '.icon')).backgroundColor).to.equal(background);
      const icon = getComputedStyle(element(el, 'ha-icon'));
      expect(icon.color).to.equal(iconColor);
      expect(icon.width).to.equal('20px');
      expect(icon.height).to.equal('20px');
      expect(icon.display).to.equal('flex');
      expect(icon.alignItems).to.equal('center');
      expect(icon.justifyContent).to.equal('center');
      expect(getComputedStyle(element(el, '.value')).color).to.equal(valueColor);
      expect(getComputedStyle(element(el, '.value')).fontWeight).to.equal(weight);
      expect(getComputedStyle(element(el, '.unit')).color).to.equal('rgb(68, 68, 68)');
    }
  });

  it('ellipsizes long labels and captions without expanding the 76px column', async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div style="width:287px">
        <mpl-metric-row .measurement=${{ ...moisture, label: 'A very long soil temperature measurement label' }}
          .stats=${{ min: -12345, max: 98765, mean: 22 }}></mpl-metric-row>
      </div>
    `);
    const el = wrapper.querySelector('mpl-metric-row')!;
    await el.updateComplete;
    const label = element(el, '.label');
    expect(label.getBoundingClientRect().width).to.equal(76);
    expect(label.scrollWidth).to.be.greaterThan(label.clientWidth);
    for (const selector of ['.label', '.ideal', '.history']) {
      const style = getComputedStyle(element(el, selector));
      expect(style.whiteSpace).to.equal('nowrap');
      expect(style.overflow).to.equal('hidden');
      expect(style.textOverflow).to.equal('ellipsis');
    }
    expect(el.getBoundingClientRect().height).to.equal(40);
    expect(el.scrollWidth).to.equal(el.clientWidth);
  });
});

describe('describeWithStats', () => {
  it('returns the measurement description unchanged without history', () => {
    expect(describeWithStats(moisture, null)).to.equal(describeMeasurement(moisture));
  });

  it('adds the formatted range and average without units', () => {
    expect(describeWithStats(moisture, stats)).to.equal(
      'Moisture: 13 % (15–65 %) · low · last 24 h 12–31, average 22',
    );
    expect(describeWithStats(moisture, { min: 2000, max: 30000, mean: 12500 })).to.equal(
      `${describeMeasurement(moisture)} · last 24 h 2k–30k, average 13k`,
    );
  });
});
