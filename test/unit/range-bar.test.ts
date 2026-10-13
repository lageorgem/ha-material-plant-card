import { fixture, html, expect } from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { MplRangeBar, spanGradient } from '../../src/full/range-bar';
import type { GaugeTone } from '../../src/types';

async function mount(
  value: number | null = 0.5,
  tone: GaugeTone = 'ok',
  spanFrom: number | null = 0.3,
  spanTo: number | null = 0.6,
  avg: number | null = 0.45,
  avgOk: boolean | null = null,
  showTicks = false,
) {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div style="width: 200px; --mpl-success: rgb(10, 20, 30); --mpl-error: rgb(40, 50, 60);
      --mpl-on-surface-variant: rgb(70, 80, 90); --mpl-outline: rgb(100, 110, 120);
      --mpl-surface-container-highest: rgb(130, 140, 150); --mpl-surface-container-high: rgb(160, 170, 180)">
      <mpl-range-bar .value=${value} .tone=${tone} .spanFrom=${spanFrom}
        .spanTo=${spanTo} .avg=${avg} .avgOk=${avgOk} .showTicks=${showTicks}></mpl-range-bar>
    </div>
  `);
  const el = wrapper.querySelector('mpl-range-bar')!;
  await el.updateComplete;
  return el;
}

function element(el: MplRangeBar, selector: string): HTMLElement {
  return el.shadowRoot!.querySelector<HTMLElement>(selector)!;
}

async function finishAnimations(el: MplRangeBar): Promise<void> {
  await Promise.all(el.shadowRoot!.getAnimations().map(animation => animation.finished));
}

function box(el: MplRangeBar, selector: string) {
  const host = el.getBoundingClientRect();
  const rect = element(el, selector).getBoundingClientRect();
  return { left: rect.left - host.left, top: rect.top - host.top,
    width: rect.width, height: rect.height, centre: rect.left - host.left + rect.width / 2 };
}

describe('spanGradient', () => {
  for (const [lo, hi, expected] of [
    [0.3, 0.6, 'var(--mpl-success)'],
    [0.2, 0.8, 'var(--mpl-success)'],
    [0, 0.1, 'var(--mpl-error)'],
    [0.9, 1, 'var(--mpl-error)'],
    [0.1, 0.5, 'linear-gradient(to right, var(--mpl-error) 0% 25%, var(--mpl-success) 25% 100%)'],
    [0.5, 0.9, 'linear-gradient(to right, var(--mpl-success) 0% 75%, var(--mpl-error) 75% 100%)'],
    [0.1, 0.9, 'linear-gradient(to right, var(--mpl-error) 0% 12.5%, var(--mpl-success) 12.5% 87.5%, var(--mpl-error) 87.5% 100%)'],
    [0.1, 0.1, 'var(--mpl-error)'],
    [0.2, 0.2, 'var(--mpl-success)'],
    [0.5, 0.5, 'var(--mpl-success)'],
    [0.8, 0.8, 'var(--mpl-success)'],
    [0.9, 0.9, 'var(--mpl-error)'],
  ] as const) {
    it(`colours ${lo}–${hi} with ideal-band hard stops`, () => {
      expect(spanGradient(lo, hi)).to.equal(expected);
    });
  }
});

describe('mpl-range-bar', () => {
  it('registers the class, defaults to empty/unknown, and hides the host from accessibility', async () => {
    const el = await fixture<MplRangeBar>(html`<mpl-range-bar></mpl-range-bar>`);
    expect(customElements.get('mpl-range-bar')).to.equal(MplRangeBar);
    expect(el.tone).to.equal('unknown');
    for (const key of ['value', 'spanFrom', 'spanTo', 'avg', 'avgOk'] as const) {
      expect(el[key]).to.equal(null);
    }
    expect(el.getAttribute('aria-hidden')).to.equal('true');
    expect(el.showTicks).to.equal(false);
    expect(el.shadowRoot!.querySelectorAll('.span, .avg, .dot').length).to.equal(0);
  });

  it('lays out the track at the contract position, height, radius and inherited colour', async () => {
    const el = await mount();
    expect(el.getBoundingClientRect().width).to.equal(200);
    expect(el.getBoundingClientRect().height).to.equal(28);
    expect(getComputedStyle(el).display).to.equal('block');
    expect(getComputedStyle(el).position).to.equal('relative');
    const rect = box(el, '.track');
    expect(rect.left).to.equal(0);
    expect(rect.width).to.equal(200);
    expect(rect.top).to.equal(10);
    expect(rect.height).to.equal(4);
    const style = getComputedStyle(element(el, '.track'));
    expect(style.position).to.equal('absolute');
    expect(style.borderRadius).to.equal('2px');
    expect(style.backgroundColor).to.equal('rgb(130, 140, 150)');
  });

  it('renders centred ideal-bound ticks only when requested', async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelector('.tick')).to.equal(null);
    el.showTicks = true;
    await el.updateComplete;
    for (const [selector, centre] of [['.tick-low', 40], ['.tick-high', 160]] as const) {
      const rect = box(el, selector);
      expect(rect.centre).to.equal(centre);
      expect(rect.top).to.equal(5);
      expect(rect.width).to.equal(2);
      expect(rect.height).to.equal(14);
      const style = getComputedStyle(element(el, selector));
      expect(style.borderRadius).to.equal('1px');
      expect(style.backgroundColor).to.equal('rgb(100, 110, 120)');
    }
    el.showTicks = false;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.tick')).to.equal(null);
  });

  for (const [from, to, left, width] of [
    [0.3, 0.6, 60, 60], [0.6, 0.3, 60, 60],
    [0.495, 0.505, 96, 8], [0.505, 0.495, 96, 8], [0.5, 0.5, 96, 8],
    [0, 1, 0, 200],
  ]) {
    it(`positions and centres the span from ${from} to ${to}`, async () => {
      const el = await mount(0.5, 'ok', from, to);
      await finishAnimations(el);
      const rect = box(el, '.span');
      expect(rect.left).to.be.closeTo(left, 0.05);
      expect(rect.width).to.be.closeTo(width, 0.05);
      expect(rect.height).to.equal(8);
      expect(rect.top).to.equal(8);
      expect(getComputedStyle(element(el, '.span')).borderRadius).to.equal('4px');
      expect(element(el, '.span').style.background).to.equal(spanGradient(Math.min(from, to), Math.max(from, to)));
    });
  }

  for (const fraction of [-0.1, 0, 0.3, 0.5, 0.6, 1, 1.1]) {
    it(`centres average at ${fraction} and keeps the current dot inside the host`, async () => {
      const el = await mount(fraction, 'ok', 0.3, 0.6, fraction);
      await finishAnimations(el);
      const avg = box(el, '.avg');
      expect(avg.centre).to.be.closeTo(Math.max(5, Math.min(195, fraction * 200)), 0.05);
      expect(avg.top).to.equal(20);
      expect(avg.width).to.equal(10);
      expect(avg.height).to.equal(6);
      expect(getComputedStyle(element(el, '.avg')).clipPath)
        .to.equal('polygon(50% 0px, 100% 100%, 0px 100%)');
      const dot = box(el, '.dot');
      expect(dot.centre).to.be.closeTo(Math.max(7, Math.min(193, fraction * 200)), 0.05);
      expect(dot.width).to.equal(14);
      expect(dot.height).to.equal(14);
      expect(dot.top).to.equal(5);
      expect(dot.left).to.be.at.least(0);
      expect(dot.left + dot.width).to.be.at.most(200);
    });
  }

  for (const tone of ['ok', 'problem', 'advisory'] as const) {
    it(`inherits ancestor colours for ${tone}, including the hollow dot ring`, async () => {
      const el = await mount(0.5, tone);
      const colour = { ok: 'rgb(10, 20, 30)', problem: 'rgb(40, 50, 60)',
        advisory: 'rgb(70, 80, 90)' }[tone];
      const dotStyle = getComputedStyle(element(el, '.dot'));
      expect(dotStyle.backgroundColor).to.equal('rgb(160, 170, 180)');
      expect(dotStyle.borderColor).to.equal(colour);
      expect(dotStyle.borderWidth).to.equal('3px');
      expect(dotStyle.borderStyle).to.equal('solid');
      expect(dotStyle.boxSizing).to.equal('border-box');
      expect(dotStyle.borderRadius).to.equal('50%');
      expect(dotStyle.boxShadow).to.equal('none');
      expect(getComputedStyle(element(el, '.avg')).backgroundColor).to.equal('rgb(70, 80, 90)');
      expect(getComputedStyle(element(el, '.span')).backgroundColor)
        .to.equal('rgb(10, 20, 30)');
      el.parentElement!.style.setProperty('--mpl-range-bar-ring', 'rgb(190, 200, 210)');
      expect(getComputedStyle(element(el, '.dot')).backgroundColor)
        .to.equal('rgb(190, 200, 210)');
    });
  }

  for (const [avgOk, colour] of [
    [true, 'rgb(10, 20, 30)'], [false, 'rgb(40, 50, 60)'], [null, 'rgb(70, 80, 90)'],
  ] as const) {
    it(`colours the average independently of tone when avgOk is ${avgOk}`, async () => {
      const el = await mount(0.5, 'problem', 0.3, 0.6, 0.45, avgOk);
      expect(getComputedStyle(element(el, '.avg')).backgroundColor).to.equal(colour);
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

  it('removes all indicators for unknown tone, retains track/ticks, and restores indicators on tone changes', async () => {
    const el = await mount(0.5, 'ok', 0.3, 0.6, 0.45, null, true);
    el.tone = 'unknown';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('.span, .avg, .dot').length).to.equal(0);
    expect(el.shadowRoot!.querySelectorAll('.track').length).to.equal(1);
    expect(el.shadowRoot!.querySelectorAll('.tick').length).to.equal(2);
    el.tone = 'problem';
    await el.updateComplete;
    expect(el.getAttribute('tone')).to.equal('problem');
    expect(el.shadowRoot!.querySelectorAll('.span, .avg, .dot').length).to.equal(3);
  });

  describe('motion preferences', () => {
    afterEach(async () => { await emulateMedia({ reducedMotion: null }); });

    for (const motionToken of ['', '500ms cubic-bezier(0.38, 1.21, 0.22, 1)']) {
      it(`preserves entry and transition timing with the theme motion token ${motionToken ? 'set' : 'unset'}`, async () => {
        await emulateMedia({ reducedMotion: 'no-preference' });
        const el = await mount();
        el.parentElement!.style.setProperty('--md-sys-motion-expressive-spatial-default', motionToken);
        for (const [selector, name, duration, delay] of [
          ['.span', 'mpl-span-in', '0.6s', '0s'],
          ['.dot', 'mpl-dot-in', '0.45s', '0.2s'],
          ['.avg', 'mpl-avg-in', '0.35s', '0.35s'],
        ]) {
          const style = getComputedStyle(element(el, selector));
          expect(style.animationName).to.equal(name);
          expect(style.animationDuration).to.equal(duration);
          expect(style.animationDelay).to.equal(delay);
          expect(style.transitionProperty).to.equal('left, width');
          expect(style.transitionDuration).to.equal('0.5s, 0.5s');
          expect(style.transitionDelay).to.equal('0s, 0s');
        }
      });
    }

    it('runs staggered entry animations on first mount', async () => {
      await emulateMedia({ reducedMotion: 'no-preference' });
      const el = await mount();
      for (const [selector, name, duration, delay] of [
        ['.span', 'mpl-span-in', '0.6s', '0s'],
        ['.dot', 'mpl-dot-in', '0.45s', '0.2s'],
        ['.avg', 'mpl-avg-in', '0.35s', '0.35s'],
      ]) {
        const style = getComputedStyle(element(el, selector));
        expect(style.animationName).to.equal(name);
        expect(style.animationDuration).to.equal(duration);
        expect(style.animationDelay).to.equal(delay);
        expect(style.animationFillMode).to.equal('both');
        expect(style.animationTimingFunction).to.equal('cubic-bezier(0.38, 1.21, 0.22, 1)');
      }
      expect(el.shadowRoot!.getAnimations()).to.have.length(3);
      await finishAnimations(el);
      expect(box(el, '.span').width).to.be.closeTo(60, 0.05);
      expect(box(el, '.span').left).to.be.closeTo(60, 0.05);
      expect(box(el, '.dot').centre).to.equal(100);
      expect(box(el, '.dot').width).to.equal(14);
      expect(box(el, '.avg').centre).to.equal(90);
      expect(box(el, '.avg').top).to.equal(20);
    });

    it('animates history indicators when they arrive without restarting the current dot', async () => {
      await emulateMedia({ reducedMotion: 'no-preference' });
      const el = await mount(0.5, 'ok', null, null, null);
      const dotAnimation = element(el, '.dot').getAnimations()[0];
      expect(dotAnimation).not.to.equal(undefined);
      await finishAnimations(el);
      el.spanFrom = 0.3;
      el.spanTo = 0.6;
      el.avg = 0.45;
      await el.updateComplete;
      expect(getComputedStyle(element(el, '.span')).animationName).to.equal('mpl-span-in');
      expect(getComputedStyle(element(el, '.avg')).animationName).to.equal('mpl-avg-in');
      expect(element(el, '.dot').getAnimations()[0]).to.equal(dotAnimation);
      expect(dotAnimation.playState).to.equal('finished');
      expect(element(el, '.span').getAnimations()[0].playState).to.equal('running');
      expect(element(el, '.avg').getAnimations()[0].playState).to.equal('running');
      await finishAnimations(el);
      const entryAnimations = el.shadowRoot!.getAnimations();
      el.value = 0.7;
      el.spanTo = 0.8;
      el.avg = 0.6;
      await el.updateComplete;
      for (const animation of entryAnimations) {
        expect(el.shadowRoot!.getAnimations()).to.include(animation);
        expect(animation.playState).to.equal('finished');
      }
      await finishAnimations(el);
      expect(box(el, '.dot').centre).to.equal(140);
      expect(box(el, '.span').width).to.equal(100);
      expect(box(el, '.avg').centre).to.equal(120);
    });

    it('restarts entry animations after detaching and re-attaching the host', async () => {
      await emulateMedia({ reducedMotion: 'no-preference' });
      const el = await mount();
      await finishAnimations(el);
      const previous = el.shadowRoot!.getAnimations();
      const parent = el.parentElement!;
      el.remove();
      expect(el.shadowRoot!.getAnimations()).to.have.length(0);
      parent.append(el);
      const restarted = el.shadowRoot!.getAnimations();
      expect(restarted).to.have.length(3);
      for (const animation of restarted) {
        expect(previous).not.to.include(animation);
        expect(Number(animation.currentTime)).to.be.closeTo(0, 50);
        expect(animation.playState).to.equal('running');
      }
      await finishAnimations(el);
      expect(box(el, '.dot').centre).to.equal(100);
      expect(box(el, '.avg').centre).to.equal(90);
      expect(box(el, '.span').width).to.be.closeTo(60, 0.05);
    });

    it('animates left/width for 500ms and disables transitions under reduced motion', async () => {
      await emulateMedia({ reducedMotion: 'no-preference' });
      const el = await mount();
      for (const selector of ['.span', '.avg', '.dot']) {
        const style = getComputedStyle(element(el, selector));
        expect(style.transitionProperty).to.equal('left, width');
        expect(style.transitionDuration).to.equal('0.5s, 0.5s');
        expect(style.transitionTimingFunction).to.equal('cubic-bezier(0.38, 1.21, 0.22, 1), cubic-bezier(0.38, 1.21, 0.22, 1)');
      }
      await emulateMedia({ reducedMotion: 'reduce' });
      for (const selector of ['.span', '.avg', '.dot']) {
        const style = getComputedStyle(element(el, selector));
        expect(style.transitionProperty).to.equal('none');
        expect(style.transitionDuration).to.equal('0s');
        expect(style.animationName).to.equal('none');
      }
      expect(el.shadowRoot!.getAnimations()).to.have.length(0);
    });
  });
});
