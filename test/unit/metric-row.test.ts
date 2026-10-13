import { expect, fixture, html } from '@open-wc/testing';
import { describeWithStats, formatCaptionNumber, MplMetricRow } from '../../src/full/metric-row';
import { describeMeasurement, formatValue, gaugeFraction } from '../../src/calc/measurements';
import type { GaugeTone, Measurement } from '../../src/types';
import type { MetricHistory, Stats24h } from '../../src/data/history-stats';

const moisture: Measurement = {
  key: 'moisture', label: 'Moisture', icon: 'mdi:water', unit: '%',
  value: 13, min: 15, max: 65, status: 'low', fraction: 0.99,
};
const stats: Stats24h = { min: 12, max: 31, mean: 22 };
const withStats = (stats: Stats24h | null): MetricHistory => ({
  stats, series: [], minPoint: null, maxPoint: null,
});

async function row(
  measurement = moisture,
  history: Stats24h | null = stats,
  tone: GaugeTone = 'problem',
  hideUnits = false,
  showHistory = true,
): Promise<MplMetricRow> {
  return fixture<MplMetricRow>(html`
    <mpl-metric-row .measurement=${measurement} .history=${history ? withStats(history) : null}
      .tone=${tone} .hideUnits=${hideUnits} .showHistory=${showHistory}></mpl-metric-row>
  `);
}

function element(el: MplMetricRow, selector: string): HTMLElement {
  return el.shadowRoot!.querySelector<HTMLElement>(selector)!;
}

function badges(el: MplMetricRow): HTMLElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.stat'));
}

