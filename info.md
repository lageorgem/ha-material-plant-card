# Material Plant Card

Material 3 Expressive plant monitoring for Home Assistant, using [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Pairs with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme).

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Eleven plants on a dark dashboard using Material Plant Card in compact mode" width="900">

- Full mode (default, as in flower-card): a header and grouped Material 3 Expressive metric tiles. Each title row has a small tone-coloured icon and metric name, with **Last 24 h**, **Last 7 d**, **Daytime · 24 h**, **Daytime · 7 d** or **Daily · 7 d** on the right. A large current value with its unit sits above **Ideal a–b** on the left. On the right, a scale has ticks at the ideal bounds and a historical min–max segment coloured success inside the ideal range and error outside it. A hollow ring marks the current value. For non-cumulative sensors, out-of-range current values, rings and title icons turn error red even when problem settings do not flag a problem, except for 0 lx with daytime-only illuminance enabled. Cumulative current values such as DLI keep the problem-setting colour. A triangle below the scale marks the average, success-coloured in range and error-coloured outside it. Below that, **Min · Avg · Max** values each get an error badge when outside the ideal range, independently of problem settings. Only real problems add the red left accent and faint error tint.
- Compact mode: circular gauges with icons centred on the dial, low, just-right and high zones, an active arc and a position dot; coloured fill follows the track's thin outer zones, thick just-right band and gaps. Logarithmic illuminance scaling for positive lux thresholds applies in both modes.
- Success colour in range (`--md-sys-color-success`, falling back to `--success-color`). Compact gauges use neutral on-surface-variant for out-of-range readings without a problem, and error colour for problems with bold, error-coloured value text.
- Cookie-shaped plant photo, missing-image placeholder, species or problem summary, and a red error circle with a centred **!** when attention is needed.
- Optional bare iOS-style battery glyph with the level number inside; red below `battery_warn_level` (default **10%**), otherwise neutral. `battery_ok_level` is accepted but ignored for flower-card compatibility and is not in the visual editor.
- Integration-driven problems by default, or opt-in problems from out-of-range gauges.
- Both modes share the photo size and species header, with a visual editor for Metrics, Problems and Appearance.
- Compact has width-aware balanced gauge rows: when two rows are needed, five split 3/2, six 3/3 and seven 4/3, with the last row centred. Its six-gauge footprint is approximately **327 × 160 px** at 327 px width, versus flower-card's **327 × 203 px**. Full-mode tiles are approximately **84 px** tall; a six-metric full card is approximately **327 × 614 px**.
- Flower-card-compatible configuration: change only the card type. `bars_per_row`, `show_care` and `extra_badges` are accepted but ignored.

Requires **Home Assistant 2024.8.0+** and the plant monitor custom integration. Install through HACS or add the JavaScript Module resource manually, then add:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
```

Replace the entity ID with your own. Sensor readings and ranges come from the integration. Tap tiles or gauges for sensor more-info, or the photo/name for plant more-info. Set `display_type: compact` for gauges instead of the default full-mode tiles. `hide_units` defaults to `false` in both modes; `true` hides only the unit next to full-mode values, but hides complete compact gauge value text.

Full-mode history generally uses Home Assistant recorder long-term statistics for sensors with `state_class: measurement` (provided by plant monitor measurement sensors). `history_period` is an optional string: `24h` (default) or `7d` (example: `history_period: 7d`). It selects the window for the range, average and Min/Avg/Max; choose **Metrics → History window** in the editor. The tile label is **Last 24 h** or **Last 7 d**. The historical range includes the current reading if it extends beyond the recorded range, except for 0 lx in daytime-only illuminance mode.

`illuminance_daytime_only` is an optional boolean, default `true` (example: `illuminance_daytime_only: true`). In full mode, illuminance ignores 0 lx (night) readings in its range, average and **Min · Avg · Max**. It uses Home Assistant's raw history because recorder hourly statistics cannot exclude darkness; the average is time-weighted over daylight (readings above 0 lx, not a sunrise/sunset schedule). Keep the sensor in recorder history for the selected window. Labels are **Daytime · 24 h** or **Daytime · 7 d**, following `history_period`. A current 0 lx reading does not extend the range and keeps the problem-setting colour rather than automatically turning error red; with default plant-driven problems, red requires a selected plant monitor problem. Set `illuminance_daytime_only: false` to restore the previous behaviour, or disable **Metrics → Ignore darkness in illuminance history**. Compact mode is unchanged.

Cumulative sensors (`state_class: total` or `total_increasing`), including the plant monitor's DLI, always show daily totals for the **last 7 complete days**, labelled **Daily · 7 d**, regardless of `history_period`. Today's partial total is excluded from the historical range, average and Min/Avg/Max; the large DLI value remains today's running total. This replaces the previous DLI **—** history display.

History refreshes every **10 minutes**; `hide_history: true` disables fetching and removes the history label, the scale's historical segment and average marker, and the Min/Avg/Max row, keeping current values, ideal ranges, ticks and current-value rings. Missing statistics show **—** without a historical segment or average marker and leave the current value and ideal range visible. Historical segment and average colours follow the ideal bounds independently of problem settings.

Compact-mode gauge tooltips use the Material plain style with two lines: `<Metric>[ · too low/high]` and `<value> <unit> · ideal <min>–<max> <unit>`. Show them with a touch long-press (about 0.45 s), mouse hover (0.5 s) or keyboard focus; Escape dismisses. A normal tap still opens sensor more-info; a long-press does not. With the default `problem_source: plant`, low illuminance at night can stay neutral when the integration does not flag a problem.

See the [README](https://github.com/lageorgem/ha-material-plant-card#readme) for installation and all options, the [full-options example](https://github.com/lageorgem/ha-material-plant-card/blob/master/examples/card.yaml), and [CHANGELOG.md](https://github.com/lageorgem/ha-material-plant-card/blob/master/CHANGELOG.md) for release history.

Independent implementation inspired by [Olen's flower-card](https://github.com/Olen/lovelace-flower-card), with no shared code. MIT licensed. Author: George Mihai.
