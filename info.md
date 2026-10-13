# Material Plant Card

Material 3 Expressive plant monitoring for Home Assistant, using [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Pairs with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme).

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Eleven plants on a dark dashboard using Material Plant Card in compact mode" width="900">

- Full mode (default, as in flower-card): grouped Material 3 Expressive metric tiles with an icon, name and history label above a large current value and **Ideal a–b**. Summary display shows ideal-bound ticks, a threshold-coloured min–max segment, a current-value ring, an average triangle and **Min · Avg · Max** badges. Graph display shows a threshold-coloured history line, min, average (dashed) and max gridlines labelled on a small left-side y-axis, min/max triangles and a latest-value ring, with no average marker or statistics row.
- Compact mode: circular gauges with icons centred on the dial, low, just-right and high zones, an active arc and a position dot; coloured fill follows the track's thin outer zones, thick just-right band and gaps. Logarithmic illuminance scaling for positive lux thresholds applies in both modes.
- Success colour in range (`--md-sys-color-success`, falling back to `--success-color`). Compact gauges use neutral on-surface-variant for out-of-range readings without a problem, and error colour for problems with bold, error-coloured value text.
- Cookie-shaped plant photo, missing-image placeholder, species or problem summary, and a red error circle with a centred **!** when attention is needed.
- Optional bare iOS-style battery glyph with the level number inside; red below `battery_warn_level` (default **10%**), otherwise neutral. `battery_ok_level` is accepted but ignored for flower-card compatibility and is not in the visual editor.
- Integration-driven problems by default, or opt-in range-based problems. Per-metric triggers can follow the plant monitor, flag either bound, flag only low/high, or never flag.
- Both modes share the photo size and species header, with a visual editor for **Metrics**, **Per-metric settings**, **Problems** and **Appearance**. Per-metric settings has one expandable section per measurement.
- Compact has width-aware balanced gauge rows: when two rows are needed, five split 3/2, six 3/3 and seven 4/3, with the last row centred. Its six-gauge footprint is approximately **327 × 160 px** at 327 px width, versus flower-card's **327 × 203 px**. Full-mode tiles are approximately **84 px** tall; a six-metric full card is approximately **327 × 614 px**.
- Flower-card-compatible configuration: change only the card type. `bars_per_row`, `show_care` and `extra_badges` are accepted but ignored.

Requires **Home Assistant 2024.8.0+** and the plant monitor custom integration. Install through HACS or add the JavaScript Module resource manually, then add:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
```

Replace the entity ID with your own. Sensor readings and ranges come from the integration. Tap tiles or gauges for sensor more-info, or the photo/name for plant more-info. Set `display_type: compact` for gauges instead of the default full-mode tiles. `hide_units` defaults to `false` in both modes; `true` hides only the unit next to full-mode values, but hides complete compact gauge value text.

### Choose history and display per metric

All history uses recorder **statistics**, with no raw history requests: hourly statistics except for daylight-filtered illuminance summaries up to 7 days, which use 5-minute statistics. Measurement sensors need `state_class: measurement` and recorder statistics enabled. `history_period` is an optional string: `today` (default), `24h`, `3d`, `7d`, `14d` or `30d` (example: `history_period: 7d`). `today` runs from midnight in Home Assistant's configured time zone to now, labelled **Today**; `24h` is a rolling window. `full_display` is an optional string, `summary` (default) or `graph` (example: `full_display: graph`).

`metrics` is an optional map keyed by measurement names, not entity IDs. Each metric accepts optional `icon` (string, built-in icon by default, example `mdi:thermometer-lines`), `problem_trigger` (string: `plant`, `out_of_range`, `low`, `high`, `never`; defaults from `problem_source`/`problem_sensors`; example `low`), `period` (same string choices as `history_period`, inherits it; example `14d`), and `display` (string: `summary` or `graph`, inherits `full_display`; example `graph`). Explicit problem triggers override global filtering and are independent of the plant monitor unless set to `plant`. Full-mode cumulative sensors use `days` instead of `period`: optional number, rounded and clamped to 1–30, default 7 (example `14`).

```yaml
type: custom:material-plant-card
entity: plant.orhideea
full_display: summary
metrics:
  dli:
    days: 14
    display: graph
  illuminance:
    daylight_offset: 45
  moisture:
    problem_trigger: low
  temperature:
    icon: mdi:thermometer-lines