describe('mpl-metric-row', () => {
  it('renders the inline title, value, ideal and ordered badges in a 68px grid', async () => {
    const el = await row();
    const style = getComputedStyle(el);
    expect(style.display).to.equal('grid');
    expect(style.gridTemplateRows).to.equal('20px 28px 20px');
    expect(style.gridTemplateColumns.split(' ')[0]).to.equal('88px');
    expect(style.columnGap).to.equal('12px');
    expect(style.rowGap).to.equal('0px');
    expect(el.getBoundingClientRect().height).to.equal(68);
    expect(Array.from(element(el, '.title').children).map(child => child.tagName)).to.deep.equal([
      'HA-ICON', 'SPAN', 'SPAN',
    ]);
    expect(element(el, '.label').textContent).to.equal('Moisture');
    expect(element(el, '.period').textContent).to.equal('Last 24 h');
    expect(element(el, 'ha-icon').getAttribute('icon')).to.equal('mdi:water');
    expect(element(el, 'ha-icon').getAttribute('aria-hidden')).to.equal('true');
    expect(getComputedStyle(element(el, '.title')).gap).to.equal('6px');
    expect(element(el, '.value').textContent!.trim()).to.equal('13%');
    expect(element(el, '.ideal').textContent).to.equal('Ideal 15–65');
    expect(badges(el).map(stat => [stat.children[0].textContent, stat.children[1].textContent]))
      .to.deep.equal([['Min', '12'], ['Avg', '22'], ['Max', '31']]);
    expect(el.shadowRoot!.querySelector('.caption')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.icon')).to.equal(null);
  });

  it('formats compact ideal and history numbers', async () => {
    const el = await row({ ...moisture, min: 1500, max: 25000 }, { min: 1, mean: 1.2, max: 1.37 });
    expect(element(el, '.ideal').textContent).to.equal('Ideal 1.5k–25k');
    expect(badges(el).map(stat => stat.children[1].textContent)).to.deep.equal(['1', '1.2', '1.4']);
  });

  it('defaults the period label and reactively renders custom labels only with history', async () => {
    const el = await row();
    expect(el.periodLabel).to.equal('Last 24 h');
    for (const periodLabel of ['Last 7 d', 'Daily · 7 d']) {
      el.periodLabel = periodLabel;
      await el.updateComplete;
      expect(element(el, '.period').textContent).to.equal(periodLabel);
    }
    el.showHistory = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.period')).to.equal(null);
  });

  it('keeps period labels unshrunk beside Soil temperature in a 271px row', async () => {
    const el = await row({ ...moisture, label: 'Soil temperature' });
    el.style.width = '271px';
    el.style.fontFamily = 'Arial, sans-serif';
    for (const periodLabel of ['Last 24 h', 'Last 7 d', 'Daily · 7 d']) {
      el.periodLabel = periodLabel;
      await el.updateComplete;
      const period = element(el, '.period');
      const label = element(el, '.label');
      expect(period.textContent).to.equal(periodLabel);
      expect(getComputedStyle(period).flexShrink).to.equal('0');
      expect(period.scrollWidth).to.be.at.most(period.clientWidth);
      expect(getComputedStyle(label).textOverflow).to.equal('ellipsis');
      expect(getComputedStyle(label).overflow).to.equal('hidden');
      expect(getComputedStyle(label).minWidth).to.equal('0px');
      expect(element(el, '.title').scrollWidth).to.be.at.most(element(el, '.title').clientWidth);
      expect(el.scrollWidth).to.be.at.most(el.clientWidth);
    }
  });

  for (const unit of ['mol/d⋅m²', 'mol/d·m²', 'mol/(d⋅m²)']) {
    it(`shortens only the visible ${unit} unit`, async () => {
      const measurement = { ...moisture, key: 'dli', label: 'DLI', value: 0.04, unit };
      const el = await row(measurement);
      expect(element(el, '.unit').textContent).to.equal('mol/d');
      expect(describeWithStats(measurement, stats)).to.include(`0.04 ${unit}`);
      expect(el.measurement.unit).to.equal(unit);
    });
  }

  it('omits hidden or empty units and shows an em dash for a null value', async () => {
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

  it('omits the ideal if either bound is missing', async () => {
    for (const measurement of [{ ...moisture, min: null }, { ...moisture, max: null }]) {
      const el = await row(measurement);
      expect(el.shadowRoot!.querySelector('.ideal')).to.equal(null);
      expect(badges(el)).to.have.length(3);
      expect(badges(el).some(stat => stat.classList.contains('out'))).to.equal(false);
    }
  });

  it('shows three neutral dashes without stats and hides history only when requested', async () => {
    const el = await row(moisture, null);
    expect(badges(el).map(stat => stat.children[1].textContent)).to.deep.equal(['—', '—', '—']);
    expect(badges(el).some(stat => stat.classList.contains('out'))).to.equal(false);
    expect(element(el, '.period').textContent).to.equal('Last 24 h');
    el.showHistory = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.stats')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.period')).to.equal(null);
    expect(element(el, '.ideal').textContent).to.equal('Ideal 15–65');
  });

  it('maps range-bar props from raw values, including log lx and average status', async () => {
    for (const measurement of [moisture, { ...moisture, value: 4000, min: 2000, max: 30000, unit: 'lx' }]) {
      const history = measurement.unit === 'lx' ? { min: 3000, max: 20000, mean: 10000 } : stats;
      const el = await row(measurement, history);
      const bar = element(el, 'mpl-range-bar') as HTMLElement & {
        value: number | null; spanFrom: number | null; spanTo: number | null;
        avg: number | null; avgOk: boolean | null; tone: GaugeTone; showTicks: boolean;
      };
      const fraction = (value: number | null) => gaugeFraction(value, measurement.min, measurement.max, measurement.unit);
      expect(bar.value).to.equal(fraction(measurement.value));
      expect(bar.spanFrom).to.equal(fraction(history.min));
      expect(bar.spanTo).to.equal(fraction(history.max));
      expect(bar.avg).to.equal(fraction(history.mean));
      expect(bar.avgOk).to.equal(true);
      expect(bar.showTicks).to.equal(true);
      expect(bar.tone).to.equal('problem');
      for (const mean of [measurement.min! - 1, measurement.max! + 1]) {
        el.history = withStats({ ...history, mean });
        await el.updateComplete;
        expect(bar.avgOk).to.equal(false);
      }
      el.history = null;
      el.tone = 'advisory';
      await el.updateComplete;
      expect(bar.spanFrom).to.equal(null);
      expect(bar.spanTo).to.equal(null);
      expect(bar.avg).to.equal(null);
      expect(bar.avgOk).to.equal(null);
      expect(bar.tone).to.equal('advisory');
      for (const bounds of [{ min: null }, { max: null }, { min: measurement.max }]) {
        el.measurement = { ...measurement, value: null, ...bounds };
        el.history = withStats(history);
        await el.updateComplete;
        expect(bar.value).to.equal(null);
        expect(bar.spanFrom).to.equal(null);
        expect(bar.spanTo).to.equal(null);
        expect(bar.avg).to.equal(null);
        expect(bar.avgOk).to.equal(null);
        expect(bar.showTicks).to.equal(el.measurement.min !== null && el.measurement.max !== null);
      }
    }
  });

  it('inherits semantic colours for every icon tone, value, unit and out badge', async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div style="--mpl-success:#008000; --mpl-error:#ff0000;
        --mpl-error-container:#ffeeee; --mpl-on-error-container:#800000;
        --mpl-on-surface-variant:#444444; --mpl-on-surface:#111111">
        <mpl-metric-row .measurement=${moisture} .history=${withStats({ min: 15, mean: 22, max: 70 })}></mpl-metric-row>
      </div>
    `);
    const el = wrapper.querySelector('mpl-metric-row')!;
    const cases: [GaugeTone, string, string, string][] = [
      ['ok', 'rgb(0, 128, 0)', 'rgb(17, 17, 17)', '400'],
      ['problem', 'rgb(255, 0, 0)', 'rgb(255, 0, 0)', '600'],
      ['advisory', 'rgb(68, 68, 68)', 'rgb(17, 17, 17)', '400'],
      ['unknown', 'rgb(68, 68, 68)', 'rgb(17, 17, 17)', '400'],
    ];
    for (const [tone, iconColor, valueColor, weight] of cases) {
      el.tone = tone;
      await el.updateComplete;
      const icon = getComputedStyle(element(el, 'ha-icon'));
      expect(icon.color).to.equal(iconColor);
      expect(icon.width).to.equal('18px');
      expect(icon.height).to.equal('18px');
      expect(icon.display).to.equal('flex');
      expect(icon.alignItems).to.equal('center');
      expect(icon.justifyContent).to.equal('center');
      const value = getComputedStyle(element(el, '.value'));
      expect(value.color).to.equal(valueColor);
      expect(value.fontWeight).to.equal(weight);
      expect(value.fontSize).to.equal('22px');
      expect(value.lineHeight).to.equal('28px');
      const unit = getComputedStyle(element(el, '.unit'));
      expect(unit.color).to.equal('rgb(68, 68, 68)');
      expect(unit.fontSize).to.equal('13px');
      expect(unit.marginLeft).to.equal('3px');
    }
    const [min, avg, max] = badges(el);
    for (const stat of [min, avg]) {
      expect(stat.classList.contains('out')).to.equal(false);
      expect(getComputedStyle(stat).backgroundColor).to.equal('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(stat.children[0]).color).to.equal('rgb(68, 68, 68)');
      expect(getComputedStyle(stat.children[1]).color).to.equal('rgb(17, 17, 17)');
    }
    expect(max.classList.contains('out')).to.equal(true);
    expect(getComputedStyle(max).backgroundColor).to.equal('rgb(255, 238, 238)');
    for (const child of max.children) expect(getComputedStyle(child).color).to.equal('rgb(128, 0, 0)');
  });

  it('fits three out-of-range VPD badges in a 271px row', async () => {
    const el = await row({ ...moisture, key: 'vpd', label: 'VPD', unit: 'kPa', min: 0.4, max: 1.6 },
      { min: 0.2, mean: 1.8, max: 2.1 });
    el.style.width = '271px';
    el.style.fontFamily = 'Arial, sans-serif';
    expect(badges(el).every(stat => stat.classList.contains('out'))).to.equal(true);
    expect(badges(el).map(stat => stat.children[1].textContent)).to.deep.equal(['0.2', '1.8', '2.1']);
    const history = element(el, '.stats');
    expect(history.scrollWidth).to.be.at.most(history.clientWidth);
    expect(el.scrollWidth).to.be.at.most(el.clientWidth);
  });

  it('does not truncate DLI 0.04 mol/d or Ideal 1.5k–25k in a 271px row', async () => {
    const el = await row({ ...moisture, key: 'dli', label: 'DLI', value: 0.04,
      unit: 'mol/d⋅m²', min: 1500, max: 25000 });
    el.style.width = '271px';
    el.style.fontFamily = 'Arial, sans-serif';
    expect(element(el, '.value').textContent!.trim()).to.equal('0.04mol/d');
    expect(element(el, '.ideal').textContent).to.equal('Ideal 1.5k–25k');
    for (const selector of ['.value', '.ideal']) {
      const content = element(el, selector);
      expect(content.scrollWidth).to.be.at.most(content.clientWidth);
      const style = getComputedStyle(content);
      expect(style.overflow).to.equal('hidden');
      expect(style.whiteSpace).to.equal('nowrap');
      expect(style.textOverflow).to.equal('ellipsis');
    }
  });

  it('ellipsizes long labels without expanding the grid or displacing the period', async () => {
    const el = await row({ ...moisture, label: 'A very long soil temperature measurement label' });
    el.style.width = '271px';
    const label = element(el, '.label');
    expect(label.scrollWidth).to.be.greaterThan(label.clientWidth);
    const style = getComputedStyle(label);
    expect(style.whiteSpace).to.equal('nowrap');
    expect(style.overflow).to.equal('hidden');
    expect(style.textOverflow).to.equal('ellipsis');
    const period = element(el, '.period');
    expect(period.scrollWidth).to.be.at.most(period.clientWidth);
    expect(el.getBoundingClientRect().height).to.equal(68);
    expect(el.scrollWidth).to.equal(el.clientWidth);
  });
});

describe('mpl-metric-row graph display', () => {
  const start = new Date(2026, 9, 13, 10, 15).getTime();
  const hour = 3600000;
  const history: MetricHistory = {
    stats,
    series: [{ t: start, v: 12 }, { t: start + hour, v: null }, { t: start + 2 * hour, v: 31 }],
    minPoint: { t: start, v: 12 }, maxPoint: { t: start + 2 * hour, v: 31 },
  };
  type GraphProps = {
    points: { t: number; f: number | null; label: string }[];
    start: number; end: number;
    minMarker: { t: number; f: number; ok: boolean } | null;
    maxMarker: { t: number; f: number; ok: boolean } | null;
    current: { t: number; f: number; tone: GaugeTone } | null;
    summary: string;
  };
  const graph = (el: MplMetricRow) => element(el, 'mpl-history-graph') as HTMLElement & GraphProps;
  async function graphRow(measurement = moisture, data: MetricHistory | null = history) {
    return fixture<MplMetricRow>(html`
      <mpl-metric-row .measurement=${measurement} .history=${data}
        display="graph" locale="en-GB" tone="problem"></mpl-metric-row>
    `);
  }

  it('defaults to summary and replaces only the right column in graph mode', async () => {
    const summary = await row();
    expect(summary.display).to.equal('summary');
    expect(summary.daily).to.equal(false);
    expect(summary.periodText).to.equal('last 24 h');
    expect(summary.shadowRoot!.querySelector('mpl-history-graph')).to.equal(null);
    const el = await graphRow();
    expect(el.shadowRoot!.querySelector('mpl-range-bar')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.stats')).to.equal(null);
    expect(element(el, '.value').textContent!.trim()).to.equal('13%');
    expect(element(el, '.ideal').textContent).to.equal('Ideal 15–65');
    const style = getComputedStyle(graph(el));
    expect(style.gridColumnStart).to.equal('2');
    expect(style.gridRowStart).to.equal('2');
    expect(style.gridRowEnd).to.equal('4');
    expect(graph(el).getBoundingClientRect().height).to.equal(48);
    expect(el.getBoundingClientRect().height).to.equal(68);
    el.display = 'summary';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('mpl-history-graph')).to.equal(null);
    expect(badges(el)).to.have.length(3);
  });

  it('maps fractions, gaps, markers, last-point current and period summary', async () => {
    for (const measurement of [moisture, { ...moisture, unit: 'lx', min: 10, max: 100 }]) {
      const el = await graphRow(measurement);
      el.periodText = 'daylight, last 3 days';
      await el.updateComplete;
      const props = graph(el);
      const f = (v: number | null) => gaugeFraction(v, measurement.min, measurement.max, measurement.unit);
      expect(props.start).to.equal(start);
      expect(props.end).to.equal(start + 2 * hour);
      expect(props.points.map(p => [p.t, p.f])).to.deep.equal(history.series.map(p => [p.t, f(p.v)]));
      expect(props.minMarker).to.deep.equal({ t: start, f: f(12), ok: measurement.unit === 'lx' });
      expect(props.maxMarker).to.deep.equal({ t: start + 2 * hour, f: f(31), ok: true });
      expect(props.current).to.deep.equal({ t: start + 2 * hour, f: f(31), tone: 'problem' });
      expect(props.summary).to.equal(describeWithStats(measurement, stats, el.periodText));
      el.tone = 'advisory';
      await el.updateComplete;
      expect(props.current!.tone).to.equal('advisory');
      el.history = { ...history, series: [...history.series, { t: start + 3 * hour, v: null }] };
      await el.updateComplete;
      expect(props.current).to.equal(null);
    }
  });

  it('formats time by domain duration and daily dates, with compact DLI units', async () => {
    const measurement = { ...moisture, unit: 'mol/d⋅m²', value: 0.04 };
    const el = await graphRow(measurement);
    for (const [duration, daily, options] of [
      [24 * hour, false, { hour: '2-digit', minute: '2-digit' }],
      [24 * hour + 1, false, { weekday: 'short', hour: '2-digit', minute: '2-digit' }],
      [2 * hour, true, { weekday: 'short', day: 'numeric', month: 'short' }],
    ] as const) {
      el.daily = daily;
      el.history = { ...history, series: [{ t: start, v: 0.04 }, { t: start + duration, v: null }] };
      await el.updateComplete;
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      expect(graph(el).points.map(p => p.label)).to.deep.equal([
        `${formatter.format(start)} · ${formatValue(0.04, measurement.unit, true)} mol/d`,
        `${formatter.format(start + duration)} · — mol/d`,
      ]);
    }
    el.measurement = { ...moisture, unit: '' };
    await el.updateComplete;
    expect(graph(el).points[0].label).to.match(/ · 0\.04$/);
  });

  it('formats hourly, multi-day and daily labels in the supplied HA time zone', async () => {
    const timestamp = Date.UTC(2026, 6, 15, 21, 30);
    const el = await graphRow(moisture, { ...history, series: [{ t: timestamp, v: 12 }] });
    el.timeZone = 'Europe/Bucharest';
    await el.updateComplete;
    expect(graph(el).points[0].label).to.equal('00:30 · 12 %');
    el.timeZone = 'UTC';
    await el.updateComplete;
    expect(graph(el).points[0].label).to.equal('21:30 · 12 %');

    el.timeZone = 'Europe/Bucharest';
    el.history = { ...history, series: [{ t: timestamp, v: 12 }, { t: timestamp + 48 * hour, v: 31 }] };
    await el.updateComplete;
    expect(graph(el).points[0].label).to.equal('Thu 00:30 · 12 %');
    el.daily = true;
    await el.updateComplete;
    expect(graph(el).points[0].label).to.equal('Thu 16 Jul · 12 %');
    el.timeZone = 'UTC';
    await el.updateComplete;
    expect(graph(el).points[0].label).to.equal('Wed 15 Jul · 12 %');
  });

  it('keeps empty graphs and omits unmappable markers and current', async () => {
    for (const data of [null, withStats(null)]) {
      const before = Date.now();
      const el = await graphRow(moisture, data);
      const after = Date.now();
      const props = graph(el);
      expect(props.points).to.deep.equal([]);
      expect(props.start).to.be.within(before - 24 * hour, after - 24 * hour);
      expect(props.end).to.be.within(before, after);
      expect(props.minMarker).to.equal(null);
      expect(props.maxMarker).to.equal(null);
      expect(props.current).to.equal(null);
      expect(props.summary).to.equal(describeMeasurement(moisture));
      expect(el.getBoundingClientRect().height).to.equal(68);
    }
    const el = await graphRow({ ...moisture, min: null });
    expect(graph(el).points.every(p => p.f === null)).to.equal(true);
    expect(graph(el).minMarker).to.equal(null);
    expect(graph(el).maxMarker).to.equal(null);
    expect(graph(el).current).to.equal(null);
  });
});

describe('formatCaptionNumber', () => {
  it('uses magnitude-based precision with decimal-safe rounding and no trailing zeros', () => {
    for (const [value, expected] of [
      [53.4, '53'], [62.5, '63'], [1.37, '1.4'], [0.04, '0.04'],
      [1500, '1.5k'], [30000, '30k'], [20.2, '20'], [7.2, '7.2'],
      [1.25, '1.3'], [0.145, '0.1'], [-1.25, '-1.3'], [-62.5, '-63'],
      [0.98, '1'], [0.4, '0.4'], [0.099, '0.1'], [0.045, '0.05'],
      [-0.98, '-1'], [-0.4, '-0.4'], [-0.045, '-0.05'],
      [-1500, '-1.5k'], [0, '0'], [1, '1'], [0.1, '0.1'], [1e-7, '0'],
    ] as const) {
      expect(formatCaptionNumber(value), String(value)).to.equal(expected);
    }
  });
});

describe('describeWithStats', () => {
  it('returns the measurement description unchanged without history', () => {
    expect(describeWithStats(moisture, null)).to.equal(describeMeasurement(moisture));
    expect(describeWithStats(moisture, null, 'daily totals, last 7 days'))
      .to.equal(describeMeasurement(moisture));
  });

  it('uses a supplied period in the accessible statistics description', () => {
    expect(describeWithStats(moisture, stats, 'daily totals, last 7 days')).to.equal(
      `${describeMeasurement(moisture)} · daily totals, last 7 days 12–31, average 22`,
    );
  });

  it('adds the formatted range and average without units', () => {
    expect(describeWithStats(moisture, stats)).to.equal(
      'Moisture: 13 % (15–65 %) · low · last 24 h 12–31, average 22',
    );
    expect(describeWithStats(moisture, { min: 2000, max: 30000, mean: 12500 })).to.equal(
      `${describeMeasurement(moisture)} · last 24 h 2k–30k, average 13k`,
    );
    expect(describeWithStats(moisture, { min: 53.4, max: 62.5, mean: 58.1 })).to.equal(
      `${describeMeasurement(moisture)} · last 24 h 53.4–62.5, average 58.1`,
    );
  });
});
