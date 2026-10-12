import { expect } from '@open-wc/testing';
import {
  activeProblems, batteryInfo, buildMeasurements, describeMeasurement, formatValue,
  gaugeFraction, gaugeStatus, toneFor, toNumber,
} from '../../src/calc/measurements';
import { DEFAULT_GAUGES, DEFAULT_ICONS, MEASUREMENT_KEYS, MEASUREMENT_LABELS } from '../../src/types';
import type { Measurement, PlantInfo, Problem } from '../../src/types';

const measurement = (overrides: Partial<Measurement> = {}): Measurement => ({
  key: 'moisture', label: 'Moisture', icon: 'mdi:water', unit: '%',
  value: 13, min: 15, max: 65, status: 'low', fraction: 0.176, ...overrides,
});

describe('measurement constants', () => {
  it('exports the exact keys, defaults, labels, and icons', () => {
    expect(MEASUREMENT_KEYS).to.deep.equal([
      'moisture', 'conductivity', 'temperature', 'illuminance', 'humidity',
      'dli', 'dli_24h', 'co2', 'soil_temperature', 'vpd',
    ]);
    expect(DEFAULT_GAUGES).to.deep.equal(MEASUREMENT_KEYS.slice(0, 6));
    expect(MEASUREMENT_KEYS.map(key => MEASUREMENT_LABELS[key])).to.deep.equal([
      'Moisture', 'Conductivity', 'Temperature', 'Illuminance', 'Air humidity',
      'DLI', 'DLI (24h)', 'CO₂', 'Soil temperature', 'VPD',
    ]);
    expect(MEASUREMENT_KEYS.map(key => DEFAULT_ICONS[key])).to.deep.equal([
      'mdi:water', 'mdi:spa-outline', 'mdi:thermometer', 'mdi:brightness-6',
      'mdi:water-percent', 'mdi:counter', 'mdi:counter', 'mdi:molecule-co2',
      'mdi:thermometer-probe', 'mdi:water-thermometer-outline',
    ]);
  });
});

describe('numeric measurements', () => {
  it('accepts only finite numbers and non-empty numeric strings', () => {
    for (const [input, result] of [[0, 0], [-2.5, -2.5], [' 7.2 ', 7.2], ['14.4', 14.4], ['0', 0], ['1e2', 100]] as const) {
      expect(toNumber(input)).to.equal(result);
    }
    for (const input of [null, undefined, '', '  ', 'unknown', 'unavailable', NaN, Infinity, -Infinity, 'Infinity', 'NaN', '12px', true, false, [], {}]) {
      expect(toNumber(input), String(input)).to.equal(null);
    }
  });

  it('classifies inclusive bounds and rejects missing or inverted bounds', () => {
    for (const [value, status] of [[14, 'low'], [15, 'ok'], [40, 'ok'], [65, 'ok'], [66, 'high']] as const) {
      expect(gaugeStatus(value, 15, 65)).to.equal(status);
    }
    for (const [value, min, max] of [[null, 15, 65], [20, null, 65], [20, 15, null], [20, 20, 20], [20, 30, 10]] as const) {
      expect(gaugeStatus(value, min, max)).to.equal('unknown');
      expect(gaugeFraction(value, min, max, '%')).to.equal(null);
    }
  });

  it('maps linear values into zones and clamps the arc', () => {
    for (const [value, expected] of [[-100, 0], [0, 0.2], [50, 0.5], [100, 0.8], [200, 1]]) {
      expect(gaugeFraction(value, 0, 100, '%')).to.be.closeTo(expected, 1e-12);
    }
  });

  it('uses natural-log scaling only for lx with positive minimum', () => {
    for (const [value, expected] of [[2000, 0.2], [30000, 0.8], [22, 0], [Math.sqrt(2000 * 30000), 0.5], [0, 0], [-1, 0], [1e9, 1]]) {
      expect(gaugeFraction(value, 2000, 30000, 'lx')).to.be.closeTo(expected, 1e-12);
    }
    expect(gaugeFraction(50, 0, 100, 'lx')).to.equal(0.5);
    expect(gaugeFraction(16000, 2000, 30000, 'LX')).to.equal(0.5);
  });
});

