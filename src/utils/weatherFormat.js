/*
|--------------------------------------------------------------------------
| WEATHER HELPERS
|--------------------------------------------------------------------------
|
| Visual Crossing data in metric units: °C, km/h, mm, %.
|
*/

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

export const round = value =>
  Number.isFinite(Number(value)) ? Math.round(Number(value)) : null;

export const formatTemp = value => {
  const temp = round(value);
  return temp === null ? '--' : `${temp}°`;
};

export const windDirection = degrees => {
  const value = Number(degrees);
  if (!Number.isFinite(value)) return '';
  return COMPASS[Math.round((((value % 360) + 360) % 360) / 22.5) % 16];
};

/*
 * '13:00:00' -> '1 PM'
 */
export const hourLabel = time => {
  const hour = Number(String(time || '').split(':')[0]);
  if (!Number.isFinite(hour)) return '';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 === 0 ? 12 : hour % 12} ${suffix}`;
};

/*
 * '06:31:58' -> '6:31 AM'
 */
export const clockLabel = time => {
  const [hours, minutes] = String(time || '')
    .split(':')
    .map(Number);
  if (!Number.isFinite(hours)) return '--';
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 === 0 ? 12 : hours % 12}:${String(minutes || 0).padStart(
    2,
    '0',
  )} ${suffix}`;
};

const parseDay = key => {
  const [year, month, day] = String(key || '')
    .split('-')
    .map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/*
 * 'Today', 'Tomorrow' or 'Fri'.
 */
export const dayLabel = (dayKey, todayKey) => {
  if (dayKey === todayKey) return 'Today';
  const tomorrow = new Date(parseDay(todayKey).getTime() + 86400000)
    .toISOString()
    .slice(0, 10);
  if (dayKey === tomorrow) return 'Tomorrow';
  return WEEKDAYS[parseDay(dayKey).getUTCDay()];
};

export const dateLabel = dayKey => {
  const date = parseDay(dayKey);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
};

export const uvLevel = uv => {
  const value = Number(uv) || 0;
  if (value >= 11) return 'Extreme';
  if (value >= 8) return 'Very high';
  if (value >= 6) return 'High';
  if (value >= 3) return 'Moderate';
  return 'Low';
};

/*
 * The next `count` hours from now across today and tomorrow.
 */
export const upcomingHours = (days, nowEpoch, count = 24) =>
  (days || [])
    .flatMap(day => day.hours || [])
    .filter(hour => (hour.datetimeEpoch || 0) >= nowEpoch - 3600)
    .slice(0, count);

/*
|--------------------------------------------------------------------------
| FARM ADVICE
|--------------------------------------------------------------------------
|
| Simple rules a farmer can act on. tone: good | caution | avoid
|
*/

export const sprayAdvice = day => {
  const wind = Number(day?.windspeed) || 0;
  const rain = Number(day?.precipprob) || 0;
  const temp = Number(day?.tempmax ?? day?.temp) || 0;

  if (wind > 20 || rain >= 50 || temp > 35) {
    return {
      tone: 'avoid',
      title: 'Don’t spray today',
      text:
        rain >= 50
          ? 'Rain is likely and will wash the spray off.'
          : wind > 20
          ? 'Strong wind will carry the spray away.'
          : 'Too hot: spray evaporates and can burn leaves.',
    };
  }

  if (wind > 15 || rain >= 30 || temp > 32) {
    return {
      tone: 'caution',
      title: 'Spray early morning only',
      text: 'Wind or heat picks up later in the day.',
    };
  }

  return {
    tone: 'good',
    title: 'Good day to spray',
    text: 'Low wind and little chance of rain.',
  };
};

export const irrigationAdvice = days => {
  const [today, tomorrow] = days || [];
  const rainSoon =
    (Number(today?.precip) || 0) + (Number(tomorrow?.precip) || 0);
  const chance = Math.max(
    Number(today?.precipprob) || 0,
    Number(tomorrow?.precipprob) || 0,
  );

  if (rainSoon >= 5 || chance >= 60) {
    return {
      tone: 'good',
      title: 'Skip watering',
      text: `About ${Math.round(rainSoon)} mm of rain expected in 2 days.`,
    };
  }

  if ((Number(today?.tempmax) || 0) >= 35) {
    return {
      tone: 'caution',
      title: 'Water early or late',
      text: 'Hot day: water before 9 AM or after 5 PM to save water.',
    };
  }

  return {
    tone: 'good',
    title: 'Water as usual',
    text: 'No rain expected in the next 2 days.',
  };
};

export const fieldWorkAdvice = days => {
  const [today, tomorrow] = days || [];
  const max = Number(today?.tempmax) || 0;
  const min = Number(today?.tempmin);

  if (max >= 38) {
    return {
      tone: 'avoid',
      title: 'Heat alert',
      text: 'Avoid field work 12–4 PM. Give animals shade and water.',
    };
  }

  if (Number.isFinite(min) && today?.tempmin !== null && min <= 4) {
    return {
      tone: 'avoid',
      title: 'Frost risk tonight',
      text: 'Cover nursery plants and water fields lightly in the evening.',
    };
  }

  const dry =
    (Number(today?.precipprob) || 0) < 30 &&
    (Number(tomorrow?.precipprob) || 0) < 30 &&
    (Number(today?.humidity) || 0) < 75;

  if (dry) {
    return {
      tone: 'good',
      title: 'Good for harvest & drying',
      text: 'Dry weather for the next 2 days.',
    };
  }

  return {
    tone: 'caution',
    title: 'Keep harvest covered',
    text: 'Damp or rainy weather ahead. Store produce under cover.',
  };
};
