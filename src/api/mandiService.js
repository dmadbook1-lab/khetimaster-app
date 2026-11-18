import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MANDI_API_KEY, MANDI_USES_SAMPLE_KEY } from '../config/api';
import MANDI_CROPS from '../data/mandiCrops';
import MANDI_STATES from '../data/mandiLocations';
import { addDaysToKey, todayInIndiaKey } from '../utils/indiaSchedule';

/*
|--------------------------------------------------------------------------
| MANDI PRICE SERVICE (data.gov.in, called from the app)
|--------------------------------------------------------------------------
|
| Fetches the same way CropGen does: a plain GET to the Agmarknet
| "current daily price" resource with filters[commodity], retrying the
| intermittent 5xx / "No query was recieved" answers. It runs on the
| device because data.gov.in does not answer our server in production.
|
| Everything the screens use on top of that (state/district/market
| filters, sorting, summary, paging, historical dates) is done here, and
| the result has the same shape the /api/mandi backend returned, so the
| screens and Redux slice need no changes.
|
| Rules (same as CropGen's MANDI_RATES.md, done on the device):
|  - One day only: today (IST) if reported, else the latest day that is
|    at most MAX_AGE_DAYS old. Days are never mixed. -> {date, isToday}
|  - Cache per query: 30 min (5 min when empty), kept in memory and in
|    AsyncStorage so it survives restarts. The last good value is
|    served (stale: true) when data.gov.in fails.
|  - Same query at the same time shares one request.
|  - A 429 is never retried; all calls pause for COOLDOWN_MS.
|
| Prices are rupees per quintal.
|
*/

const BASE_URL = 'https://api.data.gov.in/resource';
const DAILY_RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';
const HISTORICAL_RESOURCE = '35985678-0d79-46b4-9ed6-6f13308a1d24';

const REQUEST_TIMEOUT_MS = 15000;
const PAGE_LIMIT = 1000; // the key decides the real size (sample key: 10)
const MAX_PAGES = 10;
const RETRY_DELAYS_MS = [1000, 3000];
const CACHE_MS = 30 * 60 * 1000;
const EMPTY_CACHE_MS = 5 * 60 * 1000;
const PAST_DAY_CACHE_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;
export const MAX_AGE_DAYS = 7;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export class MandiServiceError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code =
      code || (status === 429 ? 'MANDI_RATE_LIMITED' : 'MANDI_UNAVAILABLE');
  }
}

if (__DEV__ && MANDI_USES_SAMPLE_KEY) {
  console.warn(
    '[mandi] Using the public data.gov.in sample key (10 rows per call, ' +
      'shared rate limit). Set MANDI_API_KEY in .env for production.',
  );
}

/*
|--------------------------------------------------------------------------
| NAME MATCHING
|--------------------------------------------------------------------------
*/

export const matchKey = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const VALID_CROP_TEXT = /^[\p{L}\p{N} ()/&.,'-]{2,60}$/u;

export const resolveCrop = input => {
  const raw = String(input || '').trim();
  if (!raw) return null;

  const key = matchKey(raw);

  const crop = MANDI_CROPS.find(item =>
    [
      item.id,
      item.name,
      item.commodity,
      ...item.commodities,
      ...(item.aliases || []),
    ].some(value => matchKey(value) === key),
  );

  if (crop) return { ...crop, known: true };

  if (!VALID_CROP_TEXT.test(raw)) return null;

  return {
    id: null,
    name: raw,
    commodity: raw,
    commodities: [raw],
    aliases: [],
    category: null,
    known: false,
  };
};

export const resolveState = input => {
  const key = matchKey(input);
  if (!key) return null;

  const state = MANDI_STATES.find(item =>
    [item.id, item.name, ...(item.aliases || [])].some(
      value => matchKey(value) === key,
    ),
  );

  if (!state) return null;

  const spellings = [state.name, ...(state.aliases || [])];

  return { ...state, spellings, keys: new Set(spellings.map(matchKey)) };
};

// data.gov.in filters by text ("Kulthi(Horse Gram)" also returns Bengal
// Gram), so keep only the crop's exact official names.
const commodityMatcher = crop => {
  const exact = new Set(crop.commodities.map(matchKey));

  return records => {
    const matched = records.filter(record =>
      exact.has(matchKey(record.commodity)),
    );

    if (matched.length === 0 && !crop.known) {
      const partial = matchKey(crop.name);
      return records.filter(record =>
        matchKey(record.commodity).includes(partial),
      );
    }

    return matched;
  };
};

/*
|--------------------------------------------------------------------------
| DATES
|--------------------------------------------------------------------------
*/

const toIsoDate = value => {
  const match = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// "2026-10-22" or "22/10/2026" -> "22/10/2026"; null if invalid
const toGovDate = value => {
  const text = String(value || '').trim();
  let day;
  let month;
  let year;

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    [, year, month, day] = match;
  } else {
    match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    [, day, month, year] = match;
  }

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    date.getUTCDate() !== Number(day) ||
    date.getUTCMonth() !== Number(month) - 1
  ) {
    return null;
  }

  return `${String(day).padStart(2, '0')}/${String(month).padStart(
    2,
    '0',
  )}/${year}`;
};

