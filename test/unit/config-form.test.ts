import { expect } from '@open-wc/testing';
import { configForm, type HaFormSchema } from '../../src/config-form';
import { DEFAULT_GAUGES, DEFAULT_ICONS, MEASUREMENT_KEYS, MEASUREMENT_LABELS } from '../../src/types';

function flatten(schema: readonly HaFormSchema[]): HaFormSchema[] {
  return schema.flatMap((item) => item.schema ? flatten(item.schema) : [item]);
}

describe('configForm', () => {
  const fields = () => flatten(configForm.schema);
  const globalFields = () => flatten(configForm.schema.filter((item) => item.name !== 'metrics'));
  const metricSections = () => configForm.schema.find((item) => item.name === 'metrics')?.schema ?? [];
  const field = (name: string) => {
    const result = fields().find((item) => item.name === name);
    if (!result) throw new Error(`Missing field: ${name}`);
    return result;
  };
  const measurementOptions = () => MEASUREMENT_KEYS.map((value) => ({
    value,
    label: MEASUREMENT_LABELS[value],
  }));

  it('exposes every editable config key exactly once, excluding compatibility keys', () => {
    expect(globalFields().map((item) => item.name).sort()).to.deep.equal([
      'entity', 'name', 'display_type', 'show_bars', 'hide_species', 'hide_image',
      'hide_units', 'hide_history', 'image', 'battery_sensor', 'battery_warn_level',
      'problem_source', 'problem_sensors', 'history_period', 'full_display',
    ].sort());
  });

  it('restricts entity selectors to plants and battery sensors', () => {
    expect(field('entity').required).to.equal(true);
    expect(field('entity').selector).to.deep.equal({ entity: { domain: 'plant' } });
    expect(field('battery_sensor').selector).to.deep.equal({
      entity: { domain: 'sensor', device_class: 'battery' },
    });
  });

  it('offers ordered measurement choices and a multi-select problem filter', () => {
    expect(field('show_bars').selector).to.deep.equal({
      select: { multiple: true, reorder: true, mode: 'list', options: measurementOptions() },
    });
    expect(field('problem_sensors').selector).to.deep.equal({
      select: { multiple: true, mode: 'list', options: measurementOptions() },
    });
  });

  it('groups flat config values in expandable sections with one battery threshold', () => {
    const sections = configForm.schema.filter((item) => item.type === 'expandable' && item.flatten);
    expect(sections.map(({ name, title, icon, flatten: flat }) => ({ name, title, icon, flat })))
      .to.deep.equal([
        { name: '', title: 'Metrics', icon: 'mdi:gauge', flat: true },
        { name: '', title: 'Problems', icon: 'mdi:alert-circle-outline', flat: true },
        { name: '', title: 'Appearance', icon: 'mdi:palette-outline', flat: true },
      ]);
    expect(sections[2].schema?.find((item) => item.name === 'battery_warn_level'))
      .to.equal(field('battery_warn_level'));
    expect(sections[0].schema?.find((item) => item.name === 'hide_history'))
      .to.equal(field('hide_history'));
    expect(sections[0].schema?.find((item) => item.name === 'history_period'))
      .to.equal(field('history_period'));
    expect(sections[0].schema?.find((item) => item.name === 'full_display'))
      .to.equal(field('full_display'));
    expect(field('battery_warn_level').selector).to.deep.equal({
      number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' },
    });
    expect(fields().some((item) => item.name === 'battery_ok_level')).to.equal(false);
  });

  it('uses text, boolean and display/problem mode selectors', () => {
    for (const name of ['name', 'image']) {
      expect(field(name).selector).to.deep.equal({ text: {} });
    }
    for (const name of ['hide_units', 'hide_history', 'hide_species', 'hide_image']) {
      expect(field(name).selector).to.deep.equal({ boolean: {} });
    }
    expect(field('display_type').selector).to.deep.equal({ select: {
      mode: 'dropdown', options: [
        { value: 'full', label: 'Full (metric tiles)' },
        { value: 'compact', label: 'Compact (gauges)' },
      ],
    } });
    expect(field('problem_source').selector).to.deep.equal({ select: {
      mode: 'dropdown', options: [
        { value: 'plant', label: 'Plant monitor (integration problem triggers)' },
        { value: 'gauges', label: 'Gauges (any out-of-range value)' },
      ],
    } });
    expect(field('history_period').selector).to.deep.equal({ select: {
      mode: 'dropdown', options: [
        { value: 'today', label: 'Today' },
        { value: '24h', label: 'Last 24 hours' },
        { value: '3d', label: 'Last 3 days' },
        { value: '7d', label: 'Last 7 days' },
        { value: '14d', label: 'Last 14 days' },
        { value: '30d', label: 'Last 30 days' },
      ],
    } });
  });

  it('labels every field and leaves unknown names to HA', () => {
    for (const item of fields()) {
      expect(configForm.computeLabel(item)).to.be.a('string').and.not.equal('');
    }
    expect(configForm.computeLabel({ name: 'unknown' })).to.equal(undefined);
    expect(configForm.computeLabel(field('show_bars'))).to.equal('Gauges');
    expect(configForm.computeLabel(field('hide_history'))).to.equal('Hide history');
    expect(configForm.computeLabel(field('history_period'))).to.equal('Default history window');
    expect(configForm.computeLabel(field('full_display'))).to.equal('Full mode display');
    expect(configForm.computeLabel(field('problem_sensors'))).to.equal('Problem sensors');
    expect(configForm.computeLabel(field('battery_warn_level'))).to.equal('Battery low below');
  });

  it('explains problem filtering, picture overrides and default gauges', () => {
    expect(configForm.computeHelper(field('problem_source'))).to.equal(
      "Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",
    );
    expect(configForm.computeHelper(field('problem_sensors'))).to.equal('Leave empty to allow every sensor.');
    expect(configForm.computeHelper(field('image'))).to.equal('Overrides the plant picture.');
    expect(configForm.computeHelper(field('hide_units'))).to.equal('Hides units next to values.');
    expect(configForm.computeHelper(field('hide_history'))).to.equal(
      'Full mode only: hides the history range, average and Min/Avg/Max.',
    );
    expect(configForm.computeHelper(field('history_period'))).to.equal(
      'Default full-mode history window; each metric can override it. DLI uses its Days setting.',
    );
    expect(configForm.computeHelper(field('battery_warn_level'))).to.equal(
      'Battery turns red below this level (default 10%).',
    );
    expect(configForm.computeHelper(field('show_bars'))).to.equal(
      `Default: ${DEFAULT_GAUGES.map((key) => MEASUREMENT_LABELS[key]).join(', ')}.`,
    );
    expect(configForm.computeHelper({ name: 'unknown' })).to.equal(undefined);
  });

  it('nests settings under metrics and each measurement key without flattening', () => {
    const metrics = configForm.schema.find((item) => item.name === 'metrics');
    expect(metrics).to.include({ type: 'expandable', title: 'Per-metric settings', icon: 'mdi:tune-variant' });
    expect(metrics?.flatten).not.to.equal(true);
    expect(metricSections().map((item) => item.name)).to.deep.equal(MEASUREMENT_KEYS);
    for (const key of MEASUREMENT_KEYS) {
      const section = metricSections().find((item) => item.name === key)!;
      expect(section).to.include({ type: 'expandable', title: MEASUREMENT_LABELS[key], icon: DEFAULT_ICONS[key] });
      expect(section.flatten).not.to.equal(true);
      expect(section.schema?.map((item) => item.name).sort()).to.deep.equal([
        'icon', 'problem_trigger', 'display', key === 'dli' ? 'days' : 'period',
        ...(key === 'illuminance' ? ['daylight_only', 'daylight_offset'] : []),
      ].sort());
      expect(section.schema?.find((item) => item.name === 'icon')?.selector).to.deep.equal({ icon: {} });
      expect(section.schema?.find((item) => item.name === 'problem_trigger')?.selector).to.deep.equal({ select: {
        mode: 'dropdown', options: [
          { value: 'plant', label: 'Follow plant monitor' },
          { value: 'out_of_range', label: 'Outside ideal range' },
          { value: 'low', label: 'Too low only' },
          { value: 'high', label: 'Too high only' },
          { value: 'never', label: 'Never' },
        ],
      } });
      expect(section.schema?.find((item) => item.name === 'display')?.selector)
        .to.deep.equal(field('full_display').selector);
      if (key !== 'dli') {
        expect(section.schema?.find((item) => item.name === 'period')?.selector)
          .to.deep.equal(field('history_period').selector);
      }
    }
    expect(field('full_display').selector).to.deep.equal({ select: {
      mode: 'dropdown', options: [
        { value: 'summary', label: 'Summary' }, { value: 'graph', label: 'Graph' },
      ],
    } });
    expect(field('days').selector).to.deep.equal({ number: {
      min: 1, max: 30, step: 1, mode: 'slider', unit_of_measurement: 'days',
    } });
    expect(field('daylight_only').selector).to.deep.equal({ boolean: {} });
    expect(field('daylight_offset').selector).to.deep.equal({ number: {
      min: 0, max: 180, step: 5, mode: 'box', unit_of_measurement: 'min',
    } });
  });

  it('labels and explains v5 settings without the removed daylight key', () => {
    for (const [name, label] of Object.entries({
      icon: 'Icon', problem_trigger: 'Problem trigger', display: 'Display',
      days: 'Days (1 = today)', period: 'History window',
      daylight_only: 'Daylight only (sunrise/sunset)',
      daylight_offset: 'Ignore after sunrise / before sunset',
    })) {
      expect(configForm.computeLabel(field(name))).to.equal(label);
    }
    for (const [name, helper] of Object.entries({
      problem_trigger: 'Independent of the plant monitor unless set to Follow plant monitor.',
      days: 'DLI uses the maximum value of each day.',
      daylight_offset: 'Minutes after sunrise and before sunset to ignore (default 30).',
      full_display: 'Summary shows the range and Min/Avg/Max; Graph shows the history line. Each metric can override it.',
    })) {
      expect(configForm.computeHelper(field(name))).to.equal(helper);
    }
    expect(fields().some((item) => item.name === 'illuminance_daytime_only')).to.equal(false);
    expect(configForm.computeLabel({ name: 'illuminance_daytime_only' })).to.equal(undefined);
    expect(configForm.computeHelper({ name: 'illuminance_daytime_only' })).to.equal(undefined);
  });

  it('allows an unfinished form or plant entity, rejecting set non-plant values', () => {
    for (const config of [{}, { entity: undefined }, { entity: null }, { entity: 'plant.orhideea' }]) {
      expect(() => configForm.assertConfig(config)).not.to.throw();
    }
    for (const entity of ['sensor.moisture', 'Plant.orhideea', 'plant', '', 42, false]) {
      expect(() => configForm.assertConfig({ entity })).to.throw(Error, 'Specify a plant entity');
    }
  });
});
