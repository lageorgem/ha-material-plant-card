# Material Plant Card

A [Home Assistant](https://www.home-assistant.io/) Lovelace plant card built for **Material 3 Expressive**, with full-mode summary or graph tiles, configurable history up to 30 days, compact circular gauges, plant problem summaries and a battery indicator. Requires [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant).

Designed to pair with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme), with Home Assistant theme fallbacks.

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/lageorgem/ha-material-plant-card?display_name=tag)](https://github.com/lageorgem/ha-material-plant-card/releases)
[![Downloads](https://img.shields.io/github/downloads/lageorgem/ha-material-plant-card/total)](https://github.com/lageorgem/ha-material-plant-card/releases)
[![Validate](https://github.com/lageorgem/ha-material-plant-card/actions/workflows/validate.yml/badge.svg)](https://github.com/lageorgem/ha-material-plant-card/actions/workflows/validate.yml)
[![Tests](https://github.com/lageorgem/ha-material-plant-card/actions/workflows/test.yml/badge.svg)](https://github.com/lageorgem/ha-material-plant-card/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/lageorgem/ha-material-plant-card/blob/master/LICENSE)

[![Open your Home Assistant instance and open this repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=lageorgem&repository=ha-material-plant-card&category=plugin)

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Eleven plants on a dark dashboard using Material Plant Card in compact mode" width="900">

## Table of contents

- [Highlights](#highlights)
- [Gallery](#gallery)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Card options](#card-options)
- [Choosing a display mode](#choosing-a-display-mode)
- [Reading full-mode tiles](#reading-full-mode-tiles)
- [Reading compact-mode gauges](#reading-compact-mode-gauges)
- [Choosing problem behaviour](#choosing-problem-behaviour)
- [Battery indicator](#battery-indicator)
- [Flower-card compatibility](#flower-card-compatibility)
- [Layout & responsiveness](#layout--responsiveness)
- [Theming](#theming)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Credits](#credits)
- [License](#license)

## Highlights

- Full mode (default, as in flower-card): grouped Material 3 Expressive metric tiles with large values and ideal ranges. Choose summary range bars with Min/Avg/Max badges or interactive threshold-coloured history graphs. History defaults to today, with rolling windows from 24 hours to 30 days; DLI shows daily maxima including today.
- Compact mode: circular gauges with centred icons and three zones: **too low / just right / too high**, a thick in-range band, thin outer zones, an active arc and a position dot.
- Success colour for in-range readings. Full-mode non-cumulative values, rings and title icons turn error red outside the ideal range, independently of problem settings, except for daylight-filtered illuminance outside its sun-based window; only selected problems add a faint red gradient tint. Compact gauges and cumulative current values keep the problem-setting colour.
- Plant photo in an M3 Expressive cookie shape, with a placeholder for missing or broken images and a red error circle with a centred **!** when problems exist.
- Name and species, or a problem summary such as **Moisture low · DLI low**.
- Optional iOS-style battery glyph with the level number inside; red below 10% by default, otherwise neutral.
- Width-aware, balanced gauge rows and two-line Material plain tooltips on long-press, hover or keyboard focus.
- Shared photo and species header in both modes; visual editor with an ordered **Metrics** list. Add, drag to reorder, edit or delete metrics, with each metric's icon, problem trigger, history window and display stored in its entry.
- Config-compatible with flower-card; migrate by changing the card type.

## Gallery

Full mode shows metric tiles with configurable history and DLI daily totals:

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/full-dark.png" alt="Busu in full mode: metric tiles with ideal ticks, historical ranges, average markers and Min/Avg/Max badges; humidity and DLI problems, with DLI daily totals" width="327">

Graph display replaces the summary scale and badges with interactive history:

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/graph-dark.png" alt="Full mode graphs: threshold-coloured history, min/max triangles and illuminance sunrise/sunset lines" width="327">

The dashboard above shows eleven plants in compact mode. This compact single-card view shows a plant needing attention:

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/card-problem-dark.png" alt="Compact plant card with a problem summary and alert badge on the photo" width="327">

In compact mode, long-press (or hover) a gauge for its tooltip with the metric, value and ideal range:

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/tooltip-dark.png" alt="Compact gauge tooltip showing Air humidity too high, 65.6 % with an ideal range of 20–60 %" width="327">

Copy the [full-options example](examples/card.yaml) or [migration example](examples/migrate-from-flower-card.yaml). Release history: [CHANGELOG.md](CHANGELOG.md).

## Installation

Requires **Home Assistant 2024.8.0 or newer** and [the plant monitor custom integration](https://github.com/Olen/homeassistant-plant). Set up a `plant.*` entity and its measurement sensors before adding the card.

### HACS (recommended)

[![Open your Home Assistant instance and open this repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=lageorgem&repository=ha-material-plant-card&category=plugin)

1. Click **Open in HACS**, or open **HACS → ⋮ → Custom repositories** and add `https://github.com/lageorgem/ha-material-plant-card` with category **Dashboard** (Lovelace).
2. Install **Material Plant Card**.
3. Reload your browser. HACS adds the dashboard resource automatically.

If it was not registered, add `/hacsfiles/ha-material-plant-card/material-plant-card.js` as a **JavaScript Module** under **Settings → Dashboards → ⋮ → Resources**.

### Manual

| Step | Action |
| --- | --- |
| 1 | Download `material-plant-card.js` from the [latest release](https://github.com/lageorgem/ha-material-plant-card/releases). |
| 2 | Copy it to `/config/www/`. |
| 3 | Add resource URL `/local/material-plant-card.js`, type **JavaScript Module**, under **Settings → Dashboards → ⋮ → Resources**. Reload your browser. |

For YAML-managed resources:

```yaml
lovelace:
  resources:
    - url: /local/material-plant-card.js
      type: module
```

## Quick start

Choose **Material Plant Card** in the dashboard's **Add card** picker and configure it visually, or paste into a manual card:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
```

Replace the entity ID with your own. Readings, units and min/max thresholds come from the plant integration; there is no need to configure each measurement sensor in the card. Set thresholds in the integration, not in this YAML. See the [full-options example](examples/card.yaml).

## Card options

Defaults apply when keys are omitted. Only `type` and `entity` are required; every other key is optional. Changes are listed in [CHANGELOG.md](CHANGELOG.md).

| Key | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `type` | string, required | None | Custom card type. | `custom:material-plant-card` |
| `entity` | string, required | None | Plant monitor entity; must start with `plant.`. | `plant.orhideea` |
| `name` | string, optional | Plant friendly name, then entity ID | Override the title; an empty string also falls back. | `Orchid` |
| `display_type` | `full` or `compact`, optional | `full` | Full shows grouped summary or graph tiles; compact shows circular gauges. Both use the same photo and species header. | `compact` |
| `gauges_per_row` | integer (1–12), optional | Automatic balanced rows | Compact only: fill rows left to right, centring the last row. Falls back to automatic layout when the requested row cannot fit the card width. | `3` |
| `gauge_size` | number (32–96 px), optional | `44` | Compact only: dial size in pixels; icon and value text scale with it. Values outside the range are clamped. | `56` |
| `metrics` | list of metric objects, optional | Entries for moisture, conductivity, temperature, illuminance, humidity and DLI, in that order | Select and configure measurements in display order; see [Per-metric settings](#per-metric-settings). First entry wins for duplicate types; `[]` hides all measurements. Takes precedence over `show_bars`. | `[{type: moisture}, {type: dli, display: graph}]` |
| `show_bars` | string list, optional | Default measurement order above | Flower-card compatibility: selects measurement types only when `metrics` is absent. Duplicates are removed; `[]` hides all measurements. The editor converts it to `metrics` on the first Metrics-list edit. | `[moisture, temperature, dli]` |
| `hide_species` | boolean, optional | `false` | Hide species in either mode; does not hide problem summaries. | `true` |
| `hide_image` | boolean, optional | `false` | Hide the photo/placeholder and its alert badge. | `true` |
| `hide_units` | boolean, optional | `false` in both modes | Full: hides units beside current values in summary and graph tiles and in graph hover bubbles, keeping the numbers. Compact: hides the **entire value text** below gauges. | `true` |
| `image` | string, optional | Plant `entity_picture` | Picture URL or path override. A missing or broken image displays a placeholder. | `/local/plants/orchid.jpg` |
| `battery_sensor` | string, optional | Unset; no indicator | Battery percentage sensor. Glyph is shown only if the entity exists. | `sensor.sh_5_battery` |
| `battery_warn_level` | number, optional | `10` | Battery levels below this threshold use the error colour; otherwise neutral. | `10` |
| `battery_ok_level` | number, optional | Unset; ignored (flower-card compatibility) | Accepted but has no effect; not shown in the visual editor. | `40` (legacy config) |
| `bars_per_row` | number, optional | Unset; ignored | Accepted for flower-card compatibility; does not control layout. | `6` |
| `show_care` | string list, optional | Unset; ignored | Accepted for compatibility; care information is not displayed. | `[watering]` |
| `extra_badges` | list of arbitrary values, optional | Unset; ignored | Accepted for compatibility; extra badges are not displayed. | `[]` |

### Supported measurement keys

Each metric entry's `type` (or legacy `show_bars`) uses measurement keys, not sensor entity IDs:

| Key | Label | Displayed by default |
| --- | --- | --- |
| `moisture` | Moisture | Yes |
| `conductivity` | Conductivity | Yes |
| `temperature` | Temperature | Yes |
| `illuminance` | Illuminance | Yes |
| `humidity` | Air humidity | Yes |
| `dli` | DLI | Yes |
| `dli_24h` | DLI (24h) | No |
| `co2` | CO₂ | No |
| `soil_temperature` | Soil temperature | No |
| `vpd` | VPD | No |

Only measurements supplied by the integration are displayed. A measurement is also skipped if its referenced sensor entity is missing.

### Per-metric settings

`metrics` is an ordered list, not a map. Each entry requires `type`; its other settings are optional and independent of other entries. List order is display order in both modes. Only listed, available measurements can raise measurement-specific problems.

| Key in each `metrics` entry | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `type` | string, required | None | Measurement key from the table above. | `moisture` |
| `icon` | string, optional | Built-in metric icon | Override the icon in both modes; an empty string falls back. | `mdi:thermometer-lines` |
| `problem_trigger` | string (`plant`, `out_of_range`, `low`, `high` or `never`), optional | `plant` | Both modes: follow this measurement's plant monitor problem, flag either bound, flag only low/high, or never flag. See [Choosing problem behaviour](#choosing-problem-behaviour). | `low` |
| `period` | string (`today`, `24h`, `3d`, `7d`, `14d` or `30d`), optional | `today` | Full-mode history window for non-cumulative measurements; `today` starts at midnight in Home Assistant's time zone. | `14d` |
| `days` | number, optional | `7` | Full-mode cumulative history, including DLI: rounded and clamped to 1–30 days; `1` means today only. | `14` |
| `display` | string (`summary` or `graph`), optional | `summary` | Full-mode tile presentation for this metric only. | `graph` |
| `daylight_only` | boolean, optional | `true` for illuminance | Illuminance only, full mode: apply the golden-hour filter to summary statistics and graph min/max markers, not the graph line or lux value. | `false` |
| `daylight_offset` | number, optional | `30` | Illuminance only: minutes excluded after sunrise and before sunset; rounded and clamped to 0–180. Used when daylight filtering is enabled. | `45` |

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
    daylight_only: true
    daylight_offset: 45
  - type: dli
    days: 14
    display: graph
```

### Configure metrics visually

The top fields select the plant, name, battery sensor and display type. Expand **Appearance** to hide species, image or units, override the picture, or set **Battery low below**.

When **Display type** is **Compact**, expand **Compact layout** to set **Gauges per row** and **Gauge size**. Leave Gauges per row empty for automatic balanced rows.

Under **Metrics**, choose **Add metric** from the menu of measurements not already added. Drag a row's handle to change display order, or focus the handle and use the up/down arrow keys. **Edit** opens that entry's icon, display and problem trigger, plus its history window (DLI uses days) and illuminance daylight settings. **Delete** removes the entry without confirmation. Only one entry is expanded at a time. The first list edit converts legacy `show_bars` to `metrics`; editing only the top fields does not.

Release history: [CHANGELOG.md](CHANGELOG.md).

## Choosing a display mode

`display_type: full` is the default, as in flower-card. It shows the header followed by a grouped list of metric tiles. Choose compact for a shorter card with circular gauges:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
display_type: compact
```

Both modes show the same photo size and species line unless `hide_image` or `hide_species` is enabled. Values and units are visible by default in both modes. See [Card options](#card-options) and the [examples](examples/card.yaml) for overrides.

## Reading full-mode tiles

The title row shows an icon, metric name and history label. Non-cumulative measurements use **Today** by default: midnight in Home Assistant's configured time zone to now. Set `period` in the metric entry to `today`, `24h`, `3d`, `7d`, `14d` or `30d`; `24h` is a rolling window labelled **Last 24 h**. Daylight-filtered illuminance shows **Daylight · today** by default (or the selected period). DLI shows **Today** or **Daily max · N d**. The left column shows the current value and unit, with **Ideal a–b** below it.

### Summary display

Each metric defaults to `display: summary`. A horizontal scale has ideal-bound ticks, a historical min–max segment coloured green inside the ideal range and error red outside it, a hollow current-value ring and an average triangle. **Min · Avg · Max** badges below the scale turn error red outside the ideal range. Historical colours follow ideal bounds independently of [problem settings](#choosing-problem-behaviour).

Non-cumulative current values, rings and title icons turn error red outside ideal bounds even without a selected problem. Their historical range includes the current value when it extends recorded bounds, unless daylight filtering excludes it. Cumulative current values such as DLI keep the problem-setting colour. Only selected problems add a faint red gradient tint; a red current value alone does not mean the tile is a problem.

### Graph display

Set `display: graph` in a metric entry; summary and graph tiles can coexist in one card. The right column becomes a history line: green inside the ideal band, error red outside. The minimum is a dot on the line with an upward triangle just below it; the maximum is a dot with a downward triangle just above it. Both are points of the plotted line, so hovering them shows their value. Today and 24-hour graphs plot 5-minute statistics; longer windows plot hourly values. Min/max markers turn red outside the ideal range; a ring marks the latest plotted value. There is no average marker or Min/Avg/Max row. The illuminance line is unfiltered, including night readings; with `daylight_only` enabled, its min/max triangles use daylight values only.

The vertical scale runs exactly from the lowest to the highest plotted value (linear, including lux). Three gridlines mark the minimum, the average (dashed) and the maximum, labelled on a small y-axis on the left; the average label is hidden when it would overlap the min or max label. Ideal bounds are not drawn as guide lines.

Illuminance graphs with history windows up to 3 days show golden-hour boundaries only when `daylight_only` is enabled: sunrise + `daylight_offset` and sunset − `daylight_offset`. Each boundary has a sunrise/sunset icon above a dashed vertical line, using Home Assistant's configured location. Graph time labels use Home Assistant's configured time zone.

Hover with a mouse, or touch and drag across the graph, to inspect a point's value and time. The vertical hover guide spans the full graph height. The hover bubble stays visible while hovered; **Escape** dismisses it. Touching or hovering the graph does **not** highlight or activate the tile or open more-info; tap the rest of the tile to open the sensor dialog. Problem tiles also show a hover highlight outside the graph; the plant name has a padded hover area.

The summary range bar's historical span (including the 24-hour span), current dot and average marker retain their entry animations. Graph lines draw from left to right when history first arrives, followed by the min/max markers and current ring; the animation waits for data rather than finishing during loading. Later data updates do not replay the graph entry animation. Reduced motion disables entry animations and motion transitions.

### Daylight-filtered illuminance

An entry with `type: illuminance` defaults to `daylight_only: true` and uses Home Assistant's configured latitude and longitude to compute sunrise and sunset. The golden-hour filter counts readings from **sunrise + offset** to **sunset − offset**. The default offset is 30 minutes at each end; set `daylight_offset: 45` in that entry to exclude 45 minutes instead. For windows up to 7 days, the summary range viewer uses Home Assistant's **5-minute statistics**, so the cutoff lands within 5 minutes of each boundary. For 14- and 30-day windows, it includes only whole hourly buckets inside the window. This is a sun-based filter, not a test of the lux value.

A current reading outside that window is excluded from summary statistics and daylight min/max markers, but remains visible on the unfiltered graph line. It is not automatically forced red: its value and title icon (and summary ring) follow the selected problem trigger instead. Set `daylight_only: false` in the illuminance entry to include all readings in statistics, hide golden-hour graph boundaries and restore automatic out-of-range current colouring. Without valid Home Assistant location coordinates, history is unfiltered and uses **Today** or the selected **Last …** label. Compact mode is unaffected by the daylight filter.

### History source and DLI

All history comes from Home Assistant **recorder statistics**, with no raw history requests. Non-cumulative measurements need recorder statistics and `state_class: measurement`; plant monitor measurement sensors provide that state class. History uses hourly statistics except for the daylight-filtered illuminance summary, which uses 5-minute statistics for windows up to 7 days. Minimum and maximum use the included buckets' extrema; the average is the mean of their means. Graph points use hourly means plus the current reading; the illuminance line includes readings outside the daylight window.

Cumulative sensors (`state_class: total` or `total_increasing`), including DLI, use the **maximum recorded value per local day**, taken from hourly states. Day boundaries use Home Assistant's configured time zone. For DLI this is the day's total. Set `days` in the DLI entry to 1–30 (default 7); cumulative history uses this instead of `period`. **Today is included**, with its partial total so far and the current reading. `days: 1` shows **Today** and graphs today's hourly readings; larger windows show **Daily max · N d** and one point per day. Summary Min/Avg/Max describe the daily maxima, while the large current value remains today's running total. Long-term statistics support 30-day windows when that data is available.

History is always fetched in full mode and refreshes every **10 minutes**. Missing statistics show **—** in summary badges without a historical segment or average marker; current values and ideal ranges remain. An eligible current reading can still appear in the graph.

`hide_units: true` hides units beside current values in summary and graph tiles and in graph hover bubbles, not the numbers. Release history: [CHANGELOG.md](CHANGELOG.md).

## Reading compact-mode gauges

Icons are centred on the dial. The thick middle band represents the plant's min/max range, including both boundaries. Thin bands on either side represent low and high readings. The coloured fill follows the track: thin in the too-low/too-high zones, thick in the just-right band, with the same gaps between zones. The active arc and dot show the current position; values beyond the gauge's visual extent are clamped at the ends.

When a gauge's value first appears, its active arc sweeps in and its position dot pops into place. Later value updates move the arc and dot smoothly without replaying the entry animation. The browser's reduced-motion preference disables both entry animations and movement transitions.

Illuminance uses a logarithmic scale when the unit is `lx` and the minimum is positive. Other readings use a linear scale. These are range indicators, not percentages of a universal sensor maximum.

| Colour / state | Meaning |
| --- | --- |
| Success | Reading is in range. Uses `--md-sys-color-success`, falling back to `--success-color`. |
| Neutral (on-surface-variant) | Reading is out of range but is not a selected problem. |
| Error | Reading is out of range and is a selected problem; value text below is also error-coloured and bold. |
| No active arc or dot | Value or valid min/max range is unavailable. |

Value text is rounded for space; large readings use `k` (for example, `30000` becomes `30k`). Only percentage and degree suffixes are shown below gauges; the tooltip and accessible label include the full unit and range. A non-numeric value displays `—` when value text is enabled. `hide_units: true` removes that text completely.

Each gauge has a Material plain tooltip with two lines:

1. `<Metric>[ · too low/high]` — the status suffix appears only for out-of-range readings.
2. `<value> <unit> · ideal <min>–<max> <unit>` — for example, `18 % · ideal 20–60 %`. Missing values show `—`; unavailable thresholds omit the ideal range.

Show it with a touch long-press (about 0.45 s), mouse hover (0.5 s) or keyboard focus. **Escape** dismisses it. A normal tap opens more-info for the sensor, or for the plant if no sensor is supplied; a long-press shows the tooltip without opening more-info. Tap the photo or name to open plant more-info; tap the battery glyph to open battery sensor more-info. No configurable hold or double-tap actions are provided.

## Choosing problem behaviour

Each metric's `problem_trigger` defaults to `plant`, following that measurement's integration problem. An illuminance reading may be low at night without being a problem: its compact gauge remains neutral rather than error-coloured. Only measurements selected by the Metrics list (or legacy `show_bars`) and available to display can raise measurement-specific problems.

Choose a trigger independently for each entry:

| Trigger | Behaviour |
| --- | --- |
| `plant` | Follow this metric's plant monitor problem. |
| `out_of_range` | Flag readings below the minimum or above the maximum. |
| `low` | Flag only readings below the minimum. |
| `high` | Flag only readings above the maximum. |
| `never` | Never raise a problem for this metric. |

All triggers except `plant` are independent of the monitor. Missing values or invalid ranges do not create range-based problems. For example, display temperature without allowing it to raise a problem:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
metrics:
  - type: moisture
    problem_trigger: low
  - type: temperature
    problem_trigger: never
  - type: dli
```

An empty `metrics: []` selects no measurements. If the integration reports `state: problem` without an array-valued `problems` attribute and no selected metric raises a problem, the header still falls back to **Needs attention**. That generic plant-level fallback is not a measurement-specific problem and cannot be suppressed with a metric trigger.

Problems replace species in the subtitle and add a red error circle with a centred **!** to the photo. Hiding species does not hide problems.

## Battery indicator

Set `battery_sensor` to a sensor reporting a numeric percentage. The indicator is a bare iOS-style battery glyph with the level number inside, without an enclosing container. With the default `battery_warn_level: 10`:

| Level | Tone |
| --- | --- |
| Below 10% | Red, error colour |
| 10% or higher | Neutral (on-surface-variant) |
| Unknown or non-numeric | Neutral outline colour with `?` inside |

The displayed percentage is rounded and clamped to 0–100. Choose `battery_warn_level` between 0 and 100. `battery_ok_level` is accepted but ignored for flower-card compatibility and is no longer in the visual editor. Battery tones do not create plant problems or an alert badge.

## Flower-card compatibility

Configuration keys from [Olen's flower-card](https://github.com/Olen/lovelace-flower-card) work with this card. Migration requires only changing:

```yaml
type: custom:flower-card
```

to:

```yaml
type: custom:material-plant-card
```

Keep the remaining flower-card configuration. `show_bars` works when `metrics` is absent, selecting types with default settings. On the first Metrics-list edit, the visual editor writes an ordered `metrics` list and removes `show_bars`. You can also convert each measurement yourself to an entry such as `{type: moisture}`; see the [before/after example](examples/migrate-from-flower-card.yaml). All settings now live in their metric entries, and summary and graph tiles can be mixed.

`battery_ok_level`, `bars_per_row`, `show_care` and `extra_badges` are accepted and ignored: there is no OK battery threshold, no care panels or extra badges. Use `gauges_per_row`, not `bars_per_row`, to control compact rows. Full remains the default display mode; choose `display_type: compact` for circular gauges. `hide_units` hides units beside full-mode current values and in graph hover bubbles, and complete gauge value text in compact mode. An omitted `battery_warn_level` defaults to 10%.

This is an independent implementation inspired by flower-card; no code is shared.

## Layout & responsiveness

The compact card footprint is approximately **327 × 160 px** at 327 px width with six gauges, versus flower-card's **327 × 203 px**. Full-mode tiles are approximately **84 px** tall; a six-metric full card is approximately **327 × 614 px**. These are measured examples, not fixed heights: measurement count, available width and content affect sizing.

In compact mode, the card measures its width to decide how many gauges fit a row. With `gauges_per_row` omitted, it balances them across rows, with the extra gauge on the first row and the last row centred. For two-row layouts: five gauges split **3/2**, six **3/3**, and seven **4/3**. At the default 44 px gauge size and 327 px card width, six gauges fit one row. Full mode uses one metric tile per row. `bars_per_row` is ignored in both modes.

To choose a compact layout, set optional integer `gauges_per_row` to 1–12 and optional number `gauge_size` to 32–96 px (default 44). Icons and value text scale with the dial. Requested rows fill left to right in metric order, with the last row centred; if the card is too narrow, it falls back to automatic balanced rows.

```yaml
type: custom:material-plant-card
entity: plant.orhideea
display_type: compact
gauges_per_row: 3
gauge_size: 56
```

This gives six available metrics two rows of three, where width permits. Remove `gauges_per_row` to restore automatic balancing. These settings do not affect full mode. Release history: [CHANGELOG.md](CHANGELOG.md).

## Theming

Use [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme) or another Material You theme built with `material-you-utilities` for the intended look. The card reads `--md-sys-color-*` tokens and falls back to Home Assistant theme variables. It follows the dashboard's theme; no per-card `theme` option is implemented. Gauge motion is disabled when the browser requests reduced motion.

## Troubleshooting

| Symptom | Cause and next step |
| --- | --- |
| Custom element does not exist | Check the JavaScript Module resource URL in [Installation](#installation), then reload the browser. |
| `Specify a plant entity` | `entity` is missing or does not start with `plant.`. Select a plant monitor entity. |
| `Entity not available: plant.…` | The configured entity is absent from Home Assistant. Confirm its ID and that the integration is loaded. |
| No gauges or a missing gauge | The integration has not supplied that measurement, or its sensor entity is absent. Check the plant's sensor setup and the entry's `type` in `metrics` (or legacy `show_bars`). Metadata may be empty while the integration starts. |
| Gauge has no active indicator | Check that the sensor value and min/max thresholds are numeric and that minimum is below maximum. |
| Out-of-range gauge is not red | Default problem behaviour follows the integration's triggers. Check the metric's `problem_trigger`, or set it to `out_of_range` to flag either bound independently of the integration. |
| Values disappear in compact display | Check for `hide_units: true`; set it to `false` to restore value text (the default in both modes). |
| Full tiles have no history range or line | Check recorder statistics for the sensor and the entry's `period` or `days`. Measurement sensors need `state_class: measurement`; DLI needs recorded hourly states. Daylight-filtered illuminance summaries use 5-minute statistics up to 7 days and whole hourly buckets for 14/30 days; check for data inside the sun-based window and valid Home Assistant location coordinates. Its graph line includes night readings. DLI includes today's partial total; longer windows require existing statistics. Current values still display. |
| No battery indicator | Set `battery_sensor` and confirm that entity exists. Battery is not auto-detected. |
| Photo shows a placeholder | Check `image` or the plant's `entity_picture` and whether the browser can load it. |

## Development

Requires **Node.js 22+**.

| Command | Description |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile. |
| `npm run build` | Bundle to `dist/material-plant-card.js`. |
| `npm run test` | Run browser-based tests. |
| `npm run lint` | Run ESLint on TypeScript source. |
| `npm run typecheck` | Run TypeScript checking without emitting files. |
| `npm run deploy` | Build and deploy to Home Assistant using Downloader. |

### Local deployment

Set up Home Assistant's **Downloader integration** first. Supply `HA_URL` (an **HTTPS** Home Assistant origin) and `HA_TOKEN` (a long-lived access token) through environment variables or a private `~/.config/ha-material-plant/env` file containing `KEY=value` lines. Never commit that file or include tokens in dashboard YAML.

```sh
npm ci
npm run build
npm run test
npm run lint
npm run typecheck
# After configuring private HA_URL and HA_TOKEN:
npm run deploy
```

The deploy script temporarily serves the bundle from the development machine. Home Assistant must reach that machine on port **8799**, or the port configured with `DEPLOY_PORT`. Set `LAN_HOST` to override automatic LAN address detection if needed.

Each deployment downloads the bundle to a new, uniquely named file (never overwriting an existing one) and registers it as a dashboard resource only after its **SHA-256 is verified** over HTTPS. Plain-HTTP `HA_URL` values are refused unless `HA_ALLOW_INSECURE=1` is set. Reload the dashboard after deployment. Release history: [CHANGELOG.md](CHANGELOG.md).

## Credits

Built by **George Mihai** for [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Inspired by the configuration and plant-monitoring workflow of [Olen's flower-card](https://github.com/Olen/lovelace-flower-card). This is a clean-room, independent implementation with no shared code.

## License

[MIT](https://github.com/lageorgem/ha-material-plant-card/blob/master/LICENSE). Copyright © 2026 George Mihai. Release history: [CHANGELOG.md](CHANGELOG.md).