/*
|--------------------------------------------------------------------------
| RECORDS
|--------------------------------------------------------------------------
*/

const toPrice = value => {
  if (value === undefined || value === null || value === '') return null;

  const number = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
};

const toText = value =>
  value === undefined || value === null ? null : String(value).trim() || null;

// Both datasets (lowercase / Capitalised fields) in one shape
const formatRecord = record => {
  const arrivalDate = toText(record.arrival_date ?? record.Arrival_Date);

  return {
    arrivalDate,
    arrivalDateISO: toIsoDate(arrivalDate),
    commodity: toText(record.commodity ?? record.Commodity),
    commodityCode: record.Commodity_Code ?? null,
    state: toText(record.state ?? record.State),
    district: toText(record.district ?? record.District),
    market: toText(record.market ?? record.Market),
    variety: toText(record.variety ?? record.Variety),
    grade: toText(record.grade ?? record.Grade),
    minPrice: toPrice(record.min_price ?? record.Min_Price),
    maxPrice: toPrice(record.max_price ?? record.Max_Price),
    modalPrice: toPrice(record.modal_price ?? record.Modal_Price),
    unit: 'Rs/Quintal',
  };
};

const recordKey = record =>
  [
    record.state,
    record.district,
    record.market,
    record.commodity,
    record.variety,
    record.grade,
  ]
    .map(matchKey)
    .join('|');

const dedupe = records => {
  const seen = new Map();

  for (const record of records) {
    const key = `${recordKey(record)}|${record.arrivalDateISO}`;
    if (!seen.has(key)) seen.set(key, record);
  }

  return [...seen.values()];
};

/*
|--------------------------------------------------------------------------
| CACHE (memory + AsyncStorage; last good value served if a refresh fails)
|--------------------------------------------------------------------------
*/

const cache = new Map();
const MAX_CACHE_ENTRIES = 200;
const RETRY_AFTER_FAILURE_MS = 60 * 1000;

const STORAGE_PREFIX = 'mandi:v2:';
const MAX_STORED_ENTRIES = 80;
const MAX_STORED_CHARS = 400 * 1024; // keep each entry well under Android's limit
const STORED_MAX_AGE_MS = (MAX_AGE_DAYS + 1) * 24 * 60 * 60 * 1000;

// an empty answer is re-checked sooner (prices may be published later)
const ttlFor = (value, ttlMs) =>
  ttlMs < PAST_DAY_CACHE_MS &&
  Array.isArray(value?.records) &&
  value.records.length === 0
    ? Math.min(ttlMs, EMPTY_CACHE_MS)
    : ttlMs;

