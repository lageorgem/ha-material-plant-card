import { fixture, html, expect } from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { arcPath, MplGauge } from '../../src/gauge/plant-gauge';
import type { GaugeTone } from '../../src/types';

async function mount(fraction: number | null = null, tone: GaugeTone = 'unknown') {
  return fixture<MplGauge>(html`
    <mpl-gauge
      .fraction=${fraction}
      .tone=${tone}
      icon="mdi:water"
      value="13%"
      label="Moisture: 13% (15–65%)"
    ></mpl-gauge>
  `);
}

function pathNumbers(path: string): number[] {
  return path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)!.map(Number);
}

describe('arcPath', () => {
  it('uses clockwise SVG coordinates measured from the positive x axis', () => {
    const numbers = pathNumbers(arcPath(24, 24, 20, 0, 90));
    expect(numbers).to.deep.equal([44, 24, 20, 20, 0, 0, 1, 24, 44]);
  });

  for (const [sweep, flag] of [[90, 0], [180, 0], [181, 1], [270, 1]]) {
    it(`sets the large-arc flag to ${flag} for a ${sweep}° sweep`, () => {
      const numbers = pathNumbers(arcPath(24, 24, 20, 135, 135 + sweep));
      expect(numbers[5]).to.equal(flag);
      expect(numbers[6]).to.equal(1);
    });
  }
});

