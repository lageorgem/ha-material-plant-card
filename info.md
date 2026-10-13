# Material Plant Card

Material 3 Expressive plant monitoring for Home Assistant, using [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Pairs with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme).

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Eleven plants on a dark dashboard using Material Plant Card in compact mode" width="900">

- Full mode (default, as in flower-card): grouped Material 3 Expressive metric tiles with an icon, name and history label above a large current value and **Ideal a–b**. Summary display shows ideal-bound ticks, a threshold-coloured min–max segment, a current-value ring, an average triangle and **Min · Avg · Max** badges. Graph display shows a threshold-coloured history line, min, average (dashed) and max gridlines labelled on a small left-side y-axis, min/max triangles and a latest-value ring, with no average marker or statistics row.
- Compact mode: circular gauges with icons centred on the dial, low, just-right and high zones, an active arc and a position dot; coloured fill follows the track's thin outer zones, thick just-right band and gaps. Logarithmic illuminance scaling for positive lux thresholds applies in both modes.
- Success colour in range (`--md-sys-color-success`, falling back to `--success-color`). Compact gauges use neutral on-surface-variant for out-of-range readings without a problem, and error colour for problems with bold, error-coloured value text.
- Cookie-shaped plant photo, missing-image placeholder, species or problem summary, and a red error circle with a centred **!** when attention is needed.
- Optional bare iOS-style battery glyph with the level number inside; red below `battery_warn_level` (default **10%**), otherwise neutral. `battery_ok_level` is accepted but ignored for flower-card compatibility and is not in the visual editor.
- Integration-driven problems by default, or opt-in range-based problems. Per-metric triggers can follow the plant monitor, flag either bound, flag only low/high, or never flag.
- Both modes share the photo size and species header. The visual editor has top fields for plant, name, battery and display type, plus **Appearance** for hiding species/image/units, overriding the picture and setting the battery low level. Its **Metrics** list supports **Add metric** (types not already added), drag-to-reorder, **Edit** and **Delete**. Each entry's form has icon, display, problem trigger, history window (days for DLI), and daylight settings for illuminance.
- Compact has width-aware balanced gauge rows: when two rows are needed, five split 3/2, six 3/3 and seven 4/3, with the last row centred. Its six-gauge footprint is approximately **327 × 160 px** at 327 px width, versus flower-card's **327 × 203 px**. Full-mode tiles are approximately **84 px** tall; a six-metric full card is approximately **327 × 614 px**.
- Flower-card-compatible configuration: change only the card type. `bars_per_row`, `show_care` and `extra_badges` are accepted but ignored.

### Arrange compact gauges

With `display_type: compact`, the visual editor shows **Compact layout**. Optional integer `gauges_per_row` (1–12, example `3`) fills rows left to right in metric order and centres the last row. Omit it for automatic balanced rows; the card also falls back to automatic layout when the requested row is too wide. Optional number `gauge_size` (32–96 px, default `44`, example `56`) sets the dial size, with icon and value text scaling to match; out-of-range sizes are clamped. These options do not affect full mode. Flower-card's `bars_per_row` remains ignored.

```yaml
type: custom:material-plant-card
entity: plant.orhideea
display_type: compact
gauges_per_row: 3
gauge_size: 56
```

Requires **Home Assistant 2024.8.0+** and the plant monitor custom integration. Install through HACS or add the JavaScript Module resource manually, then add:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
```

Replace the entity ID with your own. Sensor readings and ranges come from the integration. Tap tiles or gauges for sensor more-info, or the photo/name for plant more-info. Set `display_type: compact` for gauges instead of the default full-mode tiles. `hide_units` (optional boolean, default `false`, example `true`) hides units beside full-mode current values and in graph hover bubbles, but hides complete compact gauge value text.

### Choose history and display per metric

`metrics` is an optional ordered list of objects; order is display order. Each entry requires a string `type` measurement key (example `moisture`), not a sensor entity ID. Omitted lists use moisture, conductivity, temperature, illuminance, humidity and DLI; `[]` hides all metrics. Duplicate types keep the first entry. Legacy flower-card `show_bars` selects types only when `metrics` is absent; the first Metrics-list edit converts it to `metrics`.

Each entry accepts optional `icon` (string, default metric icon, example `mdi:thermometer-lines`), `problem_trigger` (string: `plant`, `out_of_range`, `low`, `high`, `never`; default `plant`, example `low`), `period` (string: `today`, `24h`, `3d`, `7d`, `14d`, `30d`; default `today`, example `14d`), and `display` (string: `summary` or `graph`; default `summary`, example `graph`). Only listed, available metrics can raise measurement-specific problems. Triggers are independent of the plant monitor unless set to `plant`; `never` suppresses that metric's problems. A plant in problem state without an array-valued problems attribute can still show the generic **Needs attention** fallback.

All history uses recorder **statistics**, with no raw history requests. Measurement sensors need `state_class: measurement` and recorder statistics enabled. `today` runs from midnight in Home Assistant's configured time zone to now; other periods are rolling windows. Full-mode cumulative sensors use `days` instead of `period`: optional number, rounded and clamped to 1–30, default 7 (example `14`).

```yaml
type: custom:material-plant-card
entity: plant.orhideea
metrics:
  - type: moisture
    problem_trigger: low
  - type: temperature
    icon: mdi:thermometer-lines
    display: graph
    period: 24h
  - type: illuminance
    daylight_offset: 45
  - type: dli
    days: 14
    display: graph
