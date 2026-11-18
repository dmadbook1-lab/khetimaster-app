import directory from '../data/warehouses.json';

/*
 * The warehouse directory ships with the app, so it works on a weak
 * connection. Coordinates are the locality or district centre, never the
 * exact gate, so distances are always shown as approximate.
 */
export const WAREHOUSES = directory.warehouses;
export const DIRECTORY_PREPARED = directory.prepared;

export const NEARBY_RADIUS_KM = 150;
export const MIN_NEARBY_RESULTS = 10;
export const OTHER_DISTRICT = 'Other locations';

const byId = new Map(WAREHOUSES.map(item => [item.id, item]));

export const warehouseById = id => byId.get(id) || null;

export const sourceUrlOf = item => directory.sources[item.source] || '';

/* ---------------- distance ---------------- */

export const distanceBetween = (fromLat, fromLng, toLat, toLng) => {
  const radians = Math.PI / 180;
  const latGap = (toLat - fromLat) * radians;
  const lngGap = (toLng - fromLng) * radians;
  const a =
    Math.sin(latGap / 2) ** 2 +
    Math.cos(fromLat * radians) *
      Math.cos(toLat * radians) *
      Math.sin(lngGap / 2) ** 2;

  return 2 * 6371 * Math.asin(Math.sqrt(a));
};

export const withDistances = (coords, list = WAREHOUSES) =>
  list.map(item => ({
    ...item,
    distanceKm:
      coords && typeof item.lat === 'number'
        ? distanceBetween(
            coords.latitude,
            coords.longitude,
            item.lat,
            item.lng,
          )
        : null,
  }));

const byName = (a, b) => a.name.localeCompare(b.name);

const byDistance = (a, b) => {
  if (a.distanceKm == null && b.distanceKm == null) return byName(a, b);
  if (a.distanceKm == null) return 1;
  if (b.distanceKm == null) return -1;
  return a.distanceKm - b.distanceKm;
};

/*
 * Everything within the radius. In areas the directory barely covers, the
 * closest few are returned instead of an empty screen.
 */
export const nearbyWarehouses = list => {
  const sorted = [...list].sort(byDistance);
  const within = sorted.filter(
    item => item.distanceKm != null && item.distanceKm <= NEARBY_RADIUS_KM,
  );

  return within.length >= MIN_NEARBY_RESULTS
    ? within
    : sorted.slice(0, MIN_NEARBY_RESULTS);
};

/* ---------------- states and districts ---------------- */

const countBy = (list, read) => {
  const counts = new Map();

  list.forEach(item => {
    const key = read(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const listStates = (list = WAREHOUSES) =>
  countBy(list, item => item.state);

export const listDistricts = (state, list = WAREHOUSES) => {
  const named = list.filter(item => item.state === state);
  const districts = countBy(
    named.filter(item => item.district),
    item => item.district,
  );
  const unassigned = named.filter(item => !item.district).length;

  return unassigned
    ? [...districts, { name: OTHER_DISTRICT, count: unassigned }]
    : districts;
};

export const inRegion = (list, { state, district }) =>
  list.filter(item => {
    if (item.state !== state) return false;
    if (!district) return true;
    if (district === OTHER_DISTRICT) return !item.district;
    return item.district === district;
  });

const normalise = value =>
  (value || '')
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .replace(/[^a-z]/g, '');

// Map services use newer or alternate names for some directory districts
const DISTRICT_ALIASES = {
  chhatrapatisambhajinagar: 'aurangabad',
  ahilyanagar: 'ahmednagar',
  kabirdham: 'kawardha',
  belgaum: 'belagavi',
  bangaloreurban: 'bengaluruurban',
  bangalorerural: 'bengalururural',
};

/*
 * Turns the phone's detected address into the directory's own state and
 * district names. Either comes back '' when the directory has no match.
 */
export const matchDetectedRegion = (detected, list = WAREHOUSES) => {
  const wantedState = normalise(detected?.state);
  const state = listStates(list).find(
    item => normalise(item.name) === wantedState,
  )?.name;

  if (!state) return { state: '', district: '' };

  const raw = normalise(detected?.district);
  const wantedDistrict = DISTRICT_ALIASES[raw] || raw;
  const district = listDistricts(state, list).find(
    item => normalise(item.name) === wantedDistrict,
  )?.name;

  return { state, district: district || '' };
};

/* ---------------- filter and sort ---------------- */

const searchTextOf = item =>
  [
    item.name,
    item.village,
    item.district,
    item.state,
    item.commodity,
    item.operator,
    item.address,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const filterWarehouses = (list, { category, phoneOnly, query }) => {
  const words = (query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);

  return list.filter(item => {
    if (category && item.category !== category) return false;
    if (phoneOnly && !item.phones?.length) return false;
    if (!words.length) return true;

    const text = searchTextOf(item);

    return words.every(word => text.includes(word));
  });
};

export const sortWarehouses = (list, sort) => {
  const sorted = [...list];

  if (sort === 'capacity') {
    return sorted.sort(
      (a, b) => (b.capacity || 0) - (a.capacity || 0) || byName(a, b),
    );
  }

  return sorted.sort(sort === 'name' ? byName : byDistance);
};

/* ---------------- display ---------------- */

export const formatDistance = km => {
  if (km == null) return '';
  if (km < 1) return 'Under 1 km';

  return `≈ ${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
};

export const formatCapacity = tonnes =>
  tonnes ? `${Number(tonnes).toLocaleString('en-IN')} MT` : '';

export const placeLine = item =>
  [item.village, item.district, item.state]
    .filter(
      (part, index, parts) => part && parts.indexOf(part) === index,
    )
    .join(', ');

export const dialUrl = phone => `tel:${phone.replace(/[^\d+]/g, '')}`;

export const directionsUrl = item => {
  const place =
    item.address ||
    [item.name, item.village, item.district, item.state]
      .filter(Boolean)
      .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place,
  )}`;
};

export const formatPreparedDate = (value = DIRECTORY_PREPARED) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
