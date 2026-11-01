/*
 * 950 -> '950', 1520 -> '1.5K', 2400000 -> '2.4M'
 */
export const formatCount = value => {
  const count = Number(value) || 0;

  if (count < 1000) return String(count);

  const format = (n, suffix) =>
    `${n >= 100 ? Math.floor(n) : Math.floor(n * 10) / 10}${suffix}`;

  if (count < 1000000) return format(count / 1000, 'K');

  return format(count / 1000000, 'M');
};

/*
 * Compact Instagram-style age: 'now', '5m', '3h', '2d', '4w', then a date.
 */
export const shortTimeAgo = (date, now = Date.now()) => {
  const time = new Date(date).getTime();

  if (!Number.isFinite(time)) return '';

  const seconds = Math.max(0, Math.floor((now - time) / 1000));

  if (seconds < 60) return 'now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  if (days < 56) return `${Math.floor(days / 7)}w`;

  return new Date(time).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const initialsOf = name =>
  (name || 'Farmer')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');

// 0:07, 1:32
export const formatDuration = seconds => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/*
 * Splits a caption into text and '#tag' parts so hashtags can be
 * rendered as links. Covers Latin and the Indic scripts (U+0900-U+0DFF).
 */
export const splitCaption = caption =>
  (caption || '')
    .split(/(#[A-Za-z0-9_\u00C0-\u024F\u0900-\u0DFF]+)/g)
    .filter(Boolean)
    .map(part => ({ text: part, isTag: part.startsWith('#') }));

export const coverOf = post => {
  const media = post?.media?.[0];

  if (!media) return '';

  return media.type === 'video' ? media.thumbnailUrl || '' : media.url;
};
