import { fixture, html, expect } from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { MplRangeBar } from '../../src/full/range-bar';
import type { GaugeTone } from '../../src/types';

async function mount(
  value: number | null = 0.5,
  tone: GaugeTone = 'ok',
  spanFrom: number | null = 0.3,
  spanTo: number | null = 0.6,
  avg: number | null = 0.45,
) {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div style="width: 200px; --mpl-success: rgb(10, 20, 30); --mpl-error: rgb(40, 50, 60);
      --mpl-on-surface-variant: rgb(70, 80, 90); --mpl-outline-variant: rgb(100, 110, 120);
      --mpl-secondary-container: rgb(130, 140, 150); --mpl-surface-container-high: rgb(160, 170, 180)">
      <mpl-range-bar .value=${value} .tone=${tone} .spanFrom=${spanFrom}
        .spanTo=${spanTo} .avg=${avg}></mpl-range-bar>
    </div>
  `);
  const el = wrapper.querySelector('mpl-range-bar')!;
  await el.updateComplete;
  return el;
}

function element(el: MplRangeBar, selector: string): HTMLElement {
  return el.shadowRoot!.querySelector<HTMLElement>(selector)!;
}

function box(el: MplRangeBar, selector: string) {
  const host = el.getBoundingClientRect();
  const rect = element(el, selector).getBoundingClientRect();
  return { left: rect.left - host.left, top: rect.top - host.top,
    width: rect.width, height: rect.height, centre: rect.left - host.left + rect.width / 2 };
}

describe('mpl-range-bar', () => {
  it('registers the class, defaults to empty/unknown, and hides the host from accessibility', async () => {
    const el = await fixture<MplRangeBar>(html`<mpl-range-bar></mpl-range-bar>`);
    expect(customElements.get('mpl-range-bar')).to.equal(MplRangeBar);
    expect(el.tone).to.equal('unknown');
    for (const key of ['value', 'spanFrom', 'spanTo', 'avg'] as const) {
      expect(el[key]).to.equal(null);
    }
    expect(el.getAttribute('aria-hidden')).to.equal('true');
    expect(el.shadowRoot!.querySelectorAll('.span, .avg, .dot').length).to.equal(0);
  });

  it('lays out the three zones at the contract positions, heights, and radii', async () => {
    const el = await mount();
    expect(el.getBoundingClientRect().width).to.equal(200);
    expect(el.getBoundingClientRect().height).to.equal(16);
    expect(getComputedStyle(el).display).to.equal('block');
    expect(getComputedStyle(el).position).to.equal('relative');
    for (const [selector, left, width, height, radius, colour] of [
      ['.zone-low', 0, 37, 2, '1px', 'rgb(100, 110, 120)'],
      ['.zone-ok', 43, 114, 6, '3px', 'rgb(130, 140, 150)'],
      ['.zone-high', 163, 37, 2, '1px', 'rgb(100, 110, 120)'],
    ] as const) {
      const rect = box(el, selector);
      expect(rect.left).to.be.closeTo(left, 0.05);
      expect(rect.width).to.be.closeTo(width, 0.05);
      expect(rect.height).to.equal(height);
      expect(rect.top + height / 2).to.equal(8);
      const style = getComputedStyle(element(el, selector));
      expect(style.position).to.equal('absolute');
      expect(style.borderRadius).to.equal(radius);
      expect(style.backgroundColor).to.equal(colour);
    }
  });

  for (const [from, to, left, width] of [
    [0.3, 0.6, 60, 60], [0.6, 0.3, 60, 60],
    [0.495, 0.505, 96, 8], [0.505, 0.495, 96, 8], [0.5, 0.5, 96, 8],
    [0, 1, 0, 200],
  ]) {
    it(`positions and centres the span from ${from} to ${to}`, async () => {
      const el = await mount(0.5, 'ok', from, to);
      const rect = box(el, '.span');
      expect(rect.left).to.be.closeTo(left, 0.05);
      expect(rect.width).to.be.closeTo(width, 0.05);
      expect(rect.height).to.equal(8);
      expect(rect.top).to.equal(4);
      expect(getComputedStyle(element(el, '.span')).borderRadius).to.equal('4px');
    });
  }

  for (const fraction of [0, 0.3, 0.5, 0.6, 1]) {
    it(`centres average at ${fraction} and keeps the current dot inside the host`, async () => {
      const el = await mount(fraction, 'ok', 0.3, 0.6, fraction);
      const avg = box(el, '.avg');
      expect(avg.centre).to.be.closeTo(fraction * 200, 0.05);
      expect(avg.top).to.equal(13);
      expect(avg.width).to.equal(6);
      expect(avg.height).to.equal(4);
      expect(getComputedStyle(element(el, '.avg')).clipPath)
        .to.equal('polygon(50% 0px, 100% 100%, 0px 100%)');
      const dot = box(el, '.dot');
      expect(dot.centre).to.be.closeTo(Math.max(6, Math.min(194, fraction * 200)), 0.05);
      expect(dot.width).to.equal(12);
      expect(dot.height).to.equal(12);
      expect(dot.top).to.equal(2);
      expect(dot.left).to.be.at.least(0);
      expect(dot.left + dot.width).to.be.at.most(200);
    });
  }

  for (const tone of ['ok', 'problem', 'advisory'] as const) {
    it(`inherits ancestor colours for ${tone}, including translucent span and dot ring`, async () => {
      const el = await mount(0.5, tone);
      const colour = { ok: 'rgb(10, 20, 30)', problem: 'rgb(40, 50, 60)',
        advisory: 'rgb(70, 80, 90)' }[tone];
      expect(getComputedStyle(element(el, '.dot')).backgroundColor).to.equal(colour);
      expect(getComputedStyle(element(el, '.avg')).backgroundColor).to.equal('rgb(70, 80, 90)');
      const reference = document.createElement('div');
      reference.style.backgroundColor = `color-mix(in srgb, ${colour} 35%, transparent)`;
      el.parentElement!.append(reference);
      expect(getComputedStyle(element(el, '.span')).backgroundColor)
        .to.equal(getComputedStyle(reference).backgroundColor);
      expect(getComputedStyle(element(el, '.dot')).boxShadow)
        .to.equal('rgb(160, 170, 180) 0px 0px 0px 2px');
      el.parentElement!.style.setProperty('--mpl-range-bar-ring', 'rgb(190, 200, 210)');
      expect(getComputedStyle(element(el, '.dot')).boxShadow)
        .to.equal('rgb(190, 200, 210) 0px 0px 0px 2px');
    });
  }

  for (const [key, selector] of [
    ['value', '.dot'], ['spanFrom', '.span'], ['spanTo', '.span'], ['avg', '.avg'],
  ] as const) {
    it(`omits only the dependent indicator when ${key} is null`, async () => {
      const el = await mount();
      el[key] = null;
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(selector)).to.equal(null);
      for (const other of ['.dot', '.span', '.avg'].filter(item => item !== selector)) {
        expect(el.shadowRoot!.querySelector(other)).not.to.equal(null);
      }
    });
  }

  it('removes all indicators for unknown tone, retains zones, and restores them on tone changes', async () => {
    const el = await mount();
    el.tone = 'unknown';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.span, .avg, .dot').length).to.equal(0);
    expect(el.shadowRoot!.querySelectorAll('.zone').length).to.equal(3);
    el.tone = 'problem';
    await el.updateComplete;
    expect(el.getAttribute('tone')).to.equal('problem');
    expect(el.shadowRoot!.querySelectorAll('.span, .avg, .dot').length).to.equal(3);
  });

  describe('motion preferences', () => {
    afterEach(async () => { await emulateMedia({ reducedMotion: null }); });

    it('animates left for 500ms and disables transitions under reduced motion', async () => {
      await emulateMedia({ reducedMotion: 'no-preference' });
      const el = await mount();
      for (const selector of ['.span', '.avg', '.dot']) {
        const style = getComputedStyle(element(el, selector));
        expect(style.transitionProperty).to.equal('left');
        expect(style.transitionDuration).to.equal('0.5s');
        expect(style.transitionTimingFunction).to.equal('cubic-bezier(0.38, 1.21, 0.22, 1)');
      }
      await emulateMedia({ reducedMotion: 'reduce' });
      for (const selector of ['.span', '.avg', '.dot']) {
        const style = getComputedStyle(element(el, selector));
        expect(style.transitionProperty).to.equal('none');
        expect(style.transitionDuration).to.equal('0s');
      }
    });
  });
});
