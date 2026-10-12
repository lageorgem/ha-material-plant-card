# Material Plant Card

Material 3 Expressive plant monitoring for Home Assistant, using [Olen's plant monitor integration](https://github.com/Olen/homeassistant-plant). Pairs with [Material Thermostat Card](https://github.com/lageorgem/ha-material-thermostat-card), [Material Purifier Card](https://github.com/lageorgem/ha-material-purifier-card) and [Nerwyn's Material You theme](https://github.com/Nerwyn/material-you-theme).

<img src="https://raw.githubusercontent.com/lageorgem/ha-material-plant-card/master/assets/hero-dark.png" alt="Eleven plants on a dark dashboard using Material Plant Card" width="900">

- Circular gauges with low, just-right and high zones, an active arc and a position dot; logarithmic illuminance scaling for positive lux thresholds.
- Primary colour in range, tertiary for advisory readings and error colour for problems.
- Cookie-shaped plant photo, missing-image placeholder, species or problem summary, and an alert badge when attention is needed.
- Optional battery percentage chip with configurable warning and OK thresholds.
- Integration-driven problems by default, or opt-in problems from out-of-range gauges.
- Full and compact displays, with a visual editor for Gauges, Problems and Appearance.
- Flower-card-compatible configuration: change only the card type. `bars_per_row`, `show_care` and `extra_badges` are accepted but ignored.

Requires **Home Assistant 2024.8.0+** and the plant monitor custom integration. Install through HACS or add the JavaScript Module resource manually, then add:

```yaml
type: custom:material-plant-card
entity: plant.orhideea
```

Replace the entity ID with your own. Sensor readings and ranges come from the integration. Tap gauges for sensor more-info, or the photo/name for plant more-info. Compact display hides species and gauge value text by default; `hide_units: false` restores values.

See the [README](https://github.com/lageorgem/ha-material-plant-card#readme) for installation and all options, the [full-options example](https://github.com/lageorgem/ha-material-plant-card/blob/master/examples/card.yaml), and [CHANGELOG.md](https://github.com/lageorgem/ha-material-plant-card/blob/master/CHANGELOG.md) for release history.

Independent implementation inspired by [Olen's flower-card](https://github.com/Olen/lovelace-flower-card), with no shared code. MIT licensed. Author: George Mihai.