describe('buildMeasurements', () => {
  it('preserves requested order, deduplicates, and skips absent keys and missing sensors', () => {
    const info: PlantInfo = {
      moisture: { current: 13, min: 15, max: 65 },
      temperature: { current: 20, sensor: 'sensor.missing' },
      dli: { current: 10.8, min: '7.2', max: '14.4' },
    };
    const result = buildMeasurements(info, ['dli', 'absent', 'temperature', 'moisture', 'dli'], {});
    expect(result.map(m => m.key)).to.deep.equal(['dli', 'moisture']);
    expect(result[0]).to.include({ min: 7.2, max: 14.4, value: 10.8, status: 'ok' });
    expect(result[0].fraction).to.be.closeTo(0.5, 1e-12);
    expect(buildMeasurements(undefined, ['moisture'], {})).to.deep.equal([]);
    expect(buildMeasurements({}, ['moisture'], {})).to.deep.equal([]);
    expect(buildMeasurements(info, [], {})).to.deep.equal([]);
  });

  it('prefers live state even when invalid, and falls back to current only without a sensor', () => {
    const info: PlantInfo = { moisture: { sensor: 'sensor.m', current: 99, min: 0, max: 100 } };
    for (const [state, value, status] of [['24', 24, 'ok'], ['unknown', null, 'unknown'], ['unavailable', null, 'unknown'], ['', null, 'unknown']] as const) {
      expect(buildMeasurements(info, ['moisture'], { 'sensor.m': { state, attributes: {} } })[0]).to.include({ value, status, sensor: 'sensor.m' });
    }
    expect(buildMeasurements({ moisture: { current: '13' } }, ['moisture'], {})[0].value).to.equal(13);
    expect(buildMeasurements({ moisture: {} }, ['moisture'], {})[0].value).to.equal(null);
  });

  it('uses nullish unit precedence, icon fallbacks, and known or prettified labels', () => {
    for (const [liveUnit, expected] of [['°F', '°F'], ['', ''], [null, '°C'], [undefined, '°C']] as const) {
      const result = buildMeasurements({ temperature: { sensor: 'sensor.t', unit_of_measurement: '°C', icon: 'mdi:custom' } }, ['temperature'], {
        'sensor.t': { state: '20', attributes: { unit_of_measurement: liveUnit } },
      });
      expect(result[0]).to.include({ unit: expected, icon: 'mdi:custom', label: 'Temperature' });
    }
    for (const icon of [undefined, null, '']) {
      expect(buildMeasurements({ moisture: { icon } }, ['moisture'], {})[0].icon).to.equal('mdi:water');
    }
    expect(buildMeasurements({ custom_key: {} }, ['custom_key'], {})[0]).to.include({
      unit: '', icon: 'mdi:help-circle-outline', label: 'Custom key',
    });
    expect(buildMeasurements({ soil_temperature: { unit_of_measurement: null } }, ['soil_temperature'], {})[0].unit).to.equal('');
  });
});

