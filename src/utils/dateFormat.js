import i18n from '../translation/i18n';

/*
 * Dates and times in the app language, built from the `date.*` keys
 * rather than Intl so Hindi/Marathi read naturally ("सुबह 6:31", "5 मार्च")
 * on every device.
 */

const toDate = value => {
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const weekdayName = (index, long = false) =>
  i18n.t(`date.${long ? 'weekday_long' : 'weekday'}_${index}`);

export const monthName = (index, long = false) =>
  i18n.t(`date.${long ? 'month_long' : 'month'}_${index}`);

/*
 * Hours (0-23) and minutes -> "6:31 AM" / "सुबह 6:31" / "सकाळी 6:31".
 * Leave minutes out for an hour-only label ("1 PM").
 */
export const formatClock = (hours, minutes) => {
  const hour = Number(hours);
  if (!Number.isFinite(hour)) return '--';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const time =
    minutes === undefined
      ? String(h12)
      : `${h12}:${String(Number(minutes) || 0).padStart(2, '0')}`;
  const period =
    hour < 5
      ? 'night_am'
      : hour < 12
      ? 'morning'
      : hour < 16
      ? 'afternoon'
      : hour < 20
      ? 'evening'
      : 'night_pm';
  return i18n.t(`date.clock_${period}`, { time });
};

export const formatTime = value => {
  const date = toDate(value);
  return date ? formatClock(date.getHours(), date.getMinutes()) : '';
};

/*
 * options: { day = true, month = 'short' | 'long', year = false,
 *            weekday = false | 'short' | 'long', pad = false }
 * -> "5 Mar 2025", "Wed, 5 Mar", "March 2025"
 */
export const formatDate = (
  value,
  { day = true, month = 'short', year = false, weekday = false, pad = false } = {},
) => {
  const date = toDate(value);
  if (!date) return '';
  const parts = [];
  if (day) {
    parts.push(pad ? String(date.getDate()).padStart(2, '0') : date.getDate());
  }
  if (month) parts.push(monthName(date.getMonth(), month === 'long'));
  if (year) parts.push(date.getFullYear());
  const text = parts.join(' ');
  if (!weekday) return text;
  const name = weekdayName(date.getDay(), weekday === 'long');
  return text ? `${name}, ${text}` : name;
};

/* "Today", "Yesterday", or a short date */
export const formatRelativeDay = value => {
  const date = toDate(value);
  if (!date) return '';
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  if (date.toDateString() === today.toDateString()) return i18n.t('common.today');
  if (date.toDateString() === yesterday.toDateString()) {
    return i18n.t('common.yesterday');
  }
  return formatDate(date, { year: date.getFullYear() !== today.getFullYear() });
};
