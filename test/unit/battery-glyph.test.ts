import { fixture, html, expect } from '@open-wc/testing';
import { MplBattery, contrastRatio } from '../../src/battery/battery-glyph';

function blend(background: string, foreground: string, opacity: number): string {
  const channels = [1, 3, 5].map(offset => {
    const bg = parseInt(background.slice(offset, offset + 2), 16);
    const fg = parseInt(foreground.slice(offset, offset + 2), 16);
    return Math.round(bg * (1 - opacity) + fg * opacity).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

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
      expect(Number(getComputedStyle(root.querySelector('.nub')!).opacity)).to.equal(level === 100 ? 1 : 0.3);
    });
  }

  it('calculates WCAG contrast independently of color order', () => {
    expect(contrastRatio('#000000', '#ffffff')).to.equal(21);
    expect(contrastRatio('#ffffff', '#000000')).to.equal(21);
    expect(contrastRatio('#201b13', '#201b13')).to.equal(1);
    expect(() => contrastRatio('invalid', '#ffffff')).to.throw(TypeError);
  });

  it('keeps the unknown question mark above 4.5:1 on the outline track', async () => {
    const background = '#201b13';
    const outline = '#9b8f80';
    const foreground = '#d2c4b4';
    const el = await mount();
    el.style.setProperty('--mpl-surface-bg', background);
    el.style.setProperty('--mpl-outline', outline);
    el.style.setProperty('--mpl-on-surface-variant', foreground);
    const root = el.shadowRoot!;
    const text = root.querySelector('text')!;
    const track = root.querySelector('.track')!;
    const nub = root.querySelector('.nub')!;
    const opacity = Number(getComputedStyle(track).opacity);

    expect(opacity).to.equal(0.3);
    expect(contrastRatio(foreground, blend(background, outline, opacity))).to.be.at.least(4.5);
    expect(text.textContent).to.equal('?');
    expect(getComputedStyle(text).fill).to.equal('rgb(210, 196, 180)');
    expect(getComputedStyle(track).fill).to.equal('rgb(155, 143, 128)');
    expect(getComputedStyle(nub).fill).to.equal('rgb(155, 143, 128)');
    expect(Number(getComputedStyle(nub).opacity)).to.equal(opacity);

    el.style.setProperty('--mpl-on-surface-variant', 'rgb(20, 30, 40)');
    expect(getComputedStyle(text).fill).to.equal('rgb(20, 30, 40)');
  });

  for (const [tone, color] of [['ok', '#d2c4b4'], ['low', '#ffb4ab']] as const) {
    it(`keeps ${tone} digits above 4.5:1 on both track and fill at every level`, async () => {
      const background = '#201b13';
      const el = await mount(0, tone);
      el.style.setProperty('--mpl-surface-bg', background);
      el.style.setProperty('--mpl-on-surface-variant', '#d2c4b4');
      el.style.setProperty('--mpl-error', '#ffb4ab');
      const opacity = Number(getComputedStyle(el).getPropertyValue('--mpl-battery-track-opacity'));
      expect(opacity).to.equal(0.3);
      expect(contrastRatio(color, blend(background, color, opacity))).to.be.at.least(4.5);
      expect(contrastRatio(background, color)).to.be.at.least(4.5);
      expect(contrastRatio(color, blend(background, color, opacity + 0.05))).to.be.lessThan(4.5);

      for (let level = 0; level <= 100; level++) {
        el.level = level;
        await el.updateComplete;
        const root = el.shadowRoot!;
        expect(Number(getComputedStyle(root.querySelector('.track')!).opacity)).to.equal(opacity);
        expect(Number(getComputedStyle(root.querySelector('.nub')!).opacity)).to.equal(level === 100 ? 1 : opacity);
        expect(getComputedStyle(root.querySelector('.number-filled')!).fill).to.equal('rgb(32, 27, 19)');
        expect(getComputedStyle(root.querySelector('text:not(.number-filled)')!).fill).to.equal(getComputedStyle(el).color);
      }
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
