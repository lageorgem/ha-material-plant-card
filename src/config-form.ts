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
  problem_source: 'Problem source',
  problem_sensors: 'Problem sensors',
  hide_species: 'Hide species',
  hide_image: 'Hide image',
  image: 'Image',
  battery_warn_level: 'Battery warning below',
  battery_ok_level: 'Battery OK from',
};

const helpers: Readonly<Record<string, string>> = {
  show_bars: `Default: ${DEFAULT_GAUGES.map((key) => MEASUREMENT_LABELS[key]).join(', ')}.`,
  problem_source: "Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",
  problem_sensors: 'Leave empty to allow every sensor.',
  image: 'Overrides the plant picture.',
};

const schema: HaFormSchema[] = [
  { name: 'entity', required: true, selector: { entity: { domain: 'plant' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'battery_sensor', selector: { entity: { domain: 'sensor', device_class: 'battery' } } },
  { name: 'display_type', selector: { select: {
    mode: 'dropdown',
    options: [{ value: 'full', label: 'Full' }, { value: 'compact', label: 'Compact' }],
  } } },
  {
    type: 'expandable', name: '', title: 'Gauges', icon: 'mdi:gauge', flatten: true,
    schema: [
      { name: 'show_bars', selector: { select: {
        multiple: true, reorder: true, mode: 'list', options: measurementOptions(),
      } } },
      { name: 'hide_units', selector: { boolean: {} } },
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
      { type: 'grid', name: '', schema: [
        batteryLevel('battery_warn_level'), batteryLevel('battery_ok_level'),
      ] },
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