describe('measurement presentation', () => {
  it('formats every contract example and magnitude boundary', () => {
    for (const [value, unit, expected] of [
      [21.6, '°C', '21.6°'], [57.16, '%', '57.2%'], [22, 'lx', '22'],
      [30000, 'lx', '30k'], [1450, 'lx', '1.5k'], [0.70, 'mol/d⋅m²', '0.7'],
      [1.07, 'kPa', '1.07'], [13, '%', '13%'], [0, '%', '0%'],
      [null, '%', '—'], [10000, '', '10k'], [1000, '', '1k'], [100, '', '100'],
      [10, '', '10'], [9.126, '', '9.13'], [101.6, '', '102'], [12.01, '', '12'],
      [-1450, '', '-1.5k'], [-30000, '', '-30k'], [-57.16, '%', '-57.2%'],
      [21.6, '°F', '21.6°'], [21.6, '°', '21.6°'],
    ] as const) {
      expect(formatValue(value, unit)).to.equal(expected);
    }
    expect(formatValue(13, '%', true)).to.equal('13');
    expect(formatValue(21.6, '°C', true)).to.equal('21.6');
    expect(formatValue(null, '', true)).to.equal('—');
  });

  it('rounds decimal ties half-up in every branch, including negative values', () => {
    for (const [value, unit, expected] of [
      [1450, 'lx', '1.5k'], [1.005, '', '1.01'], [0.705, '', '0.71'],
      [57.15, '%', '57.2%'], [-2.5, '°C', '-2.5°'],
      [-1.005, '', '-1.01'], [-57.15, '%', '-57.2%'],
      [-100.5, '', '-101'], [-10500, 'lx', '-11k'],
      [1e-7, '', '0'],
    ] as const) {
      expect(formatValue(value, unit), String(value)).to.equal(expected);
    }
  });

  it('keeps the original magnitude branch when rounding crosses a boundary', () => {
    expect(formatValue(9.996, '')).to.equal('10');
    expect(formatValue(999.6, 'lx')).to.equal('1000');
  });

  it('describes raw numbers, missing values/ranges, and empty units', () => {
    expect(describeMeasurement(measurement({ status: 'ok' }))).to.equal('Moisture: 13 % (15–65 %)');
    expect(describeMeasurement(measurement({ value: null, status: 'unknown' }))).to.equal('Moisture: — % (15–65 %)');
    expect(describeMeasurement(measurement({ min: null, status: 'unknown' }))).to.equal('Moisture: 13 %');
    expect(describeMeasurement(measurement({ max: null, unit: '', status: 'unknown' }))).to.equal('Moisture: 13');
    expect(describeMeasurement(measurement({ unit: '', status: 'ok' }))).to.equal('Moisture: 13 (15–65)');
    expect(describeMeasurement(measurement({ value: 57.16, status: 'ok' }))).to.equal('Moisture: 57.16 % (15–65 %)');
  });

  it('appends low and high status in words, leaving ok and unknown unchanged', () => {
    for (const [status, value, suffix] of [
      ['low', 6, ' · low'], ['high', 70, ' · high'],
      ['ok', 30, ''], ['unknown', 30, ''],
    ] as const) {
      expect(describeMeasurement(measurement({ status, value, max: 60 })))
        .to.equal(`Moisture: ${value} % (15–60 %)${suffix}`);
    }
  });

  it('selects tone for all statuses with and without a matching problem', () => {
    const problems: Problem[] = [{ key: 'moisture', label: 'Moisture', status: 'problem' }];
    for (const status of ['unknown', 'ok', 'low', 'high'] as const) {
      expect(toneFor(measurement({ status }), problems)).to.equal(status === 'unknown' ? 'unknown' : status === 'ok' ? 'ok' : 'problem');
      expect(toneFor(measurement({ status }), [])).to.equal(status === 'unknown' ? 'unknown' : status === 'ok' ? 'ok' : 'advisory');
    }
    expect(toneFor(measurement({ key: 'temperature' }), problems)).to.equal('advisory');
  });
});