const remember = (key, entry) => {
  cache.delete(key);
  cache.set(key, entry);

  while (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
};

const readStored = async key => {
  try {
    const text = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    const stored = text ? JSON.parse(text) : null;
    return stored?.value && stored.savedAt ? stored : null;
  } catch (error) {
    return null;
  }
};

const writeStored = (key, value) => {
  try {
    const text = JSON.stringify({ value, savedAt: Date.now() });
    if (text.length > MAX_STORED_CHARS) return;
    AsyncStorage.setItem(STORAGE_PREFIX + key, text).catch(() => {});
  } catch (error) {
    // storage is only an optimisation
  }
};

// Once per app start: drop old entries and keep the newest MAX_STORED_ENTRIES
let pruned = false;
const pruneStored = async () => {
  if (pruned) return;
  pruned = true;

  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(key =>
      key.startsWith(STORAGE_PREFIX),
    );
    if (keys.length === 0) return;

    const entries = (await AsyncStorage.multiGet(keys)).map(([key, text]) => {
      try {
        return { key, savedAt: JSON.parse(text)?.savedAt || 0 };
      } catch (error) {
        return { key, savedAt: 0 };
      }
    });

    entries.sort((a, b) => b.savedAt - a.savedAt);

    const remove = entries
      .filter(
        (entry, index) =>
          index >= MAX_STORED_ENTRIES ||
          Date.now() - entry.savedAt > STORED_MAX_AGE_MS,
      )
      .map(entry => entry.key);

    if (remove.length) await AsyncStorage.multiRemove(remove);
  } catch (error) {
    // ignore
  }
};

const cached = (key, ttlMs, loader) => {
  const entry = cache.get(key);

  if (entry?.pending) return entry.pending;
  if (entry?.value && entry.expiresAt > Date.now()) {
    return Promise.resolve({ ...entry.value, stale: false });
  }

  const pending = (async () => {
    let previous = entry?.value ? entry : null;

    if (!previous) {
      pruneStored();
      const stored = await readStored(key);

      if (stored) {
        previous = {
          value: stored.value,
          expiresAt: stored.savedAt + ttlFor(stored.value, ttlMs),
        };

        if (previous.expiresAt > Date.now()) {
          remember(key, previous);
          return { ...stored.value, stale: false };
        }
      }
    }

    try {
      const value = await loader();
      remember(key, { value, expiresAt: Date.now() + ttlFor(value, ttlMs) });
      writeStored(key, value);
      return { ...value, stale: false };
    } catch (error) {
      if (previous?.value) {
        remember(key, {
          value: previous.value,
          expiresAt: Date.now() + RETRY_AFTER_FAILURE_MS,
        });
        return { ...previous.value, stale: true };
      }

      cache.delete(key);
      throw error;
    }
  })();

  cache.set(key, { ...entry, pending });

  return pending;
};

export const clearMandiCache = async () => {
  cache.clear();
  rateLimitedUntil = 0;

  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(key =>
      key.startsWith(STORAGE_PREFIX),
    );
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch (error) {
    // ignore
  }
};

/*
|--------------------------------------------------------------------------
| RATE LIMIT
|--------------------------------------------------------------------------
|
| After a 429 nothing is sent to data.gov.in for COOLDOWN_MS (cached
| prices are still served).
|
*/

let rateLimitedUntil = 0;

const rateLimitedError = () =>
  new MandiServiceError(
    429,
    'Mandi service is busy right now. Please try again in a minute.',
    'MANDI_RATE_LIMITED',
  );

export const isMandiRateLimited = () => Date.now() < rateLimitedUntil;

/*
|--------------------------------------------------------------------------
| UPSTREAM (same request CropGen makes)
|--------------------------------------------------------------------------
*/

const fetchPage = async (resource, params) => {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    if (isMandiRateLimited()) throw rateLimitedError();

    try {
      const response = await axios.get(`${BASE_URL}/${resource}`, {
        params: { 'api-key': MANDI_API_KEY, format: 'json', ...params },
        headers: { accept: 'application/json' },
        timeout: REQUEST_TIMEOUT_MS,
      });

      const data = response.data || {};

      if (/rate limit/i.test(String(data.error || data.message || ''))) {
        rateLimitedUntil = Date.now() + COOLDOWN_MS;
        throw rateLimitedError();
      }

      // data.gov.in sometimes answers 200 "No query was recieved" (sic)
      // (and anything without records) -> retry
      if (
        !/no query was rec/i.test(String(data.message || '')) &&
        Array.isArray(data.records)
      ) {
        return data;
      }
    } catch (error) {
      if (error instanceof MandiServiceError) throw error;

      const status = error.response?.status;

      // 429: stop calling for a while, never retry
      if (status === 429) {
        rateLimitedUntil = Date.now() + COOLDOWN_MS;
        throw rateLimitedError();
      }

      // other 4xx: retrying won't help
      if (status && status < 500) break;
    }

    if (attempt < RETRY_DELAYS_MS.length) await sleep(RETRY_DELAYS_MS[attempt]);
  }

  throw new MandiServiceError(
    502,
    'The government mandi price service is not responding. Please try again shortly.',
    'MANDI_UNAVAILABLE',
  );
};

