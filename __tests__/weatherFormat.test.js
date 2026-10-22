import {
  clockLabel,
  dayLabel,
  dateLabel,
  fieldWorkAdvice,
  formatTemp,
  hourLabel,
  irrigationAdvice,
  sprayAdvice,
  upcomingHours,
  uvLevel,
  windDirection,
} from '../src/utils/weatherFormat';

describe('labels', () => {
  test('temperatures, hours and clock times', () => {
    expect(formatTemp(25.4)).toBe('25°');
    expect(formatTemp(undefined)).toBe('--');
    expect(hourLabel('00:00:00')).toBe('12 AM');
    expect(hourLabel('13:00:00')).toBe('1 PM');
    expect(clockLabel('06:31:58')).toBe('6:31 AM');
    expect(clockLabel('18:06:32')).toBe('6:06 PM');
  });

  test('days', () => {
    expect(dayLabel('2026-10-22', '2026-10-22')).toBe('Today');
    expect(dayLabel('2026-10-23', '2026-10-22')).toBe('Tomorrow');
    expect(dayLabel('2026-10-24', '2026-10-22')).toBe('Sat');
    expect(dateLabel('2026-10-24')).toBe('24 Oct');
  });

  test('wind direction and UV', () => {
    expect(windDirection(0)).toBe('N');
    expect(windDirection(39)).toBe('NE');
    expect(windDirection(250)).toBe('WSW');
    expect(uvLevel(8)).toBe('Very high');
    expect(uvLevel(2)).toBe('Low');
  });

  test('upcoming hours start from the current hour', () => {
    const days = [
      {
        hours: [
          { datetimeEpoch: 100 },
          { datetimeEpoch: 3700 },
          { datetimeEpoch: 7300 },
        ],
      },
      { hours: [{ datetimeEpoch: 10900 }] },
    ];
    expect(
      upcomingHours(days, 4000, 2).map(hour => hour.datetimeEpoch),
    ).toEqual([3700, 7300]);
  });
});

describe('farm advice', () => {
  test('spraying', () => {
    expect(
      sprayAdvice({ windspeed: 8, precipprob: 10, tempmax: 30 }).tone,
    ).toBe('good');
    expect(
      sprayAdvice({ windspeed: 18, precipprob: 10, tempmax: 30 }).tone,
    ).toBe('caution');
    expect(
      sprayAdvice({ windspeed: 8, precipprob: 70, tempmax: 30 }).text,
    ).toMatch(/Rain/);
  });

  test('irrigation', () => {
    expect(
      irrigationAdvice([{ precip: 4, precipprob: 40 }, { precip: 3 }]).title,
    ).toBe('Skip watering');
    expect(
      irrigationAdvice([{ precip: 0, precipprob: 0, tempmax: 37 }, {}]).tone,
    ).toBe('caution');
  });

  test('field work', () => {
    expect(fieldWorkAdvice([{ tempmax: 40 }]).title).toBe('Heat alert');
    expect(fieldWorkAdvice([{ tempmax: 20, tempmin: 2 }]).title).toMatch(
      /Frost/,
    );
    expect(
      fieldWorkAdvice([
        { tempmax: 30, tempmin: 20, precipprob: 0, humidity: 50 },
        { precipprob: 10 },
      ]).tone,
    ).toBe('good');
  });
});
