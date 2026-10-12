# Material Plant Card

A [Home Assistant](https://www.home-assistant.io/) Lovelace plant card built for **Material 3 Expressive**, with full-mode metric tiles and 24-hour or 7-day history or compact circular gauges, plant problem summaries and a battery indicator. Requires [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant).

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

- Full mode (default, as in flower-card): a header and grouped Material 3 Expressive metric tiles with small tone-coloured icons, large values with units, ideal-bound ticks, a coloured 24-hour or 7-day range, average marker and Min/Avg/Max badges. Cumulative sensors such as DLI show daily totals for the last 7 complete days.
- Compact mode: circular gauges with centred icons and three zones: **too low / just right / too high**, a thick in-range band, thin outer zones, an active arc and a position dot.
- Success colour for in-range readings. Full-mode non-cumulative values, rings and title icons turn error red outside the ideal range, independently of problem settings, except for 0 lx with daytime-only illuminance enabled; only real problems add a faint red gradient tint. Compact gauges and cumulative current values keep the problem-setting colour.
- Plant photo in an M3 Expressive cookie shape, with a placeholder for missing or broken images and a red error circle with a centred **!** when problems exist.
- Name and species, or a problem summary such as **Moisture low · DLI low**.
- Optional iOS-style battery glyph with the level number inside; red below 10% by default, otherwise neutral.
- Width-aware, balanced gauge rows and two-line Material plain tooltips on long-press, hover or keyboard focus.
- Shared photo and species header in both modes; visual editor with **Metrics**, **Problems** and **Appearance** sections.
- Config-compatible with flower-card; migrate by changing the card type.

## Gallery

Full mode shows metric tiles with configurable history and DLI daily totals:

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/full-dark.png" alt="Busu in full mode: metric tiles with ideal ticks, historical ranges, average markers and Min/Avg/Max badges; humidity and DLI problems, with DLI daily totals" width="327">

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
| `display_type` | `full` or `compact`, optional | `full` | Full shows grouped metric tiles with range bars and history; compact shows circular gauges. Both use the same photo and species header. | `compact` |
| `show_bars` | string list, optional | `[moisture, conductivity, temperature, illuminance, humidity, dli]` | Measurements to display, in order, as tiles or gauges. Duplicates are removed; `[]` hides all measurements. | `[moisture, temperature, dli]` |
| `hide_species` | boolean, optional | `false` | Hide species in either mode; does not hide problem summaries. | `true` |
| `hide_image` | boolean, optional | `false` | Hide the photo/placeholder and its alert badge. | `true` |
| `hide_units` | boolean, optional | `false` in both modes | Full: hides the unit next to each value, keeping the number. Compact: hides the **entire value text** below gauges. | `true` |
| `history_period` | string (`24h` or `7d`), optional | `24h` | Full only: window for the historical range, average and Min/Avg/Max. Cumulative sensors always use daily totals for the last 7 complete days. Editor: Metrics → History window. | `7d` |
| `illuminance_daytime_only` | boolean, optional | `true` | Full only: excludes 0 lx (night) readings from illuminance history using raw history and a time-weighted daylight average. Set `false` for the previous behaviour. Editor: Metrics → Ignore darkness in illuminance history. | `true` |
| `hide_history` | boolean, optional | `false` | Full only: disables history fetching; removes the history label, the scale's min–max segment and average marker, and the Min/Avg/Max row. Keeps current values, ideal ranges, ticks and current-value rings. | `true` |
| `image` | string, optional | Plant `entity_picture` | Picture URL or path override. A missing or broken image displays a placeholder. | `/local/plants/orchid.jpg` |
| `battery_sensor` | string, optional | Unset; no indicator | Battery percentage sensor. Glyph is shown only if the entity exists. | `sensor.sh_5_battery` |
| `battery_warn_level` | number, optional | `10` | Battery levels below this threshold use the error colour; otherwise neutral. | `10` |
| `battery_ok_level` | number, optional | Unset; ignored (flower-card compatibility) | Accepted but has no effect; not shown in the visual editor. | `40` (legacy config) |
| `problem_source` | `plant` or `gauges`, optional | `plant` | Follow integration problems or flag displayed out-of-range gauges. | `gauges` |
| `problem_sensors` | string list, optional | All measurements | Measurement keys allowed to raise a problem; omitted or `[]` allows all. | `[moisture, dli]` |
| `bars_per_row` | number, optional | Unset; ignored | Accepted for flower-card compatibility; does not control layout. | `6` |
| `show_care` | string list, optional | Unset; ignored | Accepted for compatibility; care information is not displayed. | `[watering]` |
| `extra_badges` | list of arbitrary values, optional | Unset; ignored | Accepted for compatibility; extra badges are not displayed. | `[]` |

### Supported measurement keys

`show_bars` and `problem_sensors` use measurement keys, not sensor entity IDs:

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

## Choosing a display mode

`display_type: full` is the default, as in flower-card. It shows the header followed by a grouped list of metric tiles. Choose compact for a shorter card with circular gauges:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
display_type: compact
```

Both modes show the same photo size and species line unless `hide_image` or `hide_species` is enabled. Values and units are visible by default in both modes. See [Card options](#card-options) and the [examples](examples/card.yaml) for overrides.

## Reading full-mode tiles

The title row has a small tone-coloured icon and metric name, with **Last 24 h** (default) or **Last 7 d** on the right. Set `history_period: 7d`, or choose **Metrics → History window** in the editor, to change the window for the range, average and Min/Avg/Max. Daytime-only illuminance shows **Daytime · 24 h** or **Daytime · 7 d**; cumulative sensors show **Daily · 7 d** instead. A large current value with its unit sits on the left, with **Ideal a–b** below it.

On the right, a horizontal scale has tick marks at the ideal bounds. The historical minimum-to-maximum segment is success-coloured inside the ideal range and error-coloured outside it. A hollow ring marks the current value. For non-cumulative sensors, an out-of-range current value, ring and title icon turn error red even when [problem settings](#choosing-problem-behaviour) do not flag a problem, except for 0 lx with daytime-only illuminance enabled. Cumulative current values such as DLI (today's running total) keep the problem-setting colour. A triangle under the scale marks the historical average, success-coloured within the ideal range and error-coloured outside it. Historical colours reflect the ideal bounds independently of problem settings. For non-cumulative sensors, the historical range includes the current reading if it extends beyond the recorded range, except for 0 lx in daytime-only illuminance mode.

Below the scale, **Min · Avg · Max** values each get an error badge when outside the ideal range. Missing history shows **—** for those values. Only real problems selected by the problem settings add a faint red gradient tint; a red current value alone does not mean the tile is a problem.

By default, illuminance history ignores 0 lx (night) readings: the range and **Min · Avg · Max** use positive readings, and the average is time-weighted over daylight. “Daytime” means readings above 0 lx, not a sunrise/sunset schedule. This uses Home Assistant's raw history because recorder hourly statistics cannot exclude darkness. Keep the illuminance sensor in recorder history for the selected window. In one live 24-hour example, minimum/average changed from **0/458 lx** to **12/893 lx**. A current reading of 0 lx is not added to the range; its value, ring and title icon keep the problem-setting colour rather than automatically turning error red. With the default `problem_source: plant`, they turn red only if the plant monitor flags a selected problem.

Set `illuminance_daytime_only: false`, or disable **Metrics → Ignore darkness in illuminance history**, to restore the previous behaviour: include darkness in recorder statistics and the current range, and automatically colour out-of-range current illuminance red. The option is an optional boolean, defaults to `true`, and affects full mode only.

Other non-cumulative history (and illuminance with daytime-only disabled) comes from Home Assistant's recorder long-term statistics, using hourly minimum, maximum and mean data for the selected 24-hour or 7-day window. Those measurement sensors need `state_class: measurement` and recorder statistics enabled; plant monitor measurement sensors provide that state class.

Cumulative sensors (`state_class: total` or `total_increasing`), including the plant monitor's DLI, instead use daily totals for the **last 7 complete days**, regardless of `history_period`. Today's partial total is excluded from history. The segment and **Min · Avg · Max** summarise those daily totals, while the large current value remains today's running total. This replaces the previous DLI **—** history display.

Unavailable history (or no positive illuminance history) shows **—** with no historical segment or average marker, without hiding the current value or ideal range. History refreshes every **10 minutes**. `hide_history: true` disables fetching and removes the history label (**Last 24 h**, **Last 7 d**, **Daytime · 24 h**, **Daytime · 7 d** or **Daily · 7 d**), historical segment, average marker and Min/Avg/Max row; the scale, ideal ticks and current-value ring remain.

Tap a tile to open sensor more-info. `hide_units: true` hides only the unit next to the tile's value, not the number. Range position uses the same scaling as [compact gauges](#reading-compact-mode-gauges), including logarithmic lux scaling.

## Reading compact-mode gauges

Icons are centred on the dial. The thick middle band represents the plant's min/max range, including both boundaries. Thin bands on either side represent low and high readings. The coloured fill follows the track: thin in the too-low/too-high zones, thick in the just-right band, with the same gaps between zones. The active arc and dot show the current position; values beyond the gauge's visual extent are clamped at the ends.

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

**`problem_source: plant` (default)** follows the integration's per-sensor problem triggers. An illuminance reading may be low at night without being a problem: its gauge remains neutral (on-surface-variant) rather than error-coloured. Integration problems can appear in the header even when their gauges are not displayed.

**`problem_source: gauges`** flags any displayed gauge whose value is below its minimum or above its maximum. Missing values or invalid ranges do not raise gauge problems. `show_bars` therefore limits the measurements considered in this mode.

Use `problem_sensors` to limit eligible measurements in either mode:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
problem_source: plant
problem_sensors: [moisture, dli]
```

An omitted or empty list allows all measurements. If the integration reports `state: problem` without a structured `problems` list, the header falls back to **Needs attention**; that generic fallback cannot be filtered by measurement key.

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

Keep the remaining configuration. `battery_ok_level`, `bars_per_row`, `show_care` and `extra_badges` are accepted and ignored: there is no OK battery threshold, no care panels or extra badges, and gauge layout is automatic. You can remove these ignored keys, as shown in the [before/after example](examples/migrate-from-flower-card.yaml). Full remains the default display mode; choose `display_type: compact` for circular gauges. `hide_units` hides only units in full mode and complete gauge value text in compact mode. An omitted `battery_warn_level` defaults to 10%.

This is an independent implementation inspired by flower-card; no code is shared.

## Layout & responsiveness

The compact card footprint is approximately **327 × 160 px** at 327 px width with six gauges, versus flower-card's **327 × 203 px**. Full-mode tiles are approximately **84 px** tall; a six-metric full card is approximately **327 × 614 px**. These are measured examples, not fixed heights: measurement count, available width and content affect sizing.

In compact mode, the card measures its width to decide how many gauges fit a row. If they do not fit one row, it balances them across rows, with the extra gauge on the first row and the last row centred. For two-row layouts: five gauges split **3/2**, six **3/3**, and seven **4/3**. At 327 px width, six gauges fit one row. Full mode uses one metric tile per row. `bars_per_row` is ignored in both modes.

## Theming

Use [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme) or another Material You theme built with `material-you-utilities` for the intended look. The card reads `--md-sys-color-*` tokens and falls back to Home Assistant theme variables. It follows the dashboard's theme; no per-card `theme` option is implemented. Gauge motion is disabled when the browser requests reduced motion.

## Troubleshooting

| Symptom | Cause and next step |
| --- | --- |
| Custom element does not exist | Check the JavaScript Module resource URL in [Installation](#installation), then reload the browser. |
| `Specify a plant entity` | `entity` is missing or does not start with `plant.`. Select a plant monitor entity. |
| `Entity not available: plant.…` | The configured entity is absent from Home Assistant. Confirm its ID and that the integration is loaded. |
| No gauges or a missing gauge | The integration has not supplied that measurement, or its sensor entity is absent. Check the plant's sensor setup and `show_bars`. Metadata may be empty while the integration starts. |
| Gauge has no active indicator | Check that the sensor value and min/max thresholds are numeric and that minimum is below maximum. |
| Out-of-range gauge is not red | Default problem behaviour follows the integration's triggers. Check those triggers and `problem_sensors`, or use `problem_source: gauges`. |
| Values disappear in compact display | Check for `hide_units: true`; set it to `false` to restore value text (the default in both modes). |
| Full tiles have no history range | Set `hide_history: false`. Daytime-only illuminance needs recorded raw history with positive readings for the selected `history_period`; other measurement sensors need recorder statistics. Cumulative sensors such as DLI need completed daily totals and exclude today's partial total. Current values still display. |
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