describe('mpl-gauge', () => {
  describe('motion preferences', () => {
    afterEach(async () => {
      await emulateMedia({ reducedMotion: null });
    });

    it('disables active arc and dot transitions when reduced motion is requested', async () => {
      await emulateMedia({ reducedMotion: 'no-preference' });
      const el = await mount(0.5, 'ok');
      const indicators = ['.active', '.dot'].map(selector => ({
        selector,
        element: el.shadowRoot!.querySelector(selector)!,
      }));

      for (const { selector, element } of indicators) {
        const durations = getComputedStyle(element).transitionDuration.split(',').map(parseFloat);
        expect(durations.every(duration => duration > 0), `${selector} normally animates`).to.equal(true);
      }

      await emulateMedia({ reducedMotion: 'reduce' });
      expect(matchMedia('(prefers-reduced-motion: reduce)').matches).to.equal(true);
      for (const { selector, element } of indicators) {
        const style = getComputedStyle(element);
        expect(style.transitionProperty, `${selector} reduced-motion transition`).to.equal('none');
        expect(style.transitionDuration, `${selector} reduced-motion duration`).to.equal('0s');
      }
    });
  });

  it('registers the exported class and defaults to an unknown, empty gauge', async () => {
    const el = await fixture<MplGauge>(html`<mpl-gauge></mpl-gauge>`);
    expect(customElements.get('mpl-gauge')).to.equal(MplGauge);
    expect(el.fraction).to.equal(null);
    expect(el.embedded).to.equal(false);
    expect(el.tone).to.equal('unknown');
    expect(el.getAttribute('tone')).to.equal('unknown');
    expect(el.shadowRoot!.querySelector('.active')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.dot')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.value')).to.equal(null);
  });

  it('renders three SVG zone paths with eight-degree gaps and distinct track styles', async () => {
    const el = await mount();
    el.style.setProperty('--mpl-outline-variant', 'rgb(10, 20, 30)');
    el.style.setProperty('--mpl-secondary-container', 'rgb(40, 50, 60)');
    const root = el.shadowRoot!;
    expect(root.querySelectorAll('svg path').length).to.equal(3);
    for (const [selector, start, end] of [
      ['.track-low', 135, 185],
      ['.track-ok', 193, 347],
      ['.track-high', 355, 405],
    ] as const) {
      const track = root.querySelector(selector)!;
      expect(track.namespaceURI).to.equal('http://www.w3.org/2000/svg');
      expect(track.getAttribute('d')).to.equal(arcPath(24, 24, 20, start, end));
      expect(getComputedStyle(track).strokeWidth).to.equal(selector === '.track-ok' ? '4px' : '2px');
      expect(getComputedStyle(track).stroke).to.equal(selector === '.track-ok' ? 'rgb(40, 50, 60)' : 'rgb(10, 20, 30)');
      expect(getComputedStyle(track).strokeLinecap).to.equal('round');
    }
  });

  for (const tone of ['ok', 'advisory', 'problem'] as const) {
    for (const fraction of [0.1, 0.2, 0.5, 0.8, 1]) {
      it(`renders the active arc and dot for ${tone} at ${fraction}`, async () => {
        const el = await mount(fraction, tone);
        const active = el.shadowRoot!.querySelector('.active')!;
        const dot = el.shadowRoot!.querySelector('.dot')!;
        expect(el.getAttribute('tone')).to.equal(tone);
        expect(active.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(getComputedStyle(active).strokeWidth).to.equal('4px');
        expect(active.previousElementSibling!.classList.contains('track-high')).to.equal(true);
        expect(active.getAttribute('d')).to.equal(arcPath(24, 24, 20, 135, 135 + 270 * fraction));
        const radians = (135 + 270 * fraction) * Math.PI / 180;
        expect(Number(dot.getAttribute('cx'))).to.be.closeTo(24 + 20 * Math.cos(radians), 0.01);
        expect(Number(dot.getAttribute('cy'))).to.be.closeTo(24 + 20 * Math.sin(radians), 0.01);
        expect(dot.getAttribute('r')).to.equal('3.5');
        expect(getComputedStyle(dot).strokeWidth).to.equal('2px');
      });
    }

    it(`shows only the start dot for ${tone} at zero`, async () => {
      const el = await mount(0, tone);
      expect(el.shadowRoot!.querySelector('.active')).to.equal(null);
      const dot = el.shadowRoot!.querySelector('.dot')!;
      expect(Number(dot.getAttribute('cx'))).to.be.closeTo(24 - 20 / Math.sqrt(2), 0.01);
      expect(Number(dot.getAttribute('cy'))).to.be.closeTo(24 + 20 / Math.sqrt(2), 0.01);
      expect(el.shadowRoot!.querySelector('.gauge')!.getAttribute('aria-valuenow')).to.equal('0');
    });
  }

  for (const tone of ['ok', 'advisory', 'problem', 'unknown'] as const) {
    it(`omits the active arc, dot and aria-valuenow for null with ${tone}`, async () => {
      const el = await mount(null, tone);
      expect(el.shadowRoot!.querySelector('.active')).to.equal(null);
      expect(el.shadowRoot!.querySelector('.dot')).to.equal(null);
      expect(el.shadowRoot!.querySelector('.gauge')!.hasAttribute('aria-valuenow')).to.equal(false);
    });
  }

  it('omits active geometry for unknown tone even with a fraction', async () => {
    const el = await mount(0.5, 'unknown');
    expect(el.shadowRoot!.querySelector('.active')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.dot')).to.equal(null);
  });

  it('sets meter semantics and hides decorative SVG and icon', async () => {
    const el = await mount(0.456, 'ok');
    const meter = el.shadowRoot!.querySelector('.gauge')!;
    expect(meter.getAttribute('role')).to.equal('meter');
    expect(meter.getAttribute('aria-label')).to.equal(el.label);
    expect(meter.getAttribute('aria-valuetext')).to.equal(el.label);
    expect(meter.getAttribute('aria-valuemin')).to.equal('0');
    expect(meter.getAttribute('aria-valuemax')).to.equal('100');
    expect(meter.getAttribute('aria-valuenow')).to.equal('46');
    expect(el.shadowRoot!.querySelector('svg')!.getAttribute('aria-hidden')).to.equal('true');
    const icon = el.shadowRoot!.querySelector('ha-icon')!;
    expect(icon.getAttribute('aria-hidden')).to.equal('true');
    expect(icon.getAttribute('icon')).to.equal('mdi:water');
  });

  it('removes wrapper semantics when embedded and restores them when standalone', async () => {
    const el = await mount(0.456, 'ok');
    el.embedded = true;
    await el.updateComplete;
    const wrapper = el.shadowRoot!.querySelector('.gauge')!;
    expect(wrapper.hasAttribute('role')).to.equal(false);
    expect(wrapper.getAttributeNames().filter(name => name.startsWith('aria-'))).to.deep.equal([]);
    el.embedded = false;
    await el.updateComplete;
    expect(wrapper.getAttribute('role')).to.equal('meter');
    expect(wrapper.getAttribute('aria-label')).to.equal(el.label);
    expect(wrapper.getAttribute('aria-valuetext')).to.equal(el.label);
    expect(wrapper.getAttribute('aria-valuemin')).to.equal('0');
    expect(wrapper.getAttribute('aria-valuemax')).to.equal('100');
    expect(wrapper.getAttribute('aria-valuenow')).to.equal('46');
  });

  it('accepts the embedded boolean attribute without wrapper role or aria attributes', async () => {
    const el = await fixture<MplGauge>(html`<mpl-gauge embedded label="Moisture"></mpl-gauge>`);
    expect(el.embedded).to.equal(true);
    const wrapper = el.shadowRoot!.querySelector('.gauge')!;
    expect(wrapper.hasAttribute('role')).to.equal(false);
    expect(wrapper.getAttributeNames().filter(name => name.startsWith('aria-'))).to.deep.equal([]);
  });

  it('renders value text verbatim and removes it when empty', async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelector('.value')!.textContent).to.equal('13%');
    el.value = '';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.value')).to.equal(null);
  });

  it('updates reflected tone and removes stale active geometry and aria value', async () => {
    const el = await mount(0.5, 'ok');
    el.tone = 'problem';
    await el.updateComplete;
    expect(el.getAttribute('tone')).to.equal('problem');
    el.fraction = null;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.active')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.dot')).to.equal(null);
    expect(el.shadowRoot!.querySelector('.gauge')!.hasAttribute('aria-valuenow')).to.equal(false);
  });
});
