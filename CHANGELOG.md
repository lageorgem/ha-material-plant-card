# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-10-12

First public release.

### Added

- Material 3 Expressive plant card for Olen's plant monitor integration, with circular three-zone range gauges, a thick in-range band, thin low/high zones, active arcs and position dots.
- Primary, advisory/tertiary and problem/error gauge tones; logarithmic illuminance scaling for lux readings with positive minimum thresholds.
- Support for moisture, conductivity, temperature, illuminance, humidity, DLI, 24-hour DLI, CO₂, soil temperature and VPD measurements supplied by the integration.
- Cookie-shaped plant photos with configurable image override and a missing/broken-image placeholder; plant name, species or problem summary, and a photo alert badge.
- Integration-driven problems by default, optional out-of-range gauge problems, and measurement filtering through `problem_sensors`.
- Optional battery percentage chip with configurable warning and OK thresholds, plus sensor and plant more-info interactions.
- Full and compact layouts, configurable gauge order and visibility, and `hide_units` to hide complete gauge value text.
- Home Assistant visual configuration form with Gauges, Problems and Appearance sections.
- Material You theme tokens with Home Assistant theme fallbacks and reduced-motion support.
- Flower-card-compatible configuration keys, with `bars_per_row`, `show_care` and `extra_badges` accepted and ignored; independent implementation with no shared code.
- HACS/manual installation documentation, full-options and migration YAML examples, and content-addressed local deployment with SHA-256 verification before resource registration.

[0.1.0]: https://github.com/lageorgem/ha-material-plant-card/releases/tag/v0.1.0
