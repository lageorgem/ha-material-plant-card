export type MeasurementKey =
  | 'moisture' | 'conductivity' | 'temperature' | 'illuminance' | 'humidity'
  | 'dli' | 'dli_24h' | 'co2' | 'soil_temperature' | 'vpd';

export const MEASUREMENT_KEYS: readonly MeasurementKey[] = [
  'moisture', 'conductivity', 'temperature', 'illuminance', 'humidity',
  'dli', 'dli_24h', 'co2', 'soil_temperature', 'vpd',
];
export const DEFAULT_GAUGES: readonly MeasurementKey[] = [
  'moisture', 'conductivity', 'temperature', 'illuminance', 'humidity', 'dli',
];
export const MEASUREMENT_LABELS: Readonly<Record<MeasurementKey, string>> = {
  moisture: 'Moisture', conductivity: 'Conductivity', temperature: 'Temperature',
  illuminance: 'Illuminance', humidity: 'Air humidity', dli: 'DLI',
  dli_24h: 'DLI (24h)', co2: 'CO₂', soil_temperature: 'Soil temperature', vpd: 'VPD',
};
export const DEFAULT_ICONS: Readonly<Record<MeasurementKey, string>> = {
  moisture: 'mdi:water', conductivity: 'mdi:spa-outline', temperature: 'mdi:thermometer',
  illuminance: 'mdi:brightness-6', humidity: 'mdi:water-percent', dli: 'mdi:counter',
  dli_24h: 'mdi:counter', co2: 'mdi:molecule-co2',
  soil_temperature: 'mdi:thermometer-probe', vpd: 'mdi:water-thermometer-outline',
};

export interface MaterialPlantCardConfig {
  type: string;
  entity: string;
  name?: string;
  display_type?: 'full' | 'compact';
  show_bars?: string[];
  hide_species?: boolean;
  hide_image?: boolean;
  hide_units?: boolean;
  image?: string;
  battery_sensor?: string;
  battery_warn_level?: number;
  battery_ok_level?: number;
  problem_source?: 'plant' | 'gauges';
  problem_sensors?: string[];
  // Accepted for flower-card configuration compatibility; ignored by this card.
  bars_per_row?: number;
  show_care?: string[];
  extra_badges?: unknown[];
}

export interface PlantInfoEntry {
  max?: number | string | null;
  min?: number | string | null;
  current?: number | string | null;
  icon?: string | null;
  unit_of_measurement?: string | null;
  sensor?: string | null;
}
export type PlantInfo = Partial<Record<string, PlantInfoEntry>>;
export type GaugeStatus = 'low' | 'ok' | 'high' | 'unknown';
export type GaugeTone = 'ok' | 'advisory' | 'problem' | 'unknown';
export interface Measurement {
  key: string;
  label: string;
  sensor?: string;
  icon: string;
  unit: string;
  value: number | null;
  min: number | null;
  max: number | null;
  status: GaugeStatus;
  fraction: number | null;
}
export interface Problem {
  key: string;
  label: string;
  status: 'low' | 'high' | 'problem';
}
export interface BatteryInfo {
  level: number | null;
  icon: string;
  tone: 'ok' | 'warn' | 'low' | 'unknown';
}
