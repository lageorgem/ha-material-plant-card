# Material Plant Card

Material 3 Expressive plant monitoring for Home Assistant, using [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Pairs with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme).

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Eleven plants on a dark dashboard using Material Plant Card in compact mode" width="900">

- Full mode (default, as in flower-card): a header and grouped Material 3 Expressive metric tiles with tonal icons, labels, large values with units and horizontal range bars. Thin low/high zones surround the thick ideal band; a translucent pill marks the last-24h min–max, a small triangle marks the average, and a ringed dot marks the current value. Captions show **Ideal a–b · 24h c–d**.
- Compact mode: circular gauges with low, just-right and high zones, an active arc and a position dot; coloured fill follows the track's thin outer zones, thick just-right band and gaps. Logarithmic illuminance scaling for positive lux thresholds applies in both modes.
- Success colour in range (`--md-sys-color-success`, falling back to `--success-color`), neutral on-surface-variant for out-of-range readings without a problem, and error colour for problems with bold, error-coloured value text.
- Cookie-shaped plant photo, missing-image placeholder, species or problem summary, and a red error circle with a centred **!** when attention is needed.
- Optional bare iOS-style battery glyph with the level number inside; red below `battery_warn_level` (default **10%**), otherwise neutral. `battery_ok_level` is accepted but ignored for flower-card compatibility and is not in the visual editor.
- Integration-driven problems by default, or opt-in problems from out-of-range gauges.
- Both modes share the photo size and species header, with a visual editor for Gauges, Problems and Appearance.
- Compact has width-aware balanced gauge rows: when two rows are needed, five split 3/2, six 3/3 and seven 4/3, with the last row centred. Its six-gauge footprint is approximately **327 × 160 px** at 327 px width, versus flower-card's **327 × 203 px**. Full mode is approximately **446 px** tall with six tiles.
- Flower-card-compatible configuration: change only the card type. `bars_per_row`, `show_care` and `extra_badges` are accepted but ignored.

Requires **Home Assistant 2024.8.0+** and the plant monitor custom integration. Install through HACS or add the JavaScript Module resource manually, then add:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
```

Replace the entity ID with your own. Sensor readings and ranges come from the integration. Tap tiles or gauges for sensor more-info, or the photo/name for plant more-info. Set `display_type: compact` for gauges instead of the default full-mode tiles. `hide_units` defaults to `false` in both modes; `true` hides only the unit next to full-mode values, but hides complete compact gauge value text.

Full-mode history uses Home Assistant recorder long-term statistics for sensors with `state_class: measurement` (provided by plant monitor measurement sensors). It refreshes every **10 minutes**; `hide_history: true` disables fetching and displaying it. DLI is a running total and has no 24-hour min–max/average data. Missing statistics leave the current value and ideal range visible.

Compact-mode gauge tooltips use the Material plain style with two lines: `<Metric>[ · too low/high]` and `<value> <unit> · ideal <min>–<max> <unit>`. Show them with a touch long-press (about 0.45 s), mouse hover (0.5 s) or keyboard focus; Escape dismisses. A normal tap still opens sensor more-info; a long-press does not. With the default `problem_source: plant`, low illuminance at night can stay neutral when the integration does not flag a problem.

See the [README](https://github.com/lageorgem/ha-material-plant-card#readme) for installation and all options, the [full-options example](https://github.com/lageorgem/ha-material-plant-card/blob/master/examples/card.yaml), and [CHANGELOG.md](https://github.com/lageorgem/ha-material-plant-card/blob/master/CHANGELOG.md) for release history.

Independent implementation inspired by [Olen's flower-card](https://github.com/Olen/lovelace-flower-card), with no shared code. MIT licensed. Author: George Mihai.
