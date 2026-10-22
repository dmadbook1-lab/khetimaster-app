import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
|
| {categories, orderStatuses, delivery: {fee, freeAbove}, paymentMethods}
|
*/

export const getNurseryMetaApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.NURSERY_META);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET PLANTS
|--------------------------------------------------------------------------
|
| category, search, state, district, minPrice, maxPrice, seller,
| sort (newest | price_asc | price_desc | rating | popular), page, limit
|
| Empty values are left out.
|
*/

export const getNurseryPlantsApi = async (params = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

  const response = await apiClient.get(API_ENDPOINTS.NURSERY_PLANTS, {
    params: cleaned,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PLANT
|--------------------------------------------------------------------------
|
| Includes inStock and recentReviews.
|
*/

export const getNurseryPlantByIdApi = async plantId => {
  const response = await apiClient.get(
    API_ENDPOINTS.NURSERY_PLANT_BY_ID(plantId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CATEGORIES IN USE
|--------------------------------------------------------------------------
*/

export const getNurseryCategoriesApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.NURSERY_CATEGORIES);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| SELLER LISTINGS
|--------------------------------------------------------------------------
|
| {name, category, description, images, price, quantity, state,
|  district, isActive}. State and district default to the profile.
|
*/

export const createNurseryPlantApi = async plantData => {
  const response = await apiClient.post(
    API_ENDPOINTS.NURSERY_CREATE_PLANT,
    plantData,
  );

  return response.data;
};

// each listing includes pendingOrders
export const getMyNurseryListingsApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.NURSERY_MY_LISTINGS);

  return response.data;
};

export const updateNurseryPlantApi = async (plantId, plantData) => {
  const response = await apiClient.put(
    API_ENDPOINTS.NURSERY_UPDATE_PLANT(plantId),
    plantData,
  );

  return response.data;
};

// soft delete: placed orders are not affected
export const deleteNurseryPlantApi = async plantId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.NURSERY_DELETE_PLANT(plantId),
  );

  return response.data;
};
