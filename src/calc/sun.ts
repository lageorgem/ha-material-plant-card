export type SunDay = { sunrise: number; sunset: number } | 'polar-day' | 'polar-night';

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const RAD = Math.PI / 180;
const ZENITH = 90.833 * RAD;

// NOAA solar geometry, evaluated at a UTC instant. Julian centuries are
// measured from J2000 (2000-01-01 12:00 UTC).
function solarPosition(time: number): { declination: number; equationMinutes: number } {
  const t = (time / DAY_MS + 2440587.5 - 2451545) / 36525;
  const longitude = ((280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360) * RAD;
  const anomaly = (357.52911 + t * (35999.05029 - 0.0001537 * t)) * RAD;
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const center =
    Math.sin(anomaly) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * anomaly) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * anomaly) * 0.000289;
  const omega = (125.04 - 1934.136 * t) * RAD;
  const apparentLongitude = longitude + (center - 0.00569 - 0.00478 * Math.sin(omega)) * RAD;
  const obliquity =
    (23 +
      (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60 +
      0.00256 * Math.cos(omega)) *
    RAD;
  const y = Math.tan(obliquity / 2) ** 2;
  const equationMinutes =
    (4 / RAD) *
    (y * Math.sin(2 * longitude) -
      2 * eccentricity * Math.sin(anomaly) +
      4 * eccentricity * y * Math.sin(anomaly) * Math.cos(2 * longitude) -
      0.5 * y * y * Math.sin(4 * longitude) -
      1.25 * eccentricity * eccentricity * Math.sin(2 * anomaly));
  return {
    declination: Math.asin(Math.sin(obliquity) * Math.sin(apparentLongitude)),
    equationMinutes,
  };
}

/** Sunrise/sunset for the mean-solar day containing at; timestamps are UTC ms. */
export function sunTimes(at: number, lat: number, lon: number): SunDay {
  // Select the calendar date at local mean solar midnight, not UTC midnight.
  // Keep event minutes unwrapped: at extreme longitudes they cross UTC dates.
  const midnight = Math.floor((at + (lon / 360) * DAY_MS) / DAY_MS) * DAY_MS;
  const meanNoonMinutes = 720 - 4 * lon;
  let noon = midnight + meanNoonMinutes * MINUTE_MS;
  for (let i = 0; i < 2; i++) {
    noon = midnight + (meanNoonMinutes - solarPosition(noon).equationMinutes) * MINUTE_MS;
  }
  const latitude = lat * RAD;
  const hourAngleCosine = (declination: number): number =>
    (Math.cos(ZENITH) - Math.sin(latitude) * Math.sin(declination)) /
    (Math.cos(latitude) * Math.cos(declination));
  const noonPosition = solarPosition(noon);
  const cosine = hourAngleCosine(noonPosition.declination);
  if (cosine < -1) return 'polar-day';
  if (cosine > 1) return 'polar-night';

  const eventTime = (direction: -1 | 1): number => {
    let time =
      midnight +
      (meanNoonMinutes -
        noonPosition.equationMinutes +
        direction * (4 / RAD) * Math.acos(cosine)) *
        MINUTE_MS;
    // Re-evaluate declination and equation of time at each event, rather than
    // freezing them at noon (important during rapidly changing spring days).
    for (let i = 0; i < 2; i++) {
      const position = solarPosition(time);
      const eventCosine = hourAngleCosine(position.declination);
      // Near a polar transition an iteration can cross the acos domain.
      // Retain the finite estimate instead of manufacturing NaN timestamps.
      if (eventCosine < -1 || eventCosine > 1) break;
      time =
        midnight +
        (meanNoonMinutes -
          position.equationMinutes +
          direction * (4 / RAD) * Math.acos(eventCosine)) *
          MINUTE_MS;
    }
    return time;
  };

  return { sunrise: eventTime(-1), sunset: eventTime(1) };
}

export interface SunEvent {
  t: number;
  kind: 'sunrise' | 'sunset';
}

/** Inclusive sunrise/sunset events across every overlapping solar day. */
export function sunEvents(start: number, end: number, lat: number, lon: number): SunEvent[] {
  const events: SunEvent[] = [];
  for (let at = start - DAY_MS; at <= end + DAY_MS; at += DAY_MS) {
    const day = sunTimes(at, lat, lon);
    if (typeof day === 'string') continue;
    for (const kind of ['sunrise', 'sunset'] as const) {
      const t = day[kind];
      if (start <= t && t <= end) events.push({ t, kind });
    }
  }
  events.sort((a, b) => a.t - b.t);
  return events.filter((event, index) => index === 0 || event.t - events[index - 1].t > MINUTE_MS);
}

/** Keep only intervals fully contained within the inset daylight window. */
export function isDaylight(
  start: number,
  end: number,
  lat: number,
  lon: number,
  offsetMin: number,
): boolean {
  const day = sunTimes((start + end) / 2, lat, lon);
  if (day === 'polar-day') return true;
  if (day === 'polar-night') return false;
  const offset = offsetMin * MINUTE_MS;
  return start >= day.sunrise + offset && end <= day.sunset - offset;
}
