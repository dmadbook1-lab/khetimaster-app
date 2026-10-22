/*
|--------------------------------------------------------------------------
| INDIA SCHEDULE HELPERS
|--------------------------------------------------------------------------
|
| Booking dates (labour, machinery) are whole Indian calendar days. The
| server stores them as UTC midnight of that day, so they are always
| read with UTC getters and sent as 'YYYY-MM-DD'. Times are sent as
| '08:00' and shown as '8:00 AM'.
|
*/

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

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
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = value => String(value).padStart(2, '0');

/*
 * Local calendar day of a picker Date -> 'YYYY-MM-DD'.
 */
export const toDayKey = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/*
 * Today's date in India as 'YYYY-MM-DD'.
 */
export const todayInIndiaKey = (now = Date.now()) => {
  const indian = new Date(now + IST_OFFSET_MS);
  return `${indian.getUTCFullYear()}-${pad(indian.getUTCMonth() + 1)}-${pad(
    indian.getUTCDate(),
  )}`;
};

/*
 * Minutes since midnight right now in India.
 */
export const nowMinutesInIndia = (now = Date.now()) => {
  const indian = new Date(now + IST_OFFSET_MS);
  return indian.getUTCHours() * 60 + indian.getUTCMinutes();
};

/*
 * A stored booking day (UTC midnight, or 'YYYY-MM-DD') -> 'YYYY-MM-DD'.
 */
export const dayKeyOf = value => {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}`;
};

export const dayKeyToUtc = key => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const addDaysToKey = (key, days) =>
  dayKeyOf(new Date(dayKeyToUtc(key).getTime() + days * DAY_MS));

/*
 * '2026-10-25' -> 'Sun, 25 Oct 2026'
 */
export const formatDay = (value, { weekday = true, year = true } = {}) => {
  const key = dayKeyOf(value);
  if (!key) return '';

  const date = dayKeyToUtc(key);
  const parts = [
    weekday ? `${WEEKDAYS[date.getUTCDay()]},` : null,
    date.getUTCDate(),
    MONTHS[date.getUTCMonth()],
    year ? date.getUTCFullYear() : null,
  ];

  return parts.filter(part => part !== null).join(' ');
};

/*
 * '25 Oct' or '25 Oct - 27 Oct 2026' for multi-day bookings.
 */
export const formatDateRange = (start, numberOfDays = 1) => {
  const startKey = dayKeyOf(start);
  if (!startKey) return '';

  if (!numberOfDays || numberOfDays <= 1) {
    return formatDay(startKey);
  }

  const endKey = addDaysToKey(startKey, numberOfDays - 1);

  return `${formatDay(startKey, { weekday: false, year: false })} - ${formatDay(
    endKey,
    {
      weekday: false,
    },
  )}`;
};

/*
 * '08:00', '8:00 AM', '9 AM' -> minutes since midnight, or null.
 * Mirrors the server's parseTime.
 */
export const parseTime = value => {
  const match = String(value ?? '')
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = match[2] === undefined ? 0 : Number(match[2]);
  const period = match[3];

  if (match[2] === undefined && !period) return null;
  if (minutes > 59) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (period === 'PM' ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

/*
 * Minutes since midnight -> '08:00' (what the app sends).
 */
export const minutesToTime = minutes =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/*
 * '17:30' / '5:30 PM' -> '5:30 PM' (what the app shows).
 */
export const formatTime = value => {
  const minutes = parseTime(value);
  if (minutes === null) return value ? String(value) : '';

  const hours = Math.floor(minutes / 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const shown = hours % 12 === 0 ? 12 : hours % 12;

  return `${shown}:${pad(minutes % 60)} ${period}`;
};

export const formatTimeRange = (startTime, endTime) =>
  endTime
    ? `${formatTime(startTime)} - ${formatTime(endTime)}`
    : `From ${formatTime(startTime)}`;