// Every page of a query (up to maxPages); failed later pages mark it truncated
const fetchAll = async (resource, filters, maxPages = MAX_PAGES) => {
  const first = await fetchPage(resource, {
    ...filters,
    limit: PAGE_LIMIT,
    offset: 0,
  });

  const records = [...first.records];
  const total = Number(first.total) || 0;
  const effectivePageSize = first.records.length;
  let truncated = false;

  if (effectivePageSize > 0) {
    for (
      let offset = effectivePageSize, pages = 1;
      offset < total && pages < maxPages;
      offset += effectivePageSize, pages += 1
    ) {
      try {
        const page = await fetchPage(resource, {
          ...filters,
          limit: PAGE_LIMIT,
          offset,
        });
        records.push(...page.records);
      } catch (error) {
        truncated = true;
        break;
      }
    }

    if (records.length < total) truncated = true;
  }

  return { records, truncated };
};

/*
|--------------------------------------------------------------------------
| DATA SETS
|--------------------------------------------------------------------------
*/

const names = crop => [...new Set(crop.commodities)];
const nameKey = crop =>
  names(crop)
    .map(matchKey)
    .sort()
    .join(',');

// Today's prices for a crop. Upstream filters by state/district when given
// so the (small, key-limited) pages hold the rows the user asked for.
const getDailyPrices = (crop, state, district) => {
  const spellings = state ? state.spellings : [null];

  return cached(
    `daily:${nameKey(crop)}:${state ? state.id : 'all'}:${matchKey(district)}`,
    CACHE_MS,
    async () => {
      const results = [];

      for (const name of names(crop)) {
        for (const spelling of spellings) {
          results.push(
            await fetchAll(DAILY_RESOURCE, {
              'filters[commodity]': name,
              ...(spelling ? { 'filters[state]': spelling } : {}),
              ...(district ? { 'filters[district]': district } : {}),
            }),
          );
        }
      }

      return {
        records: commodityMatcher(crop)(
          dedupe(results.flatMap(r => r.records.map(formatRecord))),
        ),
        truncated: results.some(r => r.truncated),
        fetchedAt: new Date().toISOString(),
      };
    },
  );
};

// A finished past day rarely changes; today/yesterday may still be filling in
const dateTtl = govDate => {
  const iso = toIsoDate(govDate);
  return iso && iso < addDaysToKey(todayInIndiaKey(), -1)
    ? PAST_DAY_CACHE_MS
    : CACHE_MS;
};

const getPricesOnDate = (crop, govDate, state) => {
  const spellings = state ? state.spellings : [null];

  return cached(
    `date:${nameKey(crop)}:${govDate}:${state ? state.id : 'all'}`,
    dateTtl(govDate),
    async () => {
      const raw = [];
      let truncated = false;

      for (const name of names(crop)) {
        for (const spelling of spellings) {
          const result = await fetchAll(
            HISTORICAL_RESOURCE,
            {
              'filters[Commodity]': name,
              'filters[Arrival_Date]': govDate,
              ...(spelling ? { 'filters[State]': spelling } : {}),
            },
            5,
          );

          raw.push(...result.records);
          truncated = truncated || result.truncated;
        }
      }

      const isoDate = toIsoDate(govDate);

      return {
        records: commodityMatcher(crop)(
          dedupe(raw.map(formatRecord)).filter(
            r => r.arrivalDateISO === isoDate,
          ),
        ),
        truncated,
        fetchedAt: new Date().toISOString(),
      };
    },
  );
};

