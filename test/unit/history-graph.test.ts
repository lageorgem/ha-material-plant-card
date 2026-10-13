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
      --mpl-on-surface-variant:rgb(70,80,90); --mpl-outline-variant:rgb(100,110,120);
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
  it('registers, exposes its summary, and renders an empty graph with guides', async () => {
    const el = await mount([]);
    expect(customElements.get('mpl-history-graph')).to.equal(MplHistoryGraph);
    expect(el.getAttribute('role')).to.equal('img');
    expect(el.getAttribute('aria-label')).to.equal('Moisture history');
    expect(el.getBoundingClientRect().height).to.equal(48);
    expect(el.getBoundingClientRect().width).to.equal(240);
    expect(getComputedStyle(el).touchAction).to.equal('pan-y');
    expect(getComputedStyle(el).cursor).to.equal('crosshair');
    expect(node(el, '.history-line').getAttribute('d')).to.equal('');
    el.summary = 'Updated summary';
    await el.updateComplete;
    expect(el.getAttribute('aria-label')).to.equal('Updated summary');
    const guides = el.shadowRoot!.querySelectorAll<SVGLineElement>('.threshold-guide');
    expect(guides.length).to.equal(2);
    for (const [index, y] of [12, 36].entries()) {
      expect(guides[index].y1.baseVal.value).to.be.closeTo(y, 0.001);
      expect(guides[index].y2.baseVal.value).to.be.closeTo(y, 0.001);
      expect(guides[index].x2.baseVal.value).to.equal(240);
      expect(getComputedStyle(guides[index]).stroke).to.equal('rgb(100, 110, 120)');
      expect(guides[index].getAttribute('stroke-dasharray')).to.equal('3 3');
    }
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
    expect(gradient.getAttribute('y2')).to.equal('48');
    const stops = [...gradient.querySelectorAll('stop')];
    expect(stops.map(stop => Number(stop.getAttribute('offset'))))
      .to.deep.equal([0, 0.25, 0.25, 0.75, 0.75, 1]);
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

  it('places min/max triangle tips and inherits their independent status colours', async () => {
    const el = await mount();
    el.minMarker = { t: 25, f: 0.2, ok: true };
    el.maxMarker = { t: 75, f: 0.8, ok: false };
    await el.updateComplete;
    const min = node<SVGPolygonElement>(el, '.min-marker');
    const max = node<SVGPolygonElement>(el, '.max-marker');
    expect(min.points.getItem(0).x).to.equal(60);
    expect(min.points.getItem(0).y).to.be.closeTo(39, 0.001);
    expect(max.points.getItem(0).x).to.equal(180);
    expect(max.points.getItem(0).y).to.be.closeTo(9, 0.001);
    expect(min.points.getItem(1).y - min.points.getItem(0).y).to.equal(6);
    expect(max.points.getItem(0).y - max.points.getItem(1).y).to.equal(6);
    expect(min.points.getItem(2).x - min.points.getItem(1).x).to.equal(8);
    expect(getComputedStyle(min).fill).to.equal('rgb(10, 20, 30)');
    expect(getComputedStyle(max).fill).to.equal('rgb(40, 50, 60)');
    el.minMarker = { ...el.minMarker, ok: false };
    el.maxMarker = { ...el.maxMarker, ok: true };
    await el.updateComplete;
    expect(getComputedStyle(min).fill).to.equal('rgb(40, 50, 60)');
    expect(getComputedStyle(max).fill).to.equal('rgb(10, 20, 30)');
    el.minMarker = el.maxMarker = null;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.min-marker, .max-marker, .avg-marker')).to.equal(null);
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
      expect(ring.cy.baseVal.value).to.equal(20);
      expect(ring.r.baseVal.value).to.equal(4);
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
    expect(style.pointerEvents).to.equal('none');
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
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bubble')).to.equal(null);
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
      pointer(el, 'pointermove', 60);
      await el.updateComplete;
      for (const selector of ['.bubble', '.history-line', '.hover-dot']) {
        const style = getComputedStyle(node(el, selector));
        expect(style.transitionDuration).to.equal('0s');
        expect(style.animationName).to.equal('none');
      }
    } finally { await emulateMedia({ reducedMotion: null }); }
  });
});
