import { css } from 'lit';

/** Material You first, Home Assistant second; inherited by nested gauges. */
export const themeTokens = css`
  :host {
    --mpl-primary: var(--md-sys-color-primary, var(--primary-color, #6750a4));
    --mpl-on-primary: var(--md-sys-color-on-primary, #ffffff);
    --mpl-primary-container: var(--md-sys-color-primary-container, rgba(103, 80, 164, 0.16));
    --mpl-on-primary-container: var(--md-sys-color-on-primary-container, var(--primary-text-color, #21005d));
    --mpl-secondary-container: var(--md-sys-color-secondary-container, rgba(103, 80, 164, 0.14));
    --mpl-on-secondary-container: var(--md-sys-color-on-secondary-container, var(--primary-text-color, #1d192b));
    --mpl-tertiary: var(--md-sys-color-tertiary, #7d5260);
    --mpl-success: var(--md-sys-color-success, var(--success-color, #4caf50));
    --mpl-error: var(--md-sys-color-error, var(--error-color, #b3261e));
    --mpl-on-error: var(--md-sys-color-on-error, #ffffff);
    --mpl-error-container: var(--md-sys-color-error-container, color-mix(in srgb, var(--mpl-error) 30%, var(--mpl-surface-bg)));
    --mpl-on-error-container: var(--md-sys-color-on-error-container, var(--mpl-on-surface));
    --mpl-surface: var(--md-sys-color-surface, var(--card-background-color, #fef7ff));
    --mpl-surface-bg: var(--ha-card-background, var(--card-background-color, #f3edf7));
    --mpl-surface-container: var(--md-sys-color-surface-container, color-mix(in srgb, var(--mpl-on-surface) 8%, var(--mpl-surface-bg)));
    --mpl-surface-container-high: var(--md-sys-color-surface-container-high, color-mix(in srgb, var(--mpl-on-surface) 11%, var(--mpl-surface-bg)));
    --mpl-surface-container-highest: var(--md-sys-color-surface-container-highest, color-mix(in srgb, var(--mpl-on-surface) 14%, var(--mpl-surface-bg)));
    --mpl-on-surface: var(--md-sys-color-on-surface, var(--primary-text-color, #1c1b1f));
    --mpl-inverse-surface: var(--md-sys-color-inverse-surface, #313033);
    --mpl-inverse-on-surface: var(--md-sys-color-inverse-on-surface, #f4eff4);
    --mpl-on-surface-variant: var(--md-sys-color-on-surface-variant, var(--secondary-text-color, #49454f));
    --mpl-outline: var(--md-sys-color-outline, var(--divider-color, #79747e));
    --mpl-outline-variant: var(--md-sys-color-outline-variant, var(--divider-color, #cac4d0));
    --mpl-shape-card: var(--md-sys-shape-corner-extra-large, 28px);
    --mpl-shape-full: var(--md-sys-shape-corner-full, 9999px);
    --mpl-ease-spatial: cubic-bezier(0.38, 1.21, 0.22, 1);
  }
`;
