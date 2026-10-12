# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-10-12

Unreleased — first public release in preparation.

### Added

- Material 3 Expressive plant card for Olen's plant monitor integration. Full mode is the default, as in flower-card: a header and grouped metric tiles with a small tone-coloured icon and metric name in the title row, `Last 24 h` on the right, a large current value with its unit and `Ideal a–b` below it. Problem tiles have an error accent on the left edge and a faint error tint.
- Full-mode last-24h recorder statistics: a scale on the right with ideal-bound ticks, a min–max segment coloured success inside the ideal range and error outside it, a hollow current-value ring using success/error/neutral per problem settings, and an average triangle below the scale coloured success in range or error outside it. Min/Avg/Max values below the scale each get an error badge outside the ideal range. Historical colours follow ideal bounds independently of problem settings; the historical range includes the current reading if it extends beyond recorded bounds. Refreshes every 10 minutes; `hide_history: true` disables fetching and removes `Last 24 h`, the historical segment, average marker and Min/Avg/Max row, keeping current values, ideal ranges, ticks and current-value rings. Requires recorder long-term statistics for `state_class: measurement` sensors; missing history, including running-total DLI, shows `—` for Min/Avg/Max with no historical segment or average marker.
- Compact mode with circular three-zone range gauges, icons centred on the dial, active arcs and position dots. Coloured fill follows the track's thin low/high zones, thick just-right band and the same gaps.
- Success gauge colour in range (`--md-sys-color-success`, falling back to `--success-color`), neutral on-surface-variant out of range without a problem, and error colour for problems with bold, error-coloured value text. Logarithmic illuminance scaling for lux readings with positive minimum thresholds.
- Support for moisture, conductivity, temperature, illuminance, humidity, DLI, 24-hour DLI, CO₂, soil temperature and VPD measurements supplied by the integration.
- Cookie-shaped plant photos with configurable image override and a missing/broken-image placeholder; plant name, species or problem summary, and a red error circle with a centred **!** on the photo.
- Integration-driven problems by default (low illuminance at night can remain neutral), optional out-of-range gauge problems, and measurement filtering through `problem_sensors`.
- Optional bare iOS-style battery glyph with the level number inside; error colour below `battery_warn_level` (default 10%), otherwise neutral. `battery_ok_level` is accepted but ignored for flower-card compatibility and removed from the visual editor.
- Two-line Material plain gauge tooltips: `<Metric>[ · too low/high]` and `<value> <unit> · ideal <min>–<max> <unit>`. Touch long-press (about 0.45 s), mouse hover (0.5 s) and keyboard focus show the tooltip; Escape dismisses. Normal taps open sensor more-info; long-presses do not. Photo/name and battery taps open their respective more-info dialogs.
- Shared photo size and species header in both modes, configurable measurement order and visibility, and `hide_units` defaulting to `false` in both modes. When enabled, it hides only the unit beside full-mode values, but complete compact gauge value text. Tap tiles or gauges for sensor more-info.
- Compact width-measured, balanced gauge rows when gauges do not fit one row, with the extra on the first row and the last row centred (two-row examples: 5 → 3/2, 6 → 3/3, 7 → 4/3). Compact is approximately 327 × 160 px at 327 px width with six gauges, versus flower-card's 327 × 203 px; full-mode tiles are approximately 84 px tall and a six-metric full card is approximately 327 × 614 px.
- Home Assistant visual configuration form with Gauges, Problems and Appearance sections.
- Material You theme tokens with Home Assistant theme fallbacks and reduced-motion support.
- Flower-card-compatible configuration keys, with `bars_per_row`, `show_care` and `extra_badges` accepted and ignored; independent implementation with no shared code.
- HACS/manual installation documentation, full-options and migration YAML examples, and content-addressed local deployment with SHA-256 verification before resource registration.

[0.1.0]: https://github.com/lageorgem/ha-material-plant-card/releases/tag/v0.1.0
