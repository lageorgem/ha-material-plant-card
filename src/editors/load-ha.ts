let promise: Promise<void> | undefined;

/** Ask HA's built-in editor to load the stock form and selector components. */
export function ensureHaComponents(): Promise<void> {
  if (promise) return promise;
  promise = (async () => {
    if (customElements.get('ha-form') && customElements.get('ha-entity-picker') && customElements.get('ha-icon-picker')) return;
    const loader = (window as Window & {
      loadCardHelpers?: () => Promise<{
        createCardElement: (config: { type: string; entities: string[] }) => HTMLElement | Promise<HTMLElement>;
      }>;
    }).loadCardHelpers;
    if (!loader) return;
    try {
      const helpers = await loader();
      const card = await helpers.createCardElement({ type: 'entities', entities: [] });
      const ctor = card.constructor as typeof HTMLElement & { getConfigElement?: () => Promise<HTMLElement> };
      await ctor.getConfigElement?.();
    } catch {
      // Best effort: use the components HA has already registered if its loader changes.
    }
  })();
  return promise;
}

/** @internal Test seam for the memoized HA loader. */
export function resetHaComponentsForTest(): void {
  promise = undefined;
}
