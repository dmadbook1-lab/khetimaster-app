import apiClient from './client';
import API_ENDPOINTS from './endpoints';

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
  const response = await apiClient.get(API_ENDPOINTS.MANDI_CROPS);

  return response.data;
};

export const getMandiStatesApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.MANDI_STATES);

  return response.data;
};

export const getMandiDistrictsApi = async (state, crop) => {
  const response = await apiClient.get(API_ENDPOINTS.MANDI_DISTRICTS, {
    params: clean({ state, crop }),
  });

  return response.data;
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
| Response: {filters, source, fetchedAt, stale, truncated, summary,
|            count, total, page, pages, data}
|
| The data.gov.in key stays on the server.
|
*/

export const getMandiRatesApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.MANDI_RATES, {
    params: clean(params),
  });

  return response.data;
};
