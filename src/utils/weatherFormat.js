/*
|--------------------------------------------------------------------------
| WEATHER HELPERS
|--------------------------------------------------------------------------
|
| Visual Crossing data in metric units: °C, km/h, mm, %.
|
*/

import i18n from '../translation/i18n';
import { formatClock, monthName, weekdayName } from './dateFormat';

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
  const code = COMPASS[Math.round((((value % 360) + 360) % 360) / 22.5) % 16];
  return i18n.t(`weather.dir_${code}`);
};

/*
 * '13:00:00' -> '1 PM'
 */
export const hourLabel = time => {
  const hour = Number(String(time || '').split(':')[0]);
  if (!Number.isFinite(hour)) return '';
  return formatClock(hour);
};

/*
 * '06:31:58' -> '6:31 AM'
 */
export const clockLabel = time => {
  const [hours, minutes] = String(time || '')
    .split(':')
    .map(Number);
  if (!Number.isFinite(hours)) return '--';
  return formatClock(hours, minutes || 0);
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
  if (dayKey === todayKey) return i18n.t('common.today');
  const tomorrow = new Date(parseDay(todayKey).getTime() + 86400000)
    .toISOString()
    .slice(0, 10);
  if (dayKey === tomorrow) return i18n.t('common.tomorrow');
  return weekdayName(parseDay(dayKey).getUTCDay());
};

export const dateLabel = dayKey => {
  const date = parseDay(dayKey);
  return `${date.getUTCDate()} ${monthName(date.getUTCMonth())}`;
};

export const uvLevel = uv => {
  const value = Number(uv) || 0;
  if (value >= 11) return i18n.t('weather.uv_extreme');
  if (value >= 8) return i18n.t('weather.uv_very_high');
  if (value >= 6) return i18n.t('weather.uv_high');
  if (value >= 3) return i18n.t('weather.uv_moderate');
  return i18n.t('weather.uv_low');
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
      title: i18n.t('weather.spray_avoid'),
      text:
        rain >= 50
          ? i18n.t('weather.spray_avoid_rain')
          : wind > 20
          ? i18n.t('weather.spray_avoid_wind')
          : i18n.t('weather.spray_avoid_heat'),
    };
  }

  if (wind > 15 || rain >= 30 || temp > 32) {
    return {
      tone: 'caution',
      title: i18n.t('weather.spray_caution'),
      text: i18n.t('weather.spray_caution_text'),
    };
  }

  return {
    tone: 'good',
    title: i18n.t('weather.spray_good'),
    text: i18n.t('weather.spray_good_text'),
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
      title: i18n.t('weather.skip_watering'),
      text: i18n.t('weather.skip_watering_text', { mm: Math.round(rainSoon) }),
    };
  }

  if ((Number(today?.tempmax) || 0) >= 35) {
    return {
      tone: 'caution',
      title: i18n.t('weather.water_early'),
      text: i18n.t('weather.water_early_text'),
    };
  }

  return {
    tone: 'good',
    title: i18n.t('weather.water_usual'),
    text: i18n.t('weather.water_usual_text'),
  };
};

export const fieldWorkAdvice = days => {
  const [today, tomorrow] = days || [];
  const max = Number(today?.tempmax) || 0;
  const min = Number(today?.tempmin);

  if (max >= 38) {
    return {
      tone: 'avoid',
      title: i18n.t('weather.heat_alert'),
      text: i18n.t('weather.heat_alert_text'),
    };
  }

  if (Number.isFinite(min) && today?.tempmin !== null && min <= 4) {
    return {
      tone: 'avoid',
      title: i18n.t('weather.frost_risk'),
      text: i18n.t('weather.frost_risk_text'),
    };
  }

  const dry =
    (Number(today?.precipprob) || 0) < 30 &&
    (Number(tomorrow?.precipprob) || 0) < 30 &&
    (Number(today?.humidity) || 0) < 75;

  if (dry) {
    return {
      tone: 'good',
      title: i18n.t('weather.good_harvest'),
      text: i18n.t('weather.good_harvest_text'),
    };
  }

  return {
    tone: 'caution',
    title: i18n.t('weather.keep_covered'),
    text: i18n.t('weather.keep_covered_text'),
  };
};

/*
 * Short day name for tight spots: 'Today' or the weekday ('Fri').
 */
export const dayShortLabel = (dayKey, todayKey) =>
  dayKey === todayKey
    ? i18n.t('common.today')
    : weekdayName(parseDay(dayKey).getUTCDay());

/*
 * Visual Crossing condition text ("Rain, Partially cloudy") in the app
 * language. It has no Hindi/Marathi, so each known part is looked up under
 * weather.cond_*; unknown parts stay as they are.
 */
export const conditionsLabel = conditions =>
  String(conditions || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const key = `weather.cond_${part.toLowerCase().replace(/[^a-z]+/g, '_')}`;
      return i18n.exists(key) ? i18n.t(key) : part;
    })
    .join(', ');

/*
 * The day's summary sentence comes back in English only, so languages
 * with translated conditions (hi, mr) show those instead.
 */
const CONDITION_LANGUAGES = ['hi', 'mr'];

export const descriptionLabel = day =>
  CONDITION_LANGUAGES.includes(String(i18n.language).split('-')[0])
    ? conditionsLabel(day?.conditions)
    : day?.description || '';
