import { expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import { themeTokens } from '../../src/theme';

class ThemeProbe extends LitElement {
  static styles = themeTokens;

  render() {
    return html`<span style="background: var(--mpl-error-container); color: var(--mpl-on-error-container)">Out of range</span>`;
  }
}
customElements.define('mpl-theme-probe', ThemeProbe);

type RGB = [number, number, number];

/** Normalized sRGB channels from Chromium's resolved rgb() or color(srgb …). */
function parseColor(value: string): RGB {
  expect(value).to.match(/^(rgb\(|color\(srgb )/);
  const channels = value.match(/[\d.]+/g)!.map(Number);
  expect(channels).to.have.length(3);
  return channels.map(channel => value.startsWith('rgb(') ? channel / 255 : channel) as RGB;
}

function luminance(color: RGB): number {
  const linear = color.map(channel => channel <= 0.04045
    ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(foreground: RGB, background: RGB): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function resolveColors(variables: Record<string, string>) {
  const host = await fixture<ThemeProbe>(html`<mpl-theme-probe></mpl-theme-probe>`);
  for (const [name, value] of Object.entries(variables)) host.style.setProperty(name, value);
  const style = getComputedStyle(host.shadowRoot!.querySelector('span')!);
  return { background: parseColor(style.backgroundColor), foreground: parseColor(style.color) };
}

describe('theme error-container tokens', () => {
  for (const theme of [
    { name: 'dark', surface: '#1c1c1c', text: '#e1e1e1', secondary: '#9b9b9b' },
    { name: 'light', surface: '#ffffff', text: '#212121', secondary: '#727272' },
  ]) {
    it(`derives a red, AA-readable container from the HA default ${theme.name} surface`, async () => {
      const { background, foreground } = await resolveColors({
        '--card-background-color': theme.surface,
        '--primary-text-color': theme.text,
        '--secondary-text-color': theme.secondary,
        '--error-color': '#db4437',
      });
      const lightness = luminance(background);
      const ratio = contrast(foreground, background);
      console.log(`HA ${theme.name}: error-container luminance=${lightness.toFixed(6)}, contrast=${ratio.toFixed(6)}:1`);
      if (theme.name === 'dark') expect(lightness).to.be.lessThan(0.1);
      else expect(lightness).to.be.greaterThan(0.5);
      expect(background[0]).to.be.greaterThan(background[1]);
      expect(background[0]).to.be.greaterThan(background[2]);
      expect(ratio).to.be.at.least(4.5);
      const expectedText = theme.name === 'dark' ? 225 / 255 : 33 / 255;
      expect(foreground).to.deep.equal([expectedText, expectedText, expectedText]);
    });
  }

  it('preserves explicit Material error-container colours exactly', async () => {
    const { background, foreground } = await resolveColors({
      '--card-background-color': '#ffffff',
      '--primary-text-color': '#212121',
      '--error-color': '#db4437',
      '--md-sys-color-error-container': '#8c1d18',
      '--md-sys-color-on-error-container': '#f9dedc',
    });
    expect(background).to.deep.equal([140 / 255, 29 / 255, 24 / 255]);
    expect(foreground).to.deep.equal([249 / 255, 222 / 255, 220 / 255]);
    expect(contrast(foreground, background)).to.be.at.least(4.5);
  });
});
