import {
  getMandiCrops,
  getMandiStates,
  getMandiDistricts,
  getMandiRates,
} from './mandiService';

const clean = params =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

/*
|--------------------------------------------------------------------------
| CROPS / STATES / DISTRICTS
|--------------------------------------------------------------------------
|
| crops: [{id, name, commodity, commodities, aliases, category}]
| states: [{id, name, aliases}]
| districts: names that report prices (optionally for one crop today)
|
*/

export const getMandiCropsApi = async () => {
  return getMandiCrops();
};

export const getMandiStatesApi = async () => {
  return getMandiStates();
};

export const getMandiDistrictsApi = async (state, crop) => {
  return getMandiDistricts(state, crop);
};

/*
|--------------------------------------------------------------------------
| RATES
|--------------------------------------------------------------------------
|
| params: crop (required), state, district, market, variety,
| arrivalDate (YYYY-MM-DD), sort (location | price_desc | price_asc |
| market | newest), page, limit (max 200)
|
| Response: {filters, source, date, isToday, rateLimited, fetchedAt,
|            stale, truncated, summary, count, total, page, pages, data}
|
| data holds ONE day only: today (IST) or, if nothing is reported yet,
| the latest day within the last 7 (isToday: false). date is null when
| there are no prices.
|
| Fetched straight from data.gov.in by ./mandiService (not our backend).
|
*/

export const getMandiRatesApi = async (params = {}) => {
  return getMandiRates(clean(params));
};
