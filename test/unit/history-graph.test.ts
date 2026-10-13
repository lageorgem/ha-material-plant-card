import { fixture, html, expect } from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import sinon from 'sinon';
import { MplHistoryGraph } from '../../src/full/history-graph';

const points = [
  { t: 0, f: 0.9, label: 'High' },
  { t: 25, f: 0.5, label: 'Middle' },
  { t: 50, f: null, label: 'Gap' },
  { t: 75, f: 0.1, label: 'Low' },
  { t: 100, f: 0.6, label: 'Latest' },
];
const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
async function settle(el: MplHistoryGraph): Promise<void> {
  // Observer delivery, deferred measurement, then Lit's render.
  await frame();
  await frame();
  await el.updateComplete;
}
async function mount(data = points): Promise<MplHistoryGraph> {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div style="width:240px; --mpl-success:rgb(10,20,30); --mpl-error:rgb(40,50,60);
      --mpl-on-surface-variant:rgb(70,80,90); --mpl-outline:rgb(155,143,128);
      --mpl-outline-variant:rgb(100,110,120);
      --mpl-surface-container-high:rgb(130,140,150); --mpl-inverse-surface:rgb(160,170,180);
      --mpl-inverse-on-surface:rgb(190,200,210)">
      <mpl-history-graph .points=${data} .start=${0} .end=${100}
        .summary=${'Moisture history'}></mpl-history-graph>
    </div>`);
  const el = wrapper.querySelector('mpl-history-graph')!;
  await settle(el);
  return el;
}
function node<T extends Element = SVGElement>(el: MplHistoryGraph, selector: string): T {
  return el.shadowRoot!.querySelector<T>(selector)!;
}
function pointer(el: MplHistoryGraph, type: string, x: number, pointerType = 'mouse'): void {
  el.dispatchEvent(new PointerEvent(type, {
    clientX: el.getBoundingClientRect().left + x, pointerType, pointerId: 1,
    bubbles: true, composed: true,
  }));
}
function bubbleInside(el: MplHistoryGraph): void {
  const host = el.getBoundingClientRect();
  const bubble = node<HTMLElement>(el, '.bubble').getBoundingClientRect();
  expect(bubble.left).to.be.at.least(host.left - 0.1);
  expect(bubble.right).to.be.at.most(host.right + 0.1);
  expect(bubble.bottom).to.be.closeTo(host.top - 4, 0.1);
}

describe('mpl-history-graph', () => {
  it('reserves a tick gutter and draws labelled gridlines below events and the series', async () => {
    const el = await mount();
    el.ticks = [
      { f: 0, label: '10', kind: 'min' },
      { f: 0.5, label: '20', kind: 'avg' },
      { f: 1, label: '30', kind: 'max' },
    ];
    el.events = [{ t: 0, icon: 'mdi:water' }, { t: 50, icon: 'mdi:water' }];
    await el.updateComplete;
    expect(node(el, '.history-line').getAttribute('d')).to.match(/^M26,/);
    const gridlines = [...el.shadowRoot!.querySelectorAll<SVGLineElement>('.gridline')];
    const labels = [...el.shadowRoot!.querySelectorAll<SVGTextElement>('.tick-label')];
    expect(gridlines.length).to.equal(3);
    expect(labels.map(label => label.textContent)).to.deep.equal(['10', '20', '30']);
    for (const [index, y] of [56, 39, 22].entries()) {
      const line = gridlines[index];
      expect(line.getAttribute('class')).to.equal(`gridline gridline-${el.ticks[index].kind}`);
      expect([line.x1.baseVal.value, line.x2.baseVal.value]).to.deep.equal([26, 240]);
      expect([line.y1.baseVal.value, line.y2.baseVal.value]).to.deep.equal([y, y]);
      const style = getComputedStyle(line);
      expect(style.stroke).to.equal(index === 1 ? 'rgb(155, 143, 128)' : 'rgb(100, 110, 120)');
      expect(style.strokeWidth).to.equal('1px');
      expect(style.strokeDasharray).to.equal(index === 1 ? '2px, 3px' : 'none');
      expect(style.opacity).to.equal(index === 1 ? '0.7' : '0.6');
      expect(line.compareDocumentPosition(node(el, '.event-line')) & Node.DOCUMENT_POSITION_FOLLOWING).not.to.equal(0);
      expect(line.compareDocumentPosition(node(el, '.history-line')) & Node.DOCUMENT_POSITION_FOLLOWING).not.to.equal(0);
      const label = labels[index];
      expect(label.getAttribute('x')).to.equal('22');
      expect(label.getAttribute('y')).to.equal(String(y));
      expect(label.getAttribute('text-anchor')).to.equal('end');
      expect(label.getAttribute('dominant-baseline')).to.equal('central');
      expect(getComputedStyle(label).fontSize).to.equal('9px');
      expect(getComputedStyle(label).fill).to.equal('rgb(70, 80, 90)');
      expect(getComputedStyle(label).fontVariantNumeric).to.equal('tabular-nums');
    }
    el.events = [];
    await el.updateComplete;
    expect(gridlines.map(line => line.y1.baseVal.value)).to.deep.equal([56, 32, 8]);
    el.ticks = [];
    await el.updateComplete;
    expect(node(el, '.history-line').getAttribute('d')).to.match(/^M0,/);
    expect(el.shadowRoot!.querySelector('.gridline, .tick-label, .threshold-guide')).to.equal(null);
  });

  it('skips empty labels without removing gridlines and reserves the gutter only for non-empty labels', async () => {
    const el = await mount();
    el.ticks = [
      { f: 0, label: '10', kind: 'min' },
      { f: 0.01, label: '', kind: 'avg' },
      { f: 1, label: '30', kind: 'max' },
    ];
    await el.updateComplete;
    const lines = [...el.shadowRoot!.querySelectorAll<SVGLineElement>('.gridline')];
    expect(lines.length).to.equal(3);
    expect(lines.map(line => line.x1.baseVal.value)).to.deep.equal([26, 26, 26]);
    expect(node(el, '.gridline-avg').getAttribute('stroke-dasharray')).to.equal('2 3');
    expect([...el.shadowRoot!.querySelectorAll('.tick-label')].map(label => label.textContent))
      .to.deep.equal(['10', '30']);
    el.ticks = el.ticks.map(tick => ({ ...tick, label: '' }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('text')).to.equal(null);
    expect(lines.map(line => line.x1.baseVal.value)).to.deep.equal([0, 0, 0]);
    expect(node(el, '.history-line').getAttribute('d')).to.match(/^M0,/);
    el.ticks = [{ f: 0.5, label: '20', kind: 'avg' }];
    await el.updateComplete;
    expect(node(el, '.history-line').getAttribute('d')).to.match(/^M26,/);
    expect(node(el, '.tick-label').textContent).to.equal('20');
  });

  it('keeps legacy ticks without a kind solid and faint', async () => {
    const el = await mount();
    el.ticks = [{ f: 0.5, label: '20' }];
    await el.updateComplete;
    const style = getComputedStyle(node(el, '.gridline'));
    expect(style.stroke).to.equal('rgb(100, 110, 120)');
    expect(style.strokeWidth).to.equal('1px');
    expect(style.strokeDasharray).to.equal('none');
    expect(style.opacity).to.equal('0.6');
  });

  it('maps markers, current, events, scrubbing and bubble clamps into the plot range', async () => {
    const el = await mount();
    el.ticks = [{ f: 0, label: '0' }];
    el.minMarker = { t: 0, f: 0.1, ok: false };
    el.maxMarker = { t: 100, f: 0.9, ok: false };
    el.current = { t: 50, f: 0.5, tone: 'ok' };
    el.events = [{ t: 0, icon: 'mdi:water' }, { t: 50, icon: 'mdi:water' }, { t: 100, icon: 'mdi:water' }];
    await el.updateComplete;
    expect(node<SVGCircleElement>(el, '.min-dot').cx.baseVal.value).to.equal(26);
    expect(node<SVGPolygonElement>(el, '.min-marker').points.getItem(1).x).to.equal(26);
    expect(node<SVGPolygonElement>(el, '.max-marker').points.getItem(2).x).to.equal(240);
    expect(node<SVGCircleElement>(el, '.current-ring').cx.baseVal.value).to.equal(133);
    expect([...el.shadowRoot!.querySelectorAll<SVGLineElement>('.event-line')].map(line => line.x1.baseVal.value))
      .to.deep.equal([26, 133, 240]);
    expect([...el.shadowRoot!.querySelectorAll<HTMLElement>('.event-icon')].map(icon => parseFloat(icon.style.left)))
      .to.deep.equal([26, 127, 228]);
    pointer(el, 'pointermove', 105);
    await el.updateComplete;
    expect(node(el, '.bubble').textContent).to.equal('Middle');
    expect(node<SVGCircleElement>(el, '.hover-dot').cx.baseVal.value).to.equal(79.5);
    for (const x of [26, 240]) {
      pointer(el, 'pointerdown', x, 'touch');
      await el.updateComplete;
      expect(node<SVGLineElement>(el, '.hover-guide').x1.baseVal.value).to.equal(x);
      const host = el.getBoundingClientRect();
      const bubble = node<HTMLElement>(el, '.bubble').getBoundingClientRect();
      expect(bubble.left).to.be.at.least(host.left + 26);
      expect(bubble.right).to.be.at.most(host.right);
    }
    el.points = [{ t: 0, f: 0.5, label: 'Long label '.repeat(100) }];
    pointer(el, 'pointermove', 26, 'touch');
    await el.updateComplete;
    expect(node<HTMLElement>(el, '.bubble').getBoundingClientRect().width).to.equal(214);
    el.end = 0;
    await el.updateComplete;
    expect(node(el, '.history-line').getAttribute('d')).to.match(/^M26,/);
  });

  it('draws the line and fades isolated points before bringing in markers and the current ring', async () => {
    const el = await mount([
      ...points, { t: 110, f: null, label: 'Gap' }, { t: 120, f: 0.5, label: 'Isolated' },
    ]);
    el.minMarker = { t: 75, f: 0.1, ok: false };
    el.maxMarker = { t: 0, f: 0.9, ok: false };
    el.current = { t: 100, f: 0.6, tone: 'ok' };
    el.events = [{ t: 50, icon: 'mdi:weather-sunset-up' }];
    pointer(el, 'pointermove', 60);
    await el.updateComplete;
    const line = node(el, '.history-line');
    expect(line.getAttribute('pathLength')).to.equal('1');
    expect(getComputedStyle(line).animationName).to.equal('mpl-line-draw');
    expect(getComputedStyle(line).animationDuration).to.equal('0.9s');
    expect(getComputedStyle(line).strokeDasharray).to.equal('1px');
    const isolated = node(el, '.isolated-point');
    expect(getComputedStyle(isolated).animationName).to.equal('mpl-point-in');
    expect(getComputedStyle(isolated).animationDelay).to.equal('0.3s');
    const markers = [...el.shadowRoot!.querySelectorAll('.min-marker, .max-marker, .min-dot, .max-dot, .current-ring')];
    expect(markers.length).to.equal(5);
    for (const marker of markers) {
      const style = getComputedStyle(marker);
      expect(style.animationName).to.equal('mpl-mark-in');
      expect(style.animationDelay).to.equal('0.7s');
      expect(style.transformBox).to.equal('fill-box');
      expect(style.opacity).to.equal('0');
    }
    for (const selector of ['.event-line', '.event-icon', '.hover-guide', '.hover-dot', '.bubble']) {
      expect(getComputedStyle(node(el, selector)).animationName).to.equal('none');
    }
    const animations = [line, isolated, ...markers].flatMap(shape => shape.getAnimations());
    expect(animations.length).to.equal(7);
    await Promise.all(animations.map(animation => animation.finished));
    expect(getComputedStyle(line).strokeDashoffset).to.equal('0px');
    for (const shape of [isolated, ...markers]) expect(getComputedStyle(shape).opacity).to.equal('1');
  });

  it('keeps the same line animation progressing during hover and touch scrubbing', async () => {
    const el = await mount();
    const line = node(el, '.history-line');
    const animation = line.getAnimations()[0];
    expect(animation).not.to.equal(undefined);
    const time = Number(animation.currentTime);
    for (const pointerType of ['mouse', 'touch']) {
      pointer(el, 'pointerdown', 60, pointerType);
      pointer(el, 'pointermove', 180, pointerType);
      await el.updateComplete;
      await frame();
      expect(node(el, '.history-line')).to.equal(line);
      expect(line.getAnimations()).to.deep.equal([animation]);
    }
    expect(Number(animation.currentTime)).to.be.greaterThan(time);
  });

  it('restarts the line animation when the graph is removed and appended again', async () => {
    const el = await mount();
    const parent = el.parentElement!;
    const line = node(el, '.history-line');
    const animation = line.getAnimations()[0];
    expect(animation).not.to.equal(undefined);
    await animation.finished;
    el.remove();
    parent.append(el);
    await settle(el);
    expect(node(el, '.history-line')).to.equal(line);
    const restarted = line.getAnimations()[0];
    expect(restarted).not.to.equal(undefined);
    expect(restarted).not.to.equal(animation);
    expect(restarted.playState).to.equal('running');
    expect(Number(restarted.currentTime)).to.be.lessThan(900);
  });

  it('starts drawing when data arrives after an empty graph has mounted', async () => {
    const el = await mount([]);
    const line = node(el, '.history-line');
    expect(line.getAnimations()).to.deep.equal([]);
    el.points = points;
    await el.updateComplete;
    expect(node(el, '.history-line')).to.equal(line);
    expect(getComputedStyle(line).animationName).to.equal('mpl-line-draw');
    expect(line.getAnimations()[0].playState).to.equal('running');
  });

  it('registers, exposes its summary, and renders an empty graph without ideal guides', async () => {
    const el = await mount([]);
    expect(customElements.get('mpl-history-graph')).to.equal(MplHistoryGraph);
    expect(el.getAttribute('role')).to.equal('img');
    expect(el.getAttribute('aria-label')).to.equal('Moisture history');
     expect(el.getBoundingClientRect().height).to.equal(64);
    expect(el.getBoundingClientRect().width).to.equal(240);
    expect(getComputedStyle(el).touchAction).to.equal('pan-y');
    expect(getComputedStyle(el).cursor).to.equal('crosshair');
    expect(node(el, '.history-line').getAttribute('d')).to.equal('');
    el.summary = 'Updated summary';
    await el.updateComplete;
    expect(el.getAttribute('aria-label')).to.equal('Updated summary');
    const guides = el.shadowRoot!.querySelectorAll<SVGLineElement>('.threshold-guide');
    expect(guides.length).to.equal(0);
  });

  it('breaks at nulls and uses pixel units and an inherited hard-stop gradient', async () => {
    const el = await mount();
    const path = node(el, '.history-line');
    expect((path.getAttribute('d')!.match(/M/g) ?? []).length).to.equal(2);
    expect(path.getAttribute('d')).to.match(/M0[, ]/);
    expect(path.getAttribute('d')).to.match(/L60[, ]/);
    expect(path.getAttribute('d')).to.match(/M180[, ]/);
    expect(path.getAttribute('d')).to.match(/L240[, ]/);
    expect(path.getAttribute('stroke-width')).to.equal('2');
    expect(path.getAttribute('stroke-linecap')).to.equal('round');
    expect(path.getAttribute('stroke-linejoin')).to.equal('round');
    const gradient = node(el, 'linearGradient');
    expect(gradient.getAttribute('gradientUnits')).to.equal('userSpaceOnUse');
    expect(gradient.getAttribute('y1')).to.equal('0');
     expect(gradient.getAttribute('y2')).to.equal('64');
    const stops = [...gradient.querySelectorAll('stop')];
    expect(stops.map(stop => Number(stop.getAttribute('offset'))))
        .to.deep.equal([0, (56 - 0.8 * 48) / 64, (56 - 0.8 * 48) / 64, 46.4 / 64, 46.4 / 64, 1]);
    expect(stops.map(stop => getComputedStyle(stop).stopColor)).to.deep.equal([
      'rgb(40, 50, 60)', 'rgb(40, 50, 60)', 'rgb(10, 20, 30)',
      'rgb(10, 20, 30)', 'rgb(40, 50, 60)', 'rgb(40, 50, 60)',
    ]);
    const other = await mount();
    expect(node(other, 'linearGradient').id).not.to.equal(gradient.id);
  });

  it('renders isolated points as gradient-filled circles, clamps x, and handles a zero domain', async () => {
    const el = await mount([
      { t: -20, f: 0.5, label: 'First' }, { t: 50, f: null, label: 'Gap' },
      { t: 120, f: 0.7, label: 'Last' },
    ]);
    const isolated = [...el.shadowRoot!.querySelectorAll<SVGCircleElement>('.isolated-point')];
    expect(isolated.length).to.equal(2);
    expect(isolated.map(circle => circle.cx.baseVal.value)).to.deep.equal([0, 240]);
    expect(isolated[0].r.baseVal.value).to.equal(1.5);
    expect(isolated[0].getAttribute('fill')).to.equal(`url(#${node(el, 'linearGradient').id})`);
    el.end = 0;
    await el.updateComplete;
    expect(node(el, '.history-line').getAttribute('d')).not.to.match(/NaN|Infinity/);
  });

   it('anchors min/max triangle tips at a fixed gap from independent status dots', async () => {
    const el = await mount();
    el.minMarker = { t: 25, f: 0.2, ok: true };
    el.maxMarker = { t: 75, f: 0.8, ok: false };
    await el.updateComplete;
    const min = node<SVGPolygonElement>(el, '.min-marker');
    const max = node<SVGPolygonElement>(el, '.max-marker');
    expect(min.points.getItem(0).x).to.equal(60);
      expect(min.points.getItem(0).y).to.be.closeTo(49.9, 0.001);
    expect(max.points.getItem(0).x).to.equal(180);
      expect(max.points.getItem(0).y).to.be.closeTo(14.1, 0.001);
      expect(min.points.getItem(1).y - min.points.getItem(0).y).to.equal(4);
      expect(max.points.getItem(0).y - max.points.getItem(1).y).to.equal(4);
      expect(min.points.getItem(2).x - min.points.getItem(1).x).to.equal(6);
      expect(max.points.getItem(2).x - max.points.getItem(1).x).to.equal(6);
    for (const [kind, x, base, cy, fill] of [
        ['min', 60, 53.9, 46.4, 'rgb(10, 20, 30)'],
        ['max', 180, 10.1, 17.6, 'rgb(40, 50, 60)'],
    ] as const) {
      const triangle = node<SVGPolygonElement>(el, `.${kind}-marker`);
      expect(triangle.points.getItem(1).y).to.be.closeTo(base, 0.001);
      expect(triangle.points.getItem(2).y).to.be.closeTo(base, 0.001);
        expect(triangle.points.getItem(1).x).to.equal(x - 3);
        expect(triangle.points.getItem(2).x).to.equal(x + 3);
      const dot = node<SVGCircleElement>(el, `.${kind}-dot`);
      expect(dot.cx.baseVal.value).to.equal(x);
      expect(dot.cy.baseVal.value).to.be.closeTo(cy, 0.001);
      expect(dot.r.baseVal.value).to.equal(2);
      expect(getComputedStyle(dot).fill).to.equal(fill);
    }
    expect(getComputedStyle(min).fill).to.equal('rgb(10, 20, 30)');
    expect(getComputedStyle(max).fill).to.equal('rgb(40, 50, 60)');
    el.minMarker = { ...el.minMarker, ok: false };
    el.maxMarker = { ...el.maxMarker, ok: true };
    await el.updateComplete;
    expect(getComputedStyle(min).fill).to.equal('rgb(40, 50, 60)');
    expect(getComputedStyle(max).fill).to.equal('rgb(10, 20, 30)');
    expect(getComputedStyle(node(el, '.min-dot')).fill).to.equal('rgb(40, 50, 60)');
    expect(getComputedStyle(node(el, '.max-dot')).fill).to.equal('rgb(10, 20, 30)');
    el.minMarker = el.maxMarker = null;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.min-marker, .max-marker, .min-dot, .max-dot, .avg-marker')).to.equal(null);
  });

   it('uses the full plot height without in-domain events and restores it when events leave', async () => {
     const el = await mount([
       { t: 0, f: 1, label: 'Maximum' }, { t: 100, f: 0, label: 'Minimum' },
     ]);
     el.thresholdHigh = 1;
     el.thresholdLow = 0;
     for (const events of [[], [{ t: -1, icon: 'mdi:outside-before' }, { t: 101, icon: 'mdi:outside-after' }]]) {
       el.events = events;
       await el.updateComplete;
       expect(node(el, '.history-line').getAttribute('d')).to.equal('M0,8 L240,56');
       const guides = [...el.shadowRoot!.querySelectorAll<SVGLineElement>('.threshold-guide')];
        expect(guides).to.deep.equal([]);
       expect(el.shadowRoot!.querySelector('.event-icon, .event-line')).to.equal(null);
     }
     el.events = [{ t: 0, icon: 'mdi:weather-sunset-up' }];
     await el.updateComplete;
     expect(node(el, '.history-line').getAttribute('d')).to.equal('M0,22 L240,56');
     el.events = [];
     await el.updateComplete;
     expect(node(el, '.history-line').getAttribute('d')).to.equal('M0,8 L240,56');
   });

   it('reserves the icon band above all plotted geometry at both fraction extremes', async () => {
     const el = await mount([
       { t: 0, f: 1, label: 'Maximum' }, { t: 100, f: 0, label: 'Minimum' },
     ]);
     el.thresholdHigh = 1;
     el.thresholdLow = 0;
     el.maxMarker = { t: 0, f: 1, ok: true };
     el.minMarker = { t: 100, f: 0, ok: true };
     el.events = [{ t: 50, icon: 'mdi:weather-sunset-up' }];
     for (const f of [1, 0]) {
       el.current = { t: 50, f, tone: 'ok' };
       pointer(el, 'pointermove', f === 1 ? 0 : 240);
       await el.updateComplete;
       const host = el.getBoundingClientRect();
        expect(host.height).to.equal(64);
        expect(node(el, '.history-line').getAttribute('d')).to.equal('M0,22 L240,56');
        expect([...el.shadowRoot!.querySelectorAll<SVGLineElement>('.threshold-guide')]
           .map(guide => guide.y1.baseVal.value)).to.deep.equal([]);
       for (const shape of el.shadowRoot!.querySelectorAll<SVGGraphicsElement>(
         '.history-line, .threshold-guide, .event-line, .min-marker, .max-marker, .min-dot, .max-dot, .current-ring, .hover-dot',
       )) {
         expect(shape.getBoundingClientRect().top - host.top, shape.classList.value).to.be.at.least(14);
       }
       const hoverGuide = node<SVGLineElement>(el, '.hover-guide');
       expect([hoverGuide.y1.baseVal.value, hoverGuide.y2.baseVal.value]).to.deep.equal([0, 64]);
       const icon = node<HTMLElement>(el, '.event-icon').getBoundingClientRect();
       expect(icon.top - host.top).to.equal(1);
       expect(icon.bottom - host.top).to.be.at.most(14);
       const line = node<SVGLineElement>(el, '.event-line');
       expect(line.y1.baseVal.value).to.equal(14);
       expect(line.y2.baseVal.value).to.equal(64);
     }
   });

   for (const [kind, fractions] of [['max', [0, 0.5, 1]], ['min', [0, 0.5, 1]]] as const) {
     it(`keeps ${kind} triangle tip gaps fixed and triangles inside the host`, async () => {
       const el = await mount();
       const gaps: number[] = [];
       for (const f of fractions) {
         for (const t of [0, 50, 100]) {
           el[kind === 'max' ? 'maxMarker' : 'minMarker'] = { t, f, ok: true };
            await el.updateComplete;
            const triangle = node<SVGPolygonElement>(el, `.${kind}-marker`);
            const dot = node<SVGCircleElement>(el, `.${kind}-dot`);
            await Promise.all(triangle.getAnimations().map(animation => animation.finished));
           gaps.push(Math.abs(triangle.points.getItem(0).y - dot.cy.baseVal.value));
           const host = el.getBoundingClientRect();
           const rect = triangle.getBoundingClientRect();
           expect(rect.top).to.be.at.least(host.top);
           expect(rect.bottom).to.be.at.most(host.bottom);
           expect(rect.left).to.be.at.least(host.left);
           expect(rect.right).to.be.at.most(host.right);
           expect(rect.width).to.equal(6);
           expect(rect.height).to.equal(4);
         }
       }
       for (const gap of gaps) expect(gap).to.be.closeTo(3.5, 0.001);
       expect(Math.max(...gaps) - Math.min(...gaps)).to.be.at.most(0.001);
     });
   }

    for (const [low, high] of [[0.3, 0.7], [-0.5, 1.4], [1.2, 1.5], [-1.5, -1.2], [0.92, null], [null, 0.08], [null, null]] as const) {
     it(`uses arbitrary threshold paint without ideal guides for (${low}, ${high})`, async () => {
      const el = await mount([
        { t: 0, f: 0.04, label: 'Below' }, { t: 25, f: null, label: 'Gap' },
        { t: 50, f: 0.5, label: 'Middle' }, { t: 75, f: null, label: 'Gap' },
        { t: 100, f: 0.96, label: 'Above' },
      ]);
      el.thresholdLow = low;
      el.thresholdHigh = high;
      await el.updateComplete;
       const guides = [...el.shadowRoot!.querySelectorAll<SVGLineElement>('.threshold-guide')];
       expect(guides.length).to.equal(0);
       const success = 'rgb(10, 20, 30)';
       const error = 'rgb(40, 50, 60)';
       const paintAt = (f: number) => low === null || high === null ? 'rgb(70, 80, 90)'
         : f < low || f > high ? error : success;
       const expected: [number, string][] = [[0, paintAt(1)]];
       if (low !== null && high !== null) {
         if (high >= 0 && high <= 1) expected.push([(56 - high * 48) / 64, error], [(56 - high * 48) / 64, success]);
         if (low >= 0 && low <= 1) expected.push([(56 - low * 48) / 64, success], [(56 - low * 48) / 64, error]);
       }
       expected.push([1, paintAt(0)]);
      const stops = [...node(el, 'linearGradient').querySelectorAll('stop')];
      expect(stops.map(stop => [Number(stop.getAttribute('offset')), getComputedStyle(stop).stopColor]))
        .to.deep.equal(expected);
      const paint = `url(#${node(el, 'linearGradient').id})`;
      expect(node(el, '.history-line').getAttribute('stroke')).to.equal(paint);
      const isolated = [...el.shadowRoot!.querySelectorAll('.isolated-point')];
      expect(isolated.length).to.equal(3);
      expect(isolated.every(dot => dot.getAttribute('fill') === paint)).to.equal(true);
      for (const [x, f] of [[0, 0.04], [120, 0.5], [240, 0.96]]) {
        pointer(el, 'pointermove', x);
        await el.updateComplete;
        expect(getComputedStyle(node(el, '.hover-dot')).fill)
           .to.equal(paintAt(f));
      }
    });
  }

  it('draws event lines beneath the history with clamped icons above them', async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelector('.event-line, .event-icon')).to.equal(null);
    el.events = [
      { t: -1, icon: 'mdi:outside-before' },
      { t: 0, icon: 'mdi:weather-sunset-up' },
      { t: 50, icon: 'mdi:weather-sunset-down' },
      { t: 100, icon: 'mdi:weather-sunset-up' },
      { t: 101, icon: 'mdi:outside-after' },
    ];
    await el.updateComplete;
    const lines = [...el.shadowRoot!.querySelectorAll<SVGLineElement>('.event-line')];
    const icons = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.event-icon')];
    expect(lines.length).to.equal(3);
    expect(icons.length).to.equal(3);
    const host = el.getBoundingClientRect();
    for (const [index, x] of [0, 120, 240].entries()) {
      const line = lines[index];
      expect(line.x1.baseVal.value).to.equal(x);
      expect(line.x2.baseVal.value).to.equal(x);
       expect(line.y1.baseVal.value).to.equal(14);
       expect(line.y2.baseVal.value).to.equal(64);
      const lineStyle = getComputedStyle(line);
      expect(lineStyle.stroke).to.equal('rgb(155, 143, 128)');
      expect(lineStyle.strokeDasharray).to.equal('3px, 3px');
      expect(lineStyle.strokeWidth).to.equal('1px');
      expect(lineStyle.opacity).to.equal('1');
      expect(line.compareDocumentPosition(node(el, '.history-line')) & Node.DOCUMENT_POSITION_FOLLOWING).not.to.equal(0);
      const icon = icons[index];
      expect(icon.tagName.toLowerCase()).to.equal('ha-icon');
      expect(icon.getAttribute('icon')).to.equal(el.events[index + 1].icon);
      expect(icon.getAttribute('aria-hidden')).to.equal('true');
      expect(getComputedStyle(icon).color).to.equal('rgb(70, 80, 90)');
      const rect = icon.getBoundingClientRect();
       expect(rect.width).to.equal(12);
       expect(rect.height).to.equal(12);
       expect(rect.top).to.be.closeTo(host.top + 1, 0.001);
      expect(rect.bottom).to.be.at.most(line.getBoundingClientRect().top);
      expect(rect.left).to.be.at.least(host.left);
      expect(rect.right).to.be.at.most(host.right);
       expect(rect.left - host.left + 6).to.equal(Math.max(6, Math.min(234, x)));
    }
    el.parentElement!.style.width = '320px';
    await settle(el);
    expect(lines[1].x1.baseVal.value).to.equal(160);
     expect(icons[1].getBoundingClientRect().left - el.getBoundingClientRect().left + 6).to.equal(160);
    el.events = [];
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.event-line, .event-icon')).to.equal(null);
  });

  it('renders the current ring for known tones only, with inherited ring fill', async () => {
    const el = await mount();
    for (const [tone, colour] of [
      ['ok', 'rgb(10, 20, 30)'], ['problem', 'rgb(40, 50, 60)'],
      ['advisory', 'rgb(70, 80, 90)'],
    ] as const) {
      el.current = { t: 100, f: 0.6, tone };
      await el.updateComplete;
      const ring = node<SVGCircleElement>(el, '.current-ring');
      expect(ring.cx.baseVal.value).to.equal(240);
       expect(ring.cy.baseVal.value).to.be.closeTo(27.2, 0.001);
      expect(ring.r.baseVal.value).to.equal(3.5);
      expect(ring.getAttribute('stroke-width')).to.equal('2');
      expect(getComputedStyle(ring).stroke).to.equal(colour);
      expect(getComputedStyle(ring).fill).to.equal('rgb(130, 140, 150)');
    }
    el.parentElement!.style.setProperty('--mpl-range-bar-ring', 'rgb(1,2,3)');
    expect(getComputedStyle(node(el, '.current-ring')).fill).to.equal('rgb(1, 2, 3)');
    el.current = { t: 100, f: 0.6, tone: 'unknown' };
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.current-ring')).to.equal(null);
  });

  it('hovers the nearest non-null point, clamps the bubble, and hides on mouse leave', async () => {
    const el = await mount();
    pointer(el, 'pointermove', 115);
    await el.updateComplete;
    expect(node(el, '.bubble').textContent).to.equal('Middle');
    expect(node<SVGCircleElement>(el, '.hover-dot').cx.baseVal.value).to.equal(60);
    expect(node<SVGCircleElement>(el, '.hover-dot').r.baseVal.value).to.equal(3);
    expect(node(el, '.hover-guide').getAttribute('opacity')).to.equal('0.4');
    expect(getComputedStyle(node(el, '.hover-dot')).fill).to.equal('rgb(10, 20, 30)');
    const style = getComputedStyle(node(el, '.bubble'));
    expect(style.backgroundColor).to.equal('rgb(160, 170, 180)');
    expect(style.color).to.equal('rgb(190, 200, 210)');
    expect(style.fontSize).to.equal('11px');
    expect(style.lineHeight).to.equal('16px');
    expect(style.pointerEvents).to.equal('auto');
    for (const x of [0, 240]) {
      pointer(el, 'pointermove', x);
      await el.updateComplete;
      bubbleInside(el);
    }
    el.points = [{ t: 0, f: 0.5, label: 'An extremely long tooltip label '.repeat(20) }];
    pointer(el, 'pointermove', 0);
    await el.updateComplete;
    bubbleInside(el);
    pointer(el, 'pointerleave', 0);
    await new Promise(resolve => setTimeout(resolve, 160));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
  });

  it('keeps the bubble during graph-to-bubble transfer and hides after leaving both', async () => {
    const el = await mount();
    const clock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      pointer(el, 'pointermove', 60);
      await el.updateComplete;
      const bubble = node<HTMLElement>(el, '.bubble');
      pointer(el, 'pointerleave', 60);
      clock.tick(149);
      bubble.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
      clock.tick(500);
      await el.updateComplete;
      expect(node(el, '.bubble')).to.equal(bubble);
      const listener = sinon.spy();
      el.parentElement!.addEventListener('click', listener);
      bubble.click();
      expect(listener.called).to.equal(false);
      bubble.dispatchEvent(new PointerEvent('pointermove', {
        pointerType: 'mouse', clientX: el.getBoundingClientRect().left + 180,
        bubbles: true, composed: true,
      }));
      await el.updateComplete;
      expect(bubble.textContent).to.equal('Middle');
      bubble.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
      clock.tick(149);
      await el.updateComplete;
      expect(node(el, '.bubble')).to.equal(bubble);
      clock.tick(1);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
    } finally { clock.restore(); }
  });

  it('cancels delayed hiding on graph re-entry', async () => {
    const el = await mount();
    const clock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      pointer(el, 'pointermove', 60);
      pointer(el, 'pointerleave', 60);
      clock.tick(149);
      pointer(el, 'pointerenter', 60);
      clock.tick(500);
      await el.updateComplete;
      expect(node(el, '.bubble').textContent).to.equal('Middle');
    } finally { clock.restore(); }
  });

  it('dismisses with Escape until graph leave and re-entry', async () => {
    const el = await mount();
    pointer(el, 'pointerenter', 60);
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(node(el, '.bubble')).not.to.equal(null);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
    pointer(el, 'pointermove', 180);
    pointer(el, 'pointerdown', 180);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
    pointer(el, 'pointerleave', 180);
    pointer(el, 'pointerenter', 180);
    await el.updateComplete;
    expect(node(el, '.bubble').textContent).to.equal('Low');
  });

  it('removes its document keydown listener on hide and disconnect', async () => {
    const el = await mount();
    const add = sinon.spy(document, 'addEventListener');
    const remove = sinon.spy(document, 'removeEventListener');
    try {
      pointer(el, 'pointermove', 60);
      await el.updateComplete;
      const handler = add.getCalls().find(call => call.args[0] === 'keydown')!.args[1];
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await el.updateComplete;
      expect(remove.calledWith('keydown', handler)).to.equal(true);
      pointer(el, 'pointerleave', 60);
      pointer(el, 'pointerenter', 60);
      await el.updateComplete;
      remove.resetHistory();
      el.remove();
      expect(remove.calledWith('keydown', handler)).to.equal(true);
    } finally { add.restore(); remove.restore(); }
  });

  for (const pointerType of ['touch', 'pen']) {
    for (const release of ['pointerup', 'pointercancel']) {
      it(`keeps ${pointerType} scrubbing visible and hides 2000ms after ${release}`, async () => {
        const el = await mount();
        const clock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        try {
          pointer(el, 'pointerdown', 60, pointerType);
          await el.updateComplete;
          expect(node(el, '.bubble').textContent).to.equal('Middle');
          expect(getComputedStyle(node(el, '.bubble')).pointerEvents).to.equal('none');
          clock.tick(3000);
          pointer(el, 'pointermove', 180, pointerType);
          pointer(el, 'pointerleave', 180, pointerType);
          await el.updateComplete;
          expect(node(el, '.bubble').textContent).to.equal('Low');
          pointer(el, release, 180, pointerType);
          clock.tick(1999);
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('.bubble')).not.to.equal(null);
          clock.tick(1);
          await el.updateComplete;
          expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
        } finally { clock.restore(); }
      });
    }
  }

  it('clears the hide timer on a new press and on disconnect', async () => {
    const el = await mount();
    const clock = sinon.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      pointer(el, 'pointerdown', 60, 'touch');
      pointer(el, 'pointerup', 60, 'touch');
      expect(clock.countTimers()).to.equal(1);
      pointer(el, 'pointerdown', 180, 'touch');
      expect(clock.countTimers()).to.equal(0);
      pointer(el, 'pointerup', 180, 'touch');
      el.remove();
      expect(clock.countTimers()).to.equal(0);
      clock.tick(3000);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
    } finally { clock.restore(); }
  });

  it('isolates click, down, up and contextmenu from the surrounding tile', async () => {
    const el = await mount();
    const listener = sinon.spy();
    for (const type of ['click', 'pointerdown', 'pointerup', 'contextmenu']) {
      el.parentElement!.addEventListener(type, listener);
      const event = new MouseEvent(type, { bubbles: true, composed: true, cancelable: true });
      node(el, 'svg').dispatchEvent(event);
      if (type === 'contextmenu') expect(event.defaultPrevented).to.equal(true);
    }
    expect(listener.callCount).to.equal(0);
  });

  it('re-renders x on resize without ResizeObserver loop errors', async () => {
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => { errors.push(event.message); };
    window.addEventListener('error', onError);
    try {
      const el = await mount();
      el.current = { t: 25, f: 0.5, tone: 'ok' };
      await el.updateComplete;
      expect(node<SVGCircleElement>(el, '.current-ring').cx.baseVal.value).to.equal(60);
      el.parentElement!.style.width = '320px';
      await settle(el);
      expect(node<SVGCircleElement>(el, '.current-ring').cx.baseVal.value).to.equal(80);
      expect(node(el, 'svg').getAttribute('width')).to.equal('320');
      expect(errors.filter(message => /ResizeObserver/i.test(message))).to.deep.equal([]);
      el.remove();
    } finally { window.removeEventListener('error', onError); }
  });

  it('has no transitions or animations under reduced motion', async () => {
    await emulateMedia({ reducedMotion: 'reduce' });
    try {
      const el = await mount();
      el.minMarker = { t: 75, f: 0.1, ok: false };
      el.maxMarker = { t: 0, f: 0.9, ok: false };
      el.current = { t: 100, f: 0.6, tone: 'ok' };
      pointer(el, 'pointermove', 60);
      await el.updateComplete;
      for (const selector of ['.bubble', '.history-line', '.hover-dot', '.min-marker', '.max-marker', '.min-dot', '.max-dot', '.current-ring']) {
        const style = getComputedStyle(node(el, selector));
        expect(style.transitionDuration).to.equal('0s');
        expect(style.animationName).to.equal('none');
      }
      expect(getComputedStyle(node(el, '.history-line')).strokeDasharray).to.equal('none');
      expect(getComputedStyle(node(el, '.current-ring')).opacity).to.equal('1');
      el.points = [{ t: 0, f: 0.5, label: 'Isolated' }];
      await el.updateComplete;
      expect(getComputedStyle(node(el, '.isolated-point')).animationName).to.equal('none');
    } finally { await emulateMedia({ reducedMotion: null }); }
  });
});
