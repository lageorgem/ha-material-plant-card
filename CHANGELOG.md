# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-10-12

Unreleased — first public release in preparation.

### Added

- Material 3 Expressive plant card for Olen's plant monitor integration. Full mode is the default, as in flower-card: a header and grouped metric tiles with tonal icons, labels, large values with units and horizontal range bars with thin low/high zones and a thick ideal band.
- Full-mode last-24h recorder statistics: translucent min–max pill, average triangle, ringed current-value dot and captions such as `Ideal 20–60 · 24h 25–48`. Refreshes every 10 minutes; `hide_history: true` disables it. Requires recorder long-term statistics for `state_class: measurement` sensors; running-total DLI has no 24-hour min/max/mean data.
- Compact mode with circular three-zone range gauges, active arcs and position dots. Coloured fill follows the track's thin low/high zones, thick just-right band and the same gaps.
- Success gauge colour in range (`--md-sys-color-success`, falling back to `--success-color`), neutral on-surface-variant out of range without a problem, and error colour for problems with bold, error-coloured value text. Logarithmic illuminance scaling for lux readings with positive minimum thresholds.
- Support for moisture, conductivity, temperature, illuminance, humidity, DLI, 24-hour DLI, CO₂, soil temperature and VPD measurements supplied by the integration.
- Cookie-shaped plant photos with configurable image override and a missing/broken-image placeholder; plant name, species or problem summary, and a red error circle with a centred **!** on the photo.
- Integration-driven problems by default (low illuminance at night can remain neutral), optional out-of-range gauge problems, and measurement filtering through `problem_sensors`.
- Optional bare iOS-style battery glyph with the level number inside; error colour below `battery_warn_level` (default 10%), otherwise neutral. `battery_ok_level` is accepted but ignored for flower-card compatibility and removed from the visual editor.
- Two-line Material plain gauge tooltips: `<Metric>[ · too low/high]` and `<value> <unit> · ideal <min>–<max> <unit>`. Touch long-press (about 0.45 s), mouse hover (0.5 s) and keyboard focus show the tooltip; Escape dismisses. Normal taps open sensor more-info; long-presses do not. Photo/name and battery taps open their respective more-info dialogs.
- Shared photo size and species header in both modes, configurable measurement order and visibility, and `hide_units` defaulting to `false` in both modes. When enabled, it hides only the unit beside full-mode values, but complete compact gauge value text. Tap tiles or gauges for sensor more-info.
- Compact width-measured, balanced gauge rows when gauges do not fit one row, with the extra on the first row and the last row centred (two-row examples: 5 → 3/2, 6 → 3/3, 7 → 4/3). Compact is approximately 327 × 160 px at 327 px width with six gauges, versus flower-card's 327 × 203 px; full mode is approximately 446 px tall with six tiles.
- Home Assistant visual configuration form with Gauges, Problems and Appearance sections.
- Material You theme tokens with Home Assistant theme fallbacks and reduced-motion support.
- Flower-card-compatible configuration keys, with `bars_per_row`, `show_care` and `extra_badges` accepted and ignored; independent implementation with no shared code.
- HACS/manual installation documentation, full-options and migration YAML examples, and content-addressed local deployment with SHA-256 verification before resource registration.

[0.1.0]: https://github.com/lageorgem/ha-material-plant-card/releases/tag/v0.1.0
