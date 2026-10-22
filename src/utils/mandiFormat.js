import { addDaysToKey, formatDay } from './indiaSchedule';
import { formatAmount } from './marketFormat';

/*
|--------------------------------------------------------------------------
| MANDI HELPERS
|--------------------------------------------------------------------------
|
| Prices from /api/mandi are rupees per quintal (100 kg).
|
*/

export const CATEGORY_ORDER = [
  'Vegetables',
  'Cereals',
  'Pulses',
  'Oilseeds',
  'Cash Crops',
  'Spices',
  'Fruits',
];

export const isPrice = value => Number.isFinite(value) && value !== null;

export const formatQuintal = value =>
  isPrice(value) ? `₹${formatAmount(Math.round(value))}` : '—';

/*
 * ₹2,450/qtl -> '₹24.5/kg'
 */
export const formatPerKg = value => {
  if (!isPrice(value)) return '—';
  const perKg = value / 100;
  return `₹${
    perKg >= 100 ? Math.round(perKg) : Math.round(perKg * 10) / 10
  }/kg`;
};

/*
 * Short axis label: 2450 -> '2.4k', 120000 -> '1.2L'
 */
export const shortPrice = value => {
  if (!isPrice(value)) return '';
  if (value >= 100000) return `${Math.round(value / 10000) / 10}L`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return String(Math.round(value));
};

/*
 * Percentage difference of value against base: (2600, 2000) -> 30
 */
export const percentDiff = (value, base) => {
  if (!isPrice(value) || !isPrice(base) || base === 0) return null;
  return Math.round(((value - base) / base) * 100);
};

/*
 * Crops grouped for the picker: [{category, crops}] in CATEGORY_ORDER.
 */
export const groupCrops = crops => {
  const groups = new Map();

  for (const crop of crops || []) {
    const category = crop.category || 'Other';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(crop);
  }

  const order = category => {
    const index = CATEGORY_ORDER.indexOf(category);
    return index === -1 ? CATEGORY_ORDER.length : index;
  };

  return [...groups.entries()]
    .sort(([a], [b]) => order(a) - order(b))
    .map(([category, list]) => ({ category, crops: list }));
};

/*
 * Crops matching a search (name, official name or alias).
 */
export const searchCrops = (crops, text) => {
  const query = String(text || '')
    .trim()
    .toLowerCase();
  if (!query) return crops || [];

  return (crops || []).filter(crop =>
    [crop.name, crop.commodity, ...(crop.aliases || [])].some(value =>
      String(value || '')
        .toLowerCase()
        .includes(query),
    ),
  );
};

/*
|--------------------------------------------------------------------------
| SCOPE
|--------------------------------------------------------------------------
|
| district -> state + district, state -> state, india -> nothing.
|
*/

export const scopeParams = (scope, location) => {
  if (scope === 'district' && location?.state && location?.district) {
    return { state: location.state, district: location.district };
  }
  if ((scope === 'district' || scope === 'state') && location?.state) {
    return { state: location.state };
  }
  return {};
};

export const scopeLabel = (scope, location) => {
  if (scope === 'district' && location?.district) return location.district;
  if (scope !== 'india' && location?.state) return location.state;
  return 'All India';
};

/*
 * Key for cached summaries.
 */
export const summaryKey = ({ crop, state, district, arrivalDate }) =>
  [crop, state || '', district || '', arrivalDate || ''].join('|');

/*
 * The last `days` dates ending yesterday, oldest first
 * (today's prices come from the live dataset).
 */
export const trendDates = (todayKey, days = 7) =>
  Array.from({ length: days }, (_, index) =>
    addDaysToKey(todayKey, index - days),
  );

export const shortDay = key => formatDay(key, { weekday: false, year: false });

/*
|--------------------------------------------------------------------------
| MARKET HIGHLIGHTS
|--------------------------------------------------------------------------
*/

/*
 * Records with a modal price, highest first, one per market (the best
 * variety). For the comparison chart.
 */
export const topMarkets = (records, count = 10) => {
  const best = new Map();

  for (const record of records || []) {
    if (!isPrice(record.modalPrice)) continue;
    const key = `${record.market}|${record.district}|${record.state}`;
    const current = best.get(key);
    if (!current || record.modalPrice > current.modalPrice) {
      best.set(key, record);
    }
  }

  return [...best.values()]
    .sort((a, b) => b.modalPrice - a.modalPrice)
    .slice(0, count);
};

export const recordKey = record =>
  [
    record.state,
    record.district,
    record.market,
    record.variety,
    record.grade,
    record.arrivalDate,
  ].join('|');

/*
 * How much more (₹/qtl and %) the best market pays than the average.
 */
export const bestGain = summary => {
  const best = summary?.highestModal?.modalPrice;
  const average = summary?.averageModalPrice;
  if (!isPrice(best) || !isPrice(average)) return null;

  return { amount: best - average, percent: percentDiff(best, average) };
};
