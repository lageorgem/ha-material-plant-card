# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.1] - 2026-10-15

### Fixed

- Narrow full-mode rows (below 268px) hide "Ideal" and centre the Min/Avg/Max chips instead of overflowing the tile. The ideal range stays in each tile's spoken label.
- Sections-view minimum widths: full mode defaults to 12 columns with a 9-column minimum; compact mode defaults to 6 with a 6-column minimum.
- Narrow cards (below 224px) stack the header so plant names stay readable: photo and battery on the first row, name and subtitle below. Keyboard focus follows the visual order.
- Error-container colours fall back to a blend of the theme's error colour with the card surface, so problem chips and tiles stay legible on non-Material light and dark themes. Material You themes keep their own colours.
- The min–max range pill stays inside the track at either end, and a metric whose min, max and current value coincide shows only the value ring.

## [0.1.0] - 2026-10-13

First public release.

### Added

- Material 3 Expressive plant monitoring for Olen's plant monitor integration, with Material You theme tokens and Home Assistant fallbacks.
- Full-mode summary tiles with ideal ticks, threshold-coloured historical spans, current rings, average markers and Min/Avg/Max badges.
- Interactive history graphs with observed-value scales, min/avg/max gridlines, threshold-coloured lines and hover or touch-scrub inspection. Today and 24-hour non-cumulative graphs use 5-minute statistics.
- Per-metric icons, summary/graph displays, history windows and independent problem triggers in an ordered configuration list.
- Recorder-statistics history in Home Assistant's time zone, with windows up to 30 days, DLI daily maxima including today, and daylight-filtered illuminance with configurable golden-hour offsets and sunrise/sunset graph markers.
- Compact circular range gauges with automatic balanced rows, configurable row counts and gauge sizes, and long-press, hover or keyboard-focus tooltips.
- Plant photos with image fallbacks, species or problem subtitles, alert badges, problem-tinted tiles and an optional iOS-style battery indicator.
- Visual configuration editor with metric add, reorder, edit and delete controls; data-ready entry animations and reduced-motion support.
- Flower-card-compatible shared configuration keys, legacy `show_bars` migration, and accepted-but-ignored care, extra-badge, battery-OK and bar-layout settings.
- HACS and manual installation guides, screenshot configurations, full-options and migration examples, and local Home Assistant deployment with SHA-256 verification.

See the [configuration reference](README.md#card-options) and [migration guide](README.md#flower-card-compatibility).

[0.1.1]: https://github.com/lageorgem/ha-material-plant-card/releases/tag/v0.1.1
[0.1.0]: https://github.com/lageorgem/ha-material-plant-card/releases/tag/v0.1.0
