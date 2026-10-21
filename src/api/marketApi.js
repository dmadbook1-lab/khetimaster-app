import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
 * Drop empty values so the backend only sees filters that were set.
 */
const cleanParams = params =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '',
    ),
  );

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
*/

export const getMarketMetaApi = async () => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_META,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| BROWSE LISTINGS
|--------------------------------------------------------------------------
|
| kind, category, search, state, district, taluka, minPrice, maxPrice,
| condition, isOrganic, deliveryAvailable, seller, excludeMine, sort,
| page, limit
|
*/

export const getMarketListingsApi = async (
  params = {},
) => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_LISTINGS,
    {
      params: cleanParams(params),
    },
  );

  return response.data;
};

export const getMyMarketListingsApi = async (
  status = 'all',
) => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_MY_LISTINGS,
    {
      params: {status},
    },
  );

  return response.data;
};

export const getMarketListingByIdApi = async listingId => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_LISTING_BY_ID(listingId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| SELLER: CREATE / UPDATE / STATUS / DELETE
|--------------------------------------------------------------------------
*/

export const createMarketListingApi = async listingData => {
  const response = await apiClient.post(
    API_ENDPOINTS.MARKET_LISTINGS,
    listingData,
  );

  return response.data;
};

export const updateMarketListingApi = async (
  listingId,
  listingData,
) => {
  const response = await apiClient.put(
    API_ENDPOINTS.MARKET_LISTING_BY_ID(listingId),
    listingData,
  );

  return response.data;
};

// status: ACTIVE | PAUSED
export const updateMarketListingStatusApi = async (
  listingId,
  status,
) => {
  const response = await apiClient.patch(
    API_ENDPOINTS.MARKET_LISTING_STATUS(listingId),
    {status},
  );

  return response.data;
};

export const deleteMarketListingApi = async listingId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.MARKET_LISTING_BY_ID(listingId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| SAVED LISTINGS
|--------------------------------------------------------------------------
*/

export const getSavedMarketListingsApi = async () => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_SAVED,
  );

  return response.data;
};

export const saveMarketListingApi = async listingId => {
  const response = await apiClient.post(
    API_ENDPOINTS.MARKET_LISTING_SAVE(listingId),
  );

  return response.data;
};

export const unsaveMarketListingApi = async listingId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.MARKET_LISTING_SAVE(listingId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| SELLER PROFILE
|--------------------------------------------------------------------------
*/

export const getMarketSellerProfileApi = async userId => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_SELLER(userId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DEALS
|--------------------------------------------------------------------------
*/

/*
 * {listingId, quantity, pricePerUnit, message, fulfilment, deliveryAddress}
 */
export const createMarketDealApi = async dealData => {
  const response = await apiClient.post(
    API_ENDPOINTS.MARKET_DEALS,
    dealData,
  );

  return response.data;
};

/*
 * role: buying | selling
 * status: PENDING | ACCEPTED | COMPLETED | REJECTED | CANCELLED | open | all
 */
export const getMyMarketDealsApi = async (
  params = {},
) => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_DEALS,
    {
      params: cleanParams(params),
    },
  );

  return response.data;
};

export const getMarketDealByIdApi = async dealId => {
  const response = await apiClient.get(
    API_ENDPOINTS.MARKET_DEAL_BY_ID(dealId),
  );

  return response.data;
};

/*
 * action: counter | accept | reject | cancel | complete
 *
 * counter  {pricePerUnit, quantity, message}
 * accept   {message}
 * reject   {reason}
 * cancel   {reason}
 * complete {message}
 */
export const updateMarketDealApi = async (
  dealId,
  action,
  body = {},
) => {
  const response = await apiClient.patch(
    API_ENDPOINTS.MARKET_DEAL_ACTION(dealId, action),
    body,
  );

  return response.data;
};

export const reviewMarketDealApi = async (
  dealId,
  {rating, comment},
) => {
  const response = await apiClient.post(
    API_ENDPOINTS.MARKET_DEAL_REVIEW(dealId),
    {rating, comment},
  );

  return response.data;
};
