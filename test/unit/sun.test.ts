import { expect } from '@open-wc/testing';
import { isDaylight, sunTimes, type SunDay } from '../../src/calc/sun.js';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const at = (iso: string): number => Date.parse(iso);

function normal(day: SunDay): { sunrise: number; sunset: number } {
  if (typeof day === 'string') throw new Error(`Expected ordinary solar day, got ${day}`);
  return day;
}

describe('sunTimes', () => {
  it('matches the Home Assistant Bucharest sunset within two minutes', () => {
    const day = normal(sunTimes(at('2026-10-13T10:00:00Z'), 44.43, 26.13));
    expect(Math.abs(day.sunset - at('2026-10-13T15:34:44Z'))).to.be.at.most(2 * MINUTE);
  });

  it('matches the Home Assistant Bucharest sunrise within two minutes', () => {
    const day = normal(sunTimes(at('2026-10-14T10:00:00Z'), 44.43, 26.13));
    expect(Math.abs(day.sunrise - at('2026-10-14T04:29:15Z'))).to.be.at.most(2 * MINUTE);
  });

  it('uses the entire local mean solar day, not the UTC date or next event', () => {
    const lat = 44.43;
    const lon = 26.13;
    const midnight = at('2026-10-14T00:00:00Z') - (lon / 360) * DAY;
    const expected = sunTimes(midnight + 12 * HOUR, lat, lon);
    for (const time of [midnight, midnight + 1, midnight + DAY - 1]) {
      expect(sunTimes(time, lat, lon)).to.deep.equal(expected);
    }
    expect(sunTimes(midnight - 1, lat, lon)).not.to.deep.equal(expected);
    expect(sunTimes(midnight + DAY, lat, lon)).not.to.deep.equal(expected);
  });

  it('matches the equatorial equinox reference', () => {
    // March equinox: equation of time ≈ -7.4 min; 90.833° zenith
    // adds ≈ 3.3 min on either side of the geometrical 12-hour day.
    const day = normal(sunTimes(at('2026-03-20T12:00:00Z'), 0, 0));
    expect(Math.abs(day.sunrise - at('2026-03-20T06:04:00Z'))).to.be.at.most(2 * MINUTE);
    expect(Math.abs(day.sunset - at('2026-03-20T18:11:00Z'))).to.be.at.most(2 * MINUTE);
    expect((day.sunset - day.sunrise) / HOUR).to.be.closeTo(12, 0.15);
  });

  it('matches solstice day lengths at 45° north', () => {
    // With declination ±23.44° and zenith 90.833°, the hour-angle
    // equation gives ≈ 15 h 37 min in June and 8 h 46 min in December.
    const summer = normal(sunTimes(at('2026-06-21T12:00:00Z'), 45, 0));
    const winter = normal(sunTimes(at('2026-12-21T12:00:00Z'), 45, 0));
    expect((summer.sunset - summer.sunrise) / MINUTE).to.be.closeTo(937, 2);
    expect((winter.sunset - winter.sunrise) / MINUTE).to.be.closeTo(526, 2);
    expect(summer.sunset - summer.sunrise).to.be.greaterThan(winter.sunset - winter.sunrise);
  });

  it('reverses the solstice seasons in the southern hemisphere', () => {
    const summer = normal(sunTimes(at('2026-12-21T12:00:00Z'), -45, 0));
    const winter = normal(sunTimes(at('2026-06-21T12:00:00Z'), -45, 0));
    expect((summer.sunset - summer.sunrise) / MINUTE).to.be.closeTo(937, 2);
    expect((winter.sunset - winter.sunrise) / MINUTE).to.be.closeTo(526, 2);
  });

  for (const lon of [-170, 170]) {
    it(`keeps UTC-crossing events on the solar day at longitude ${lon}`, () => {
      const midnight = at('2026-03-20T00:00:00Z') - (lon / 360) * DAY;
      const day = normal(sunTimes(midnight + 12 * HOUR, 0, lon));
      expect(day.sunrise).to.be.greaterThan(midnight);
      expect(day.sunset).to.be.lessThan(midnight + DAY);
      expect(sunTimes(midnight + 1, 0, lon)).to.deep.equal(day);
      expect(sunTimes(midnight + DAY - 1, 0, lon)).to.deep.equal(day);
    });
  }

  it('returns polar day in the Arctic summer and polar night in winter', () => {
    expect(sunTimes(at('2026-06-21T12:00:00Z'), 78, 15)).to.equal('polar-day');
    expect(sunTimes(at('2026-12-21T12:00:00Z'), 78, 15)).to.equal('polar-night');
  });
});

describe('isDaylight', () => {
  const lat = 44.43;
  const lon = 26.13;
  const day = () => normal(sunTimes(at('2026-10-14T10:00:00Z'), lat, lon));

  it('keeps an hour fully inside the offset window', () => {
    const { sunrise } = day();
    expect(isDaylight(sunrise + HOUR, sunrise + 2 * HOUR, lat, lon, 30)).to.equal(true);
  });

  it('rejects an hour starting before sunrise plus 30 minutes', () => {
    const { sunrise } = day();
    expect(isDaylight(sunrise + 29 * MINUTE, sunrise + 89 * MINUTE, lat, lon, 30)).to.equal(false);
  });

  it('rejects an hour ending after sunset minus 30 minutes', () => {
    const { sunset } = day();
    expect(isDaylight(sunset - 89 * MINUTE, sunset - 29 * MINUTE, lat, lon, 30)).to.equal(false);
  });

  it('distinguishes zero and 30-minute offsets', () => {
    const { sunrise } = day();
    const start = sunrise + 10 * MINUTE;
    expect(isDaylight(start, start + HOUR, lat, lon, 0)).to.equal(true);
    expect(isDaylight(start, start + HOUR, lat, lon, 30)).to.equal(false);
  });

  it('includes exact window boundaries for intervals and instants', () => {
    const { sunrise, sunset } = day();
    const start = sunrise + 30 * MINUTE;
    const end = sunset - 30 * MINUTE;
    expect(isDaylight(start, end, lat, lon, 30)).to.equal(true);
    for (const instant of [start, end]) {
      expect(isDaylight(instant, instant, lat, lon, 30)).to.equal(true);
    }
    for (const instant of [start - 1, end + 1]) {
      expect(isDaylight(instant, instant, lat, lon, 30)).to.equal(false);
    }
    expect(isDaylight(sunrise, sunrise, lat, lon, 0)).to.equal(true);
    expect(isDaylight(sunset, sunset, lat, lon, 0)).to.equal(true);
  });

  it('uses the midpoint solar day for intervals crossing solar midnight', () => {
    const midnight = at('2026-10-14T00:00:00Z') - (lon / 360) * DAY;
    expect(isDaylight(midnight - HOUR, midnight + HOUR, lat, lon, 30)).to.equal(false);
  });

  it('keeps polar-day hours and instants regardless of offset, rejects polar night', () => {
    for (const endOffset of [0, HOUR]) {
      const summer = at('2026-06-21T12:00:00Z');
      const winter = at('2026-12-21T12:00:00Z');
      expect(isDaylight(summer, summer + endOffset, 78, 15, 180)).to.equal(true);
      expect(isDaylight(winter, winter + endOffset, 78, 15, 0)).to.equal(false);
    }
  });
});
