import { DEFAULT_GAUGES, MEASUREMENT_KEYS, MEASUREMENT_LABELS } from './types';

interface SelectOption {
  value: string;
  label: string;
}

/** Minimal HA form contract; no runtime dependency on Home Assistant. */
export interface HaFormSchema {
  name: string;
  required?: boolean;
  type?: 'expandable' | 'grid';
  title?: string;
  icon?: string;
  flatten?: boolean;
  schema?: HaFormSchema[];
  selector?: {
    entity?: { domain: string; device_class?: string };
    text?: Record<string, never>;
    boolean?: Record<string, never>;
    select?: {
      multiple?: boolean;
      reorder?: boolean;
      mode: 'dropdown' | 'list';
      options: SelectOption[];
    };
    number?: {
      min: number;
      max: number;
      step: number;
      mode: 'box';
      unit_of_measurement: string;
    };
  };
}

const measurementOptions = (): SelectOption[] => MEASUREMENT_KEYS.map((value) => ({
  value,
  label: MEASUREMENT_LABELS[value],
}));

const batteryLevel = (name: string): HaFormSchema => ({
  name,
  selector: {
    number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' },
  },
});

const labels: Readonly<Record<string, string>> = {
  entity: 'Plant entity',
  name: 'Name',
  battery_sensor: 'Battery sensor',
  display_type: 'Display type',
  show_bars: 'Gauges',
  hide_units: 'Hide units',
  hide_history: 'Hide history',
  history_period: 'History window',
  illuminance_daytime_only: 'Ignore darkness in illuminance history',
  problem_source: 'Problem source',
  problem_sensors: 'Problem sensors',
  hide_species: 'Hide species',
  hide_image: 'Hide image',
  image: 'Image',
  battery_warn_level: 'Battery low below',
};

const helpers: Readonly<Record<string, string>> = {
  hide_units: 'Hides units next to values.',
  hide_history: 'Full mode only: hides the history range, average and Min/Avg/Max.',
  history_period: 'Full mode. DLI is a daily total, so it always shows daily totals for the last 7 days.',
  illuminance_daytime_only: 'Full mode: excludes 0 lx (night) readings from the illuminance range, average and Min/Avg/Max. On by default.',
  show_bars: `Default: ${DEFAULT_GAUGES.map((key) => MEASUREMENT_LABELS[key]).join(', ')}.`,
  problem_source: "Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",
  problem_sensors: 'Leave empty to allow every sensor.',
  image: 'Overrides the plant picture.',
  battery_warn_level: 'Battery turns red below this level (default 10%).',
};

const schema: HaFormSchema[] = [
  { name: 'entity', required: true, selector: { entity: { domain: 'plant' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'battery_sensor', selector: { entity: { domain: 'sensor', device_class: 'battery' } } },
  { name: 'display_type', selector: { select: {
    mode: 'dropdown',
    options: [
      { value: 'full', label: 'Full (metric tiles)' },
      { value: 'compact', label: 'Compact (gauges)' },
    ],
  } } },
  {
    type: 'expandable', name: '', title: 'Metrics', icon: 'mdi:gauge', flatten: true,
    schema: [
      { name: 'show_bars', selector: { select: {
        multiple: true, reorder: true, mode: 'list', options: measurementOptions(),
      } } },
      { name: 'hide_units', selector: { boolean: {} } },
      { name: 'hide_history', selector: { boolean: {} } },
      { name: 'illuminance_daytime_only', selector: { boolean: {} } },
      { name: 'history_period', selector: { select: {
        mode: 'dropdown',
        options: [
          { value: '24h', label: 'Last 24 hours' },
          { value: '7d', label: 'Last 7 days' },
        ],
      } } },
    ],
  },
  {
    type: 'expandable', name: '', title: 'Problems', icon: 'mdi:alert-circle-outline', flatten: true,
    schema: [
      { name: 'problem_source', selector: { select: {
        mode: 'dropdown',
        options: [
          { value: 'plant', label: 'Plant monitor (integration problem triggers)' },
          { value: 'gauges', label: 'Gauges (any out-of-range value)' },
        ],
      } } },
      { name: 'problem_sensors', selector: { select: {
        multiple: true, mode: 'list', options: measurementOptions(),
      } } },
    ],
  },
  {
    type: 'expandable', name: '', title: 'Appearance', icon: 'mdi:palette-outline', flatten: true,
    schema: [
      { name: 'hide_species', selector: { boolean: {} } },
      { name: 'hide_image', selector: { boolean: {} } },
      { name: 'image', selector: { text: {} } },
      batteryLevel('battery_warn_level'),
    ],
  },
];

export const configForm = {
  schema,
  computeLabel: (field: HaFormSchema): string | undefined =>
    Object.prototype.hasOwnProperty.call(labels, field.name) ? labels[field.name] : undefined,
  computeHelper: (field: HaFormSchema): string | undefined =>
    Object.prototype.hasOwnProperty.call(helpers, field.name) ? helpers[field.name] : undefined,
  assertConfig: (config: { entity?: unknown }): void => {
    if (config.entity != null &&
      (typeof config.entity !== 'string' || !config.entity.startsWith('plant.'))) {
      throw new Error('Specify a plant entity');
    }
  },
};