```

Hover or touch/drag on a graph to see a point's time and value. The vertical hover guide spans the full graph height. The hover bubble stays visible while hovered; Escape dismisses it. Touching or hovering the graph does not highlight or activate the tile or open more-info; the rest of the tile opens more-info. Problem tiles also show a hover highlight outside the graph, and the plant name has a padded hover area. The line is green inside the ideal band and error red outside it. The minimum is a dot on the line with an upward triangle just below it, the maximum a dot with a downward triangle just above it; both are plotted points, so hovering shows their value. Sunrise/sunset icons sit in a band above the plot. Min/max markers turn red outside ideal bounds.

Graph vertical scales run from the lowest to the highest plotted value, with gridlines at the minimum, average (dashed) and maximum, labelled on a small left-side y-axis. Ideal bounds are not drawn as guide lines. Illuminance graphs with windows up to 3 days show golden-hour boundaries only when `daylight_only` is enabled: sunrise + offset and sunset − offset, using Home Assistant's configured location. Each has a sunrise/sunset icon above a dashed vertical line. Graph time labels use Home Assistant's configured time zone.

On every card render, the summary range bar's historical span (including the 24-hour span), current dot and average marker animate in. Graph lines draw from left to right, then min/max markers and the current ring appear. Reduced-motion users get no entry animation.

### Read daylight and DLI history

Illuminance has optional `metrics.illuminance.daylight_only` (boolean, default `true`, example `false`) and `daylight_offset` (number in minutes, rounded and clamped to 0–180, default 30, example 45). Home Assistant's latitude/longitude determine sunrise and sunset. The golden-hour filter counts readings from **sunrise + offset** to **sunset − offset**. The summary range viewer uses 5-minute statistics for windows up to 7 days, placing the cutoff within 5 minutes of the boundary; 14/30-day windows use whole hourly buckets inside the window. Labels read **Daylight · today** by default, or the selected period. The graph line is unfiltered and shows night readings; its min/max triangles use daylight values. A current reading outside the window is excluded from daylight statistics and markers, but remains on the graph line and follows problem settings rather than automatic out-of-range colouring. Disabling the filter includes all readings in statistics and hides golden-hour boundaries. Missing location coordinates fall back to unfiltered history and **Today** or **Last …** labels. The filter does not affect compact mode.

DLI and other cumulative sensors (`state_class: total` or `total_increasing`) use the maximum hourly recorded state per local day, with day boundaries in Home Assistant's configured time zone; for DLI, that is the day's total. **Today is included**, partial so far. `days: 1` shows **Today** and today's hourly graph; larger windows show **Daily max · N d** and one point per day. Summary statistics describe those daily maxima; the large value remains today's running total. Long-term statistics support 30 days when the data exists.

Historical colours follow ideal bounds independently of problem settings. Non-cumulative current values, rings and title icons turn red outside ideal bounds, except for daylight-filtered illuminance outside its window. DLI current values keep the problem-setting colour. Only selected problems add a faint red tint.

History refreshes every **10 minutes**. `hide_history` is an optional boolean, default `false` (example `hide_history: true`); enabling it disables fetching and hides history labels and summary statistics. Summary retains ideal ticks and the current ring; graph has no history line. Missing statistics show **—** in summary badges without a historical segment or average marker; current values and ideal ranges remain.

Compact-mode gauge tooltips use the Material plain style with two lines: `<Metric>[ · too low/high]` and `<value> <unit> · ideal <min>–<max> <unit>`. Show them with a touch long-press (about 0.45 s), mouse hover (0.5 s) or keyboard focus; Escape dismisses. A normal tap still opens sensor more-info; a long-press does not. With the default `problem_source: plant`, low illuminance at night can stay neutral when the integration does not flag a problem.

See the [README](https://github.com/lageorgem/ha-material-plant-card#readme) for installation and all options, the [full-options example](https://github.com/lageorgem/ha-material-plant-card/blob/master/examples/card.yaml), and [CHANGELOG.md](https://github.com/lageorgem/ha-material-plant-card/blob/master/CHANGELOG.md) for release history.

Independent implementation inspired by [Olen's flower-card](https://github.com/Olen/lovelace-flower-card), with no shared code. MIT licensed. Author: George Mihai.