```

Hover or touch/drag on a graph to see a point's time and value. The vertical hover guide spans the full graph height. The hover bubble stays visible while hovered; Escape dismisses it. Touching or hovering the graph does not highlight or activate the tile or open more-info; the rest of the tile opens more-info. Problem tiles also show a hover highlight outside the graph, and the plant name has a padded hover area. The line is green inside the ideal band and error red outside it. The minimum is a dot on the line with an upward triangle just below it, the maximum a dot with a downward triangle just above it; both are plotted points, so hovering shows their value. Sunrise/sunset icons sit in a band above the plot. Min/max markers turn red outside ideal bounds.

Graph vertical scales run from the lowest to the highest plotted value, with gridlines at the minimum, average (dashed) and maximum, labelled on a small left-side y-axis. Ideal bounds are not drawn as guide lines. Illuminance graphs with windows up to 3 days show golden-hour boundaries only when `daylight_only` is enabled: sunrise + offset and sunset − offset, using Home Assistant's configured location. Each has a sunrise/sunset icon above a dashed vertical line. Graph time labels use Home Assistant's configured time zone.

Compact gauges sweep in their active arc and pop the dot when a value first appears. Subsequent value updates move smoothly without replaying the entry animation. Graph lines draw left to right when history first arrives, then min/max markers and the current ring appear; entry motion waits for data instead of finishing during loading and does not replay on later updates. Summary range bars retain their historical-span, current-dot and average-marker entry animations. Reduced motion disables these animations and movement transitions.

### Read daylight and DLI history

An entry with `type: illuminance` accepts optional `daylight_only` (boolean, default `true`, example `false`) and `daylight_offset` (number in minutes, rounded and clamped to 0–180, default 30, example 45). Home Assistant's latitude/longitude determine sunrise and sunset. The golden-hour filter counts readings from **sunrise + offset** to **sunset − offset**. The summary range viewer uses 5-minute statistics for windows up to 7 days, placing the cutoff within 5 minutes of the boundary; 14/30-day windows use whole hourly buckets inside the window. Labels read **Daylight · today** by default, or the selected period. The graph line is unfiltered and shows night readings; its min/max triangles use daylight values. A current reading outside the window is excluded from daylight statistics and markers, but remains on the graph line and follows problem settings rather than automatic out-of-range colouring. Disabling the filter includes all readings in statistics and hides golden-hour boundaries. Missing location coordinates fall back to unfiltered history and **Today** or **Last …** labels. The filter does not affect compact mode.

DLI and other cumulative sensors (`state_class: total` or `total_increasing`) use the maximum hourly recorded state per local day, with day boundaries in Home Assistant's configured time zone; for DLI, that is the day's total. **Today is included**, partial so far. `days: 1` shows **Today** and today's hourly graph; larger windows show **Daily max · N d** and one point per day. Summary statistics describe those daily maxima; the large value remains today's running total. Long-term statistics support 30 days when the data exists.

Historical colours follow ideal bounds independently of problem settings. Non-cumulative current values, rings and title icons turn red outside ideal bounds, except for daylight-filtered illuminance outside its window. DLI current values keep the problem-setting colour. Only selected problems add a faint red tint.

History is always fetched in full mode and refreshes every **10 minutes**. Missing statistics show **—** in summary badges without a historical segment or average marker; current values and ideal ranges remain.

Compact-mode gauge tooltips use the Material plain style with two lines: `<Metric>[ · too low/high]` and `<value> <unit> · ideal <min>–<max> <unit>`. Show them with a touch long-press (about 0.45 s), mouse hover (0.5 s) or keyboard focus; Escape dismisses. A normal tap still opens sensor more-info; a long-press does not. With the default `problem_trigger: plant`, low illuminance at night can stay neutral when the integration does not flag a problem.

See the [README](https://github.com/lageorgem/ha-material-plant-card#readme) for installation and all options, the [full-options example](https://github.com/lageorgem/ha-material-plant-card/blob/master/examples/card.yaml), and [CHANGELOG.md](https://github.com/lageorgem/ha-material-plant-card/blob/master/CHANGELOG.md) for release history.

Independent implementation inspired by [Olen's flower-card](https://github.com/Olen/lovelace-flower-card), with no shared code. MIT licensed. Author: George Mihai.