const getStateDistricts = state =>
  cached(`districts:${state.id}`, 6 * 60 * 60000, async () => {
    const districts = new Set();

    for (const spelling of state.spellings) {
      const today = await fetchAll(
        DAILY_RESOURCE,
        { 'filters[state]': spelling },
        5,
      );

      today.records
        .map(formatRecord)
        .filter(r => state.keys.has(matchKey(r.state)))
        .forEach(r => r.district && districts.add(r.district));
    }

    if (districts.size === 0) {
      for (const spelling of state.spellings) {
        const page = await fetchPage(HISTORICAL_RESOURCE, {
          'filters[State]': spelling,
          'sort[Arrival_Date]': 'desc',
          limit: PAGE_LIMIT,
          offset: 0,
        });

        page.records
          .map(formatRecord)
          .forEach(r => r.district && districts.add(r.district));
      }
    }

    return {
      districts: [...districts].sort((a, b) => a.localeCompare(b)),
      fetchedAt: new Date().toISOString(),
    };
  });

/*
|--------------------------------------------------------------------------
| SORT + SUMMARY
|--------------------------------------------------------------------------
*/

const SORTS = {
  location: (a, b) =>
    (a.state || '').localeCompare(b.state || '') ||
    (a.district || '').localeCompare(b.district || '') ||
    (a.market || '').localeCompare(b.market || ''),
  price_desc: (a, b) => (b.modalPrice ?? -1) - (a.modalPrice ?? -1),
  price_asc: (a, b) =>
    (a.modalPrice ?? Infinity) - (b.modalPrice ?? Infinity),
  market: (a, b) => (a.market || '').localeCompare(b.market || ''),
  newest: (a, b) =>
    (b.arrivalDateISO || '').localeCompare(a.arrivalDateISO || ''),
};

const summarize = records => {
  const priced = records.filter(r => Number.isFinite(r.modalPrice));

  if (priced.length === 0) {
    return {
      markets: records.length,
      averageModalPrice: null,
      lowestModal: null,
      highestModal: null,
      minPrice: null,
      maxPrice: null,
      latestArrivalDate: null,
    };
  }

  const byModal = [...priced].sort(SORTS.price_asc);
  const pick = r => ({
    market: r.market,
    district: r.district,
    state: r.state,
    modalPrice: r.modalPrice,
  });

  const mins = records.map(r => r.minPrice).filter(Number.isFinite);
  const maxes = records.map(r => r.maxPrice).filter(Number.isFinite);

  const latest = records.reduce(
    (best, r) =>
      (r.arrivalDateISO || '') > (best?.arrivalDateISO || '') ? r : best,
    null,
  );

  return {
    markets: records.length,
    averageModalPrice: Math.round(
      priced.reduce((sum, r) => sum + r.modalPrice, 0) / priced.length,
    ),
    lowestModal: pick(byModal[0]),
    highestModal: pick(byModal[byModal.length - 1]),
    minPrice: mins.length ? Math.min(...mins) : null,
    maxPrice: maxes.length ? Math.max(...maxes) : null,
    latestArrivalDate: latest?.arrivalDate || null,
  };
};

/*
|--------------------------------------------------------------------------
| PUBLIC API (same responses the backend's /api/mandi gave)
|--------------------------------------------------------------------------
*/

export const getMandiCrops = () => ({
  success: true,
  count: MANDI_CROPS.length,
  data: MANDI_CROPS,
});

export const getMandiStates = () => ({
  success: true,
  count: MANDI_STATES.length,
  data: MANDI_STATES,
});

