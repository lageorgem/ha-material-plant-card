import { fixture, html, expect } from '@open-wc/testing';
import { MplBattery } from '../../src/battery/battery-glyph';

async function mount(level: number | null = null, tone: MplBattery['tone'] = 'unknown') {
  return fixture<MplBattery>(html`<mpl-battery .level=${level} .tone=${tone}></mpl-battery>`);
}

describe('mpl-battery', () => {
  it('registers the exported class and renders an unknown battery by default', async () => {
    const el = await mount();
    expect(customElements.get('mpl-battery')).to.equal(MplBattery);
    expect(el.level).to.equal(null);
    expect(el.getAttribute('tone')).to.equal('unknown');
    expect(el.shadowRoot!.querySelector('.level-fill')).to.equal(null);
    expect(el.shadowRoot!.querySelectorAll('text').length).to.equal(1);
    expect(el.shadowRoot!.querySelector('text')!.textContent).to.equal('?');
  });

  for (const level of [0, 8, 50, 100]) {
    it(`renders proportional fill and knockout digits for ${level}`, async () => {
      const el = await mount(level, level < 10 ? 'low' : 'ok');
      const root = el.shadowRoot!;
      const fill = root.querySelector('.level-fill');
      if (level === 0) expect(fill).to.equal(null);
      else {
        expect(Number(fill!.getAttribute('width'))).to.be.closeTo(26 * level / 100, 0.00001);
        expect(fill!.getAttribute('clip-path')).to.match(/^url\(#.+\)$/);
      }
      const texts = [...root.querySelectorAll('text')];
      expect(texts.length).to.equal(2);
      for (const text of texts) {
        expect(text.textContent).to.equal(String(level));
        expect(text.getAttribute('x')).to.equal('13.5');
        expect(text.getAttribute('y')).to.equal('7.5');
        expect(text.getAttribute('text-anchor')).to.equal('middle');
        expect(text.getAttribute('dominant-baseline')).to.equal('central');
        expect(text.getAttribute('clip-path')).to.match(/^url\(#.+\)$/);
      }
      expect(root.querySelector('.nub')!.getAttribute('opacity')).to.equal(level === 100 ? '1' : '0.35');
    });
  }

  for (const [input, normalized] of [[-10, 0], [120, 100], [49.6, 50]]) {
    it(`normalizes ${input} to ${normalized}`, async () => {
      const el = await mount(input, 'ok');
      expect(el.shadowRoot!.querySelector('text')!.textContent).to.equal(String(normalized));
      const fill = el.shadowRoot!.querySelector('.level-fill');
      expect(fill ? Number(fill.getAttribute('width')) : 0).to.equal(26 * normalized / 100);
    });
  }

  it('updates level and reflected tone without changing clip ids', async () => {
    const el = await mount(50, 'ok');
    const ids = [...el.shadowRoot!.querySelectorAll('clipPath')].map(clip => clip.id);
    el.level = null;
    el.tone = 'unknown';
    await el.updateComplete;
    expect(el.getAttribute('tone')).to.equal('unknown');
    expect(el.shadowRoot!.querySelector('.level-fill')).to.equal(null);
    expect(el.shadowRoot!.querySelector('text')!.textContent).to.equal('?');
    expect([...el.shadowRoot!.querySelectorAll('clipPath')].map(clip => clip.id)).to.deep.equal(ids);
  });

  it('uses distinct clip ids for each instance and resolves every clip reference locally', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div><mpl-battery .level=${8}></mpl-battery><mpl-battery .level=${50}></mpl-battery></div>
    `);
    const ids: string[] = [];
    for (const el of wrapper.querySelectorAll('mpl-battery')) {
      await el.updateComplete;
      const localIds = [...el.shadowRoot!.querySelectorAll('clipPath')].map(clip => clip.id);
      ids.push(...localIds);
      for (const clipped of el.shadowRoot!.querySelectorAll('[clip-path]')) {
        const id = clipped.getAttribute('clip-path')!.slice(5, -1);
        expect(localIds).to.include(id);
      }
    }
    expect(ids.length).to.equal(6);
    expect(new Set(ids).size).to.equal(ids.length);
  });

  it('inherits semantic colors from a wrapper and reflects tone changes', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="--mpl-error: rgb(200, 10, 20); --mpl-on-surface-variant: rgb(20, 30, 40); --mpl-outline: rgb(80, 90, 100); --mpl-surface-bg: rgb(250, 250, 250)">
        <mpl-battery .level=${8} tone="ok"></mpl-battery>
      </div>
    `);
    const el = wrapper.querySelector('mpl-battery')!;
    await el.updateComplete;
    expect(getComputedStyle(el).color).to.equal('rgb(20, 30, 40)');
    expect(getComputedStyle(el.shadowRoot!.querySelector('.number-filled')!).fill).to.equal('rgb(250, 250, 250)');
    el.tone = 'low';
    await el.updateComplete;
    expect(el.getAttribute('tone')).to.equal('low');
    expect(getComputedStyle(el).color).to.equal('rgb(200, 10, 20)');
    el.tone = 'unknown';
    await el.updateComplete;
    expect(getComputedStyle(el).color).to.equal('rgb(80, 90, 100)');
  });

  it('renders only a decorative SVG in a 30 by 15 inline-block host', async () => {
    const el = await mount(100, 'ok');
    const box = el.getBoundingClientRect();
    expect(box.width).to.equal(30);
    expect(box.height).to.equal(15);
    expect(getComputedStyle(el).display).to.equal('inline-block');
    const svg = el.shadowRoot!.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).to.equal('0 0 30 15');
    expect(svg.getAttribute('aria-hidden')).to.equal('true');
    expect(svg.getAttribute('focusable')).to.equal('false');
    expect(el.shadowRoot!.querySelector('div')).to.equal(null);
  });
});
