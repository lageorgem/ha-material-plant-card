# Material Plant Card

Material 3 Expressive plant monitoring for Home Assistant, using [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Pairs with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme), with Home Assistant theme fallbacks.

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Material Plant Card in full summary, full graph and compact modes on a dark Material You dashboard" width="760">

- Full metric tiles with summary range bars and Min/Avg/Max badges, or interactive threshold-coloured graphs. Mix displays per metric.
- Compact circular gauges with balanced rows, configurable size and long-press or hover tooltips. Approximately **327 × 160 px** with six gauges, versus flower-card's **327 × 203 px**.
- Ordered metric configuration: icons, history windows, independent problem triggers and illuminance daylight filtering.
- Recorder statistics in Home Assistant's time zone; 5-minute graph points for today/24h, DLI daily maxima over 1–30 days, and sunrise/sunset boundary markers from Home Assistant's location.
- Plant photo, species or problem subtitle, alert badge and problem tint. Optional iOS-style battery glyph, red below the warning level (default 10%).
- Visual editor for adding, reordering and configuring metrics. Entry animations respect reduced motion.
- Flower-card migration by changing the card type. Shared keys remain supported; legacy care, extra-badge and bar-layout settings are accepted but ignored.

Requires **Home Assistant 2024.8.0+** and the plant monitor custom integration. Install through HACS or add the JavaScript Module resource manually, then add:

```yaml
type: custom:material-plant-card
entity: plant.monstera
```

Replace the entity ID with your own. Readings and ideal ranges come from the plant integration. Full tiles are the default; set optional `display_type` (string: `full` or `compact`, default `full`) to `compact` for gauges.

To mix summary and graph tiles, use the optional ordered `metrics` list. Each entry requires a string `type` measurement key, such as `moisture`. Optional `display` (string: `summary` or `graph`, default `summary`) chooses its tile style. Optional `period` (string: `today`, `24h`, `3d`, `7d`, `14d`, `30d`, default `today`) selects non-cumulative history; DLI uses optional `days` (number, rounded and clamped to 1–30, default 7) instead.

```yaml
type: custom:material-plant-card
entity: plant.monstera
metrics:
  - {type: moisture, display: graph, period: 24h}
  - type: temperature
  - {type: illuminance, display: graph}
  - {type: dli, days: 14}
```

Hover or touch/drag on a graph to inspect time and value without opening more-info. Illuminance defaults to daylight-filtered statistics with a 30-minute offset after sunrise and before sunset; its graph line still includes night readings. DLI includes today's partial total. History needs available recorder statistics; current readings remain visible without them.

See the [README](https://github.com/lageorgem/ha-material-plant-card#readme) for installation, all options and screenshot configurations, the [migration guide](https://github.com/lageorgem/ha-material-plant-card#flower-card-compatibility), and the [changelog](https://github.com/lageorgem/ha-material-plant-card/blob/master/CHANGELOG.md) for release history.

Independent clean-room implementation inspired by [Olen's flower-card](https://github.com/Olen/lovelace-flower-card), with no shared code. MIT licensed. Author: George Mihai.
