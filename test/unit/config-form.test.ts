import { expect } from '@open-wc/testing';
import { configForm, type HaFormSchema } from '../../src/config-form';
import { DEFAULT_GAUGES, MEASUREMENT_KEYS, MEASUREMENT_LABELS } from '../../src/types';

function flatten(schema: readonly HaFormSchema[]): HaFormSchema[] {
  return schema.flatMap((item) => item.schema ? flatten(item.schema) : [item]);
}

describe('configForm', () => {
  const fields = () => flatten(configForm.schema);
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
    expect(fields().map((item) => item.name).sort()).to.deep.equal([
      'entity', 'name', 'display_type', 'show_bars', 'hide_species', 'hide_image',
      'hide_units', 'image', 'battery_sensor', 'battery_warn_level',
      'problem_source', 'problem_sensors',
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
    const sections = configForm.schema.filter((item) => item.type === 'expandable');
    expect(sections.map(({ name, title, icon, flatten: flat }) => ({ name, title, icon, flat })))
      .to.deep.equal([
        { name: '', title: 'Gauges', icon: 'mdi:gauge', flat: true },
        { name: '', title: 'Problems', icon: 'mdi:alert-circle-outline', flat: true },
        { name: '', title: 'Appearance', icon: 'mdi:palette-outline', flat: true },
      ]);
    expect(sections[2].schema?.find((item) => item.name === 'battery_warn_level'))
      .to.equal(field('battery_warn_level'));
    expect(field('battery_warn_level').selector).to.deep.equal({
      number: { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' },
    });
    expect(fields().some((item) => item.name === 'battery_ok_level')).to.equal(false);
  });

  it('uses text, boolean and display/problem mode selectors', () => {
    for (const name of ['name', 'image']) {
      expect(field(name).selector).to.deep.equal({ text: {} });
    }
    for (const name of ['hide_units', 'hide_species', 'hide_image']) {
      expect(field(name).selector).to.deep.equal({ boolean: {} });
    }
    expect(field('display_type').selector).to.deep.equal({ select: {
      mode: 'dropdown', options: [{ value: 'full', label: 'Full' }, { value: 'compact', label: 'Compact' }],
    } });
    expect(field('problem_source').selector).to.deep.equal({ select: {
      mode: 'dropdown', options: [
        { value: 'plant', label: 'Plant monitor (integration problem triggers)' },
        { value: 'gauges', label: 'Gauges (any out-of-range value)' },
      ],
    } });
  });

  it('labels every field and leaves unknown names to HA', () => {
    for (const item of fields()) {
      expect(configForm.computeLabel(item)).to.be.a('string').and.not.equal('');
    }
    expect(configForm.computeLabel({ name: 'unknown' })).to.equal(undefined);
    expect(configForm.computeLabel(field('show_bars'))).to.equal('Gauges');
    expect(configForm.computeLabel(field('problem_sensors'))).to.equal('Problem sensors');
    expect(configForm.computeLabel(field('battery_warn_level'))).to.equal('Battery low below');
  });

  it('explains problem filtering, picture overrides and default gauges', () => {
    expect(configForm.computeHelper(field('problem_source'))).to.equal(
      "Plant monitor follows the integration's problem triggers; Gauges flags any out-of-range value.",
    );
    expect(configForm.computeHelper(field('problem_sensors'))).to.equal('Leave empty to allow every sensor.');
    expect(configForm.computeHelper(field('image'))).to.equal('Overrides the plant picture.');
    expect(configForm.computeHelper(field('battery_warn_level'))).to.equal(
      'Battery turns red below this level (default 10%).',
    );
    expect(configForm.computeHelper(field('show_bars'))).to.equal(
      `Default: ${DEFAULT_GAUGES.map((key) => MEASUREMENT_LABELS[key]).join(', ')}.`,
    );
    expect(configForm.computeHelper({ name: 'unknown' })).to.equal(undefined);
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