describe('activeProblems', () => {
  const plant = { state: 'problem', attributes: { problems: [
    { sensor_type: 'moisture', status: 'Low' }, { sensor_type: 'temperature', status: 'HIGH' },
    { sensor_type: 'custom_key', status: 'other' }, { sensor_type: 'moisture', status: 'High' },
    null, 4, { sensor_type: 123, status: 'Low' }, {},
  ] } };

  it('uses integration problems by default, normalizes statuses, and keeps first per key', () => {
    expect(activeProblems(plant, [], {})).to.deep.equal([
      { key: 'moisture', label: 'Moisture', status: 'low' },
      { key: 'temperature', label: 'Temperature', status: 'high' },
      { key: 'custom_key', label: 'Custom key', status: 'problem' },
    ]);
    expect(activeProblems(plant, [], { problem_source: 'plant', problem_sensors: ['temperature'] })).to.deep.equal([
      { key: 'temperature', label: 'Temperature', status: 'high' },
    ]);
    expect(activeProblems(plant, [], { problem_source: 'plant', problem_sensors: [] })).to.deep.equal([
      { key: 'moisture', label: 'Moisture', status: 'low' },
      { key: 'temperature', label: 'Temperature', status: 'high' },
      { key: 'custom_key', label: 'Custom key', status: 'problem' },
    ]);
    expect(activeProblems({ state: 'ok', attributes: { problems: [{ sensor_type: 'vpd' }] } }, [], {})).to.deep.equal([
      { key: 'vpd', label: 'VPD', status: 'problem' },
    ]);
  });

  it('uses only low/high gauges, filters allowed keys, and deduplicates', () => {
    const measurements = [measurement(), measurement({ status: 'high' }),
      measurement({ key: 'temperature', label: 'Temperature', status: 'high' }),
      measurement({ key: 'humidity', status: 'ok' }), measurement({ key: 'dli', status: 'unknown' })];
    expect(activeProblems(plant, measurements, { problem_source: 'gauges' })).to.deep.equal([
      { key: 'moisture', label: 'Moisture', status: 'low' },
      { key: 'temperature', label: 'Temperature', status: 'high' },
    ]);
    expect(activeProblems(undefined, measurements, { problem_source: 'gauges', problem_sensors: ['temperature'] })).to.deep.equal([
      { key: 'temperature', label: 'Temperature', status: 'high' },
    ]);
    expect(activeProblems(plant, measurements, { problem_source: 'gauges', problem_sensors: [] })).to.deep.equal([
      { key: 'moisture', label: 'Moisture', status: 'low' },
      { key: 'temperature', label: 'Temperature', status: 'high' },
    ]);
  });

  it('falls back only for a problem plant without an array attribute', () => {
    for (const attributes of [{}, { problems: null }, { problems: 'Low' }, { problems: {} }]) {
      expect(activeProblems({ state: 'problem', attributes }, [], {})).to.deep.equal([
        { key: 'plant', label: 'Needs attention', status: 'problem' },
      ]);
    }
    for (const state of ['ok', 'unknown', 'unavailable']) {
      expect(activeProblems({ state, attributes: {} }, [], {})).to.deep.equal([]);
    }
    expect(activeProblems(undefined, [], {})).to.deep.equal([]);
    expect(activeProblems({ state: 'problem', attributes: { problems: [] } }, [], {})).to.deep.equal([]);
    expect(activeProblems({ state: 'problem', attributes: { problems: [null, {}] } }, [], {})).to.deep.equal([]);
    expect(activeProblems(plant, [], { problem_sensors: ['co2'] })).to.deep.equal([]);
    expect(activeProblems({ state: 'problem', attributes: {} }, [], { problem_source: 'gauges' })).to.deep.equal([]);
  });
});

describe('batteryInfo', () => {
  it('returns only level and tone with a default low threshold of 10', () => {
    for (const [level, tone] of [
      [0, 'low'], [9, 'low'], [10, 'ok'], [100, 'ok'],
    ] as const) {
      expect(batteryInfo({ state: String(level) })).to.deep.equal({ level, tone });
    }
  });

  it('rounds, clamps, and returns unknown for missing or invalid state', () => {
    expect(batteryInfo({ state: '19.5' }).level).to.equal(20);
    expect(batteryInfo({ state: '-10' }).level).to.equal(0);
    expect(batteryInfo({ state: '120' }).level).to.equal(100);
    for (const state of [undefined, { state: 'unavailable' }, { state: 'unknown' }, { state: '' }]) {
      expect(batteryInfo(state)).to.deep.equal({ level: null, tone: 'unknown' });
    }
  });

  it('uses a custom exclusive low threshold', () => {
    for (const [level, tone] of [[19, 'low'], [20, 'ok']] as const) {
      expect(batteryInfo({ state: String(level) }, 20)).to.deep.equal({ level, tone });
    }
  });

  it('defaults undefined and non-finite thresholds to 10', () => {
    for (const warn of [undefined, NaN, Infinity, -Infinity]) {
      expect(batteryInfo({ state: '9' }, warn)).to.deep.equal({ level: 9, tone: 'low' });
      expect(batteryInfo({ state: '10' }, warn)).to.deep.equal({ level: 10, tone: 'ok' });
    }
  });
});