export const getMandiDistricts = async (state, crop) => {
  if (!state) throw new MandiServiceError(400, 'State is required');

  const selectedState = resolveState(state);
  if (!selectedState) throw new MandiServiceError(400, 'Invalid state selected');

  let districts;
  let stale = false;

  if (crop) {
    const selectedCrop = resolveCrop(crop);
    if (!selectedCrop) throw new MandiServiceError(400, 'Invalid crop selected');

    const daily = await getDailyPrices(selectedCrop, selectedState);
    stale = daily.stale;

    districts = [
      ...new Set(
        daily.records
          .filter(r => selectedState.keys.has(matchKey(r.state)))
          .map(r => r.district)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  } else {
    const result = await getStateDistricts(selectedState);
    districts = result.districts;
    stale = result.stale;
  }

  return {
    success: true,
    state: selectedState.name,
    count: districts.length,
    stale,
    data: districts,
  };
};

// Keep a single day: today if present, else the newest day not older
// than oldestAllowed. The live feed can hold a few days at once.
export const pickOneDay = (records, today, oldestAllowed) => {
  const dates = new Set(records.map(r => r.arrivalDateISO).filter(Boolean));

  let day = dates.has(today) ? today : null;
  if (!day) {
    day = [...dates]
      .filter(d => d < today && d >= oldestAllowed)
      .sort()
      .pop();
  }

  return day ? records.filter(r => r.arrivalDateISO === day) : [];
};

export const getMandiRates = async (query = {}) => {
  const { crop, state, district, market, variety, arrivalDate, sort } = query;

  if (!crop) throw new MandiServiceError(400, 'Crop is required');

  const selectedCrop = resolveCrop(crop);
  if (!selectedCrop) throw new MandiServiceError(400, 'Invalid crop selected');

  let selectedState = null;
  if (state) {
    selectedState = resolveState(state);
    if (!selectedState) throw new MandiServiceError(400, 'Invalid state selected');
  }

  let govDate = null;
  if (arrivalDate) {
    govDate = toGovDate(arrivalDate);
    if (!govDate) {
      throw new MandiServiceError(
        400,
        'Arrival date must be YYYY-MM-DD or DD/MM/YYYY',
      );
    }
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 200);

  const districtKey = matchKey(district);
  const marketKey = matchKey(market);
  const varietyKey = matchKey(variety);

  const applyFilters = records =>
    records.filter(
      r =>
        (!selectedState || selectedState.keys.has(matchKey(r.state))) &&
        (!districtKey || matchKey(r.district) === districtKey) &&
        (!marketKey || matchKey(r.market).includes(marketKey)) &&
        (!varietyKey || matchKey(r.variety).includes(varietyKey)),
    );

  const today = todayInIndiaKey();
  const oldestAllowed = addDaysToKey(today, -MAX_AGE_DAYS);

  let source;
  let result;
  let records;

  if (govDate) {
    source = 'historical';
    result = await getPricesOnDate(selectedCrop, govDate, selectedState);
    records = applyFilters(result.records);
  } else {
    source = 'daily';
    result = await getDailyPrices(selectedCrop, selectedState, district);
    records = pickOneDay(applyFilters(result.records), today, oldestAllowed);

    // nothing recent in the live feed: latest earlier day, newest first,
    // never older than MAX_AGE_DAYS (shares the week chart's cache)
    for (
      let day = addDaysToKey(today, -1);
      records.length === 0 && day >= oldestAllowed;
      day = addDaysToKey(day, -1)
    ) {
      source = 'historical_latest';
      result = await getPricesOnDate(
        selectedCrop,
        toGovDate(day),
        selectedState,
      );
      records = applyFilters(result.records);
    }
  }

  const date = records[0]?.arrivalDateISO || null;

  records.sort(SORTS[sort] || SORTS.location);

  const total = records.length;
  const data = records.slice((page - 1) * limit, page * limit);

  return {
    success: true,
    filters: {
      crop: selectedCrop.name,
      cropId: selectedCrop.id,
      commodity: selectedCrop.commodity,
      commodities: selectedCrop.commodities,
      state: selectedState?.name || null,
      district: district || null,
      market: market || null,
      variety: variety || null,
      arrivalDate: govDate,
      sort: SORTS[sort] ? sort : 'location',
    },
    source,
    date,
    isToday: date === today,
    rateLimited: Boolean(result.stale) && isMandiRateLimited(),
    fetchedAt: result.fetchedAt,
    stale: result.stale,
    truncated: result.truncated,
    summary: summarize(records),
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data,
  };
};
