import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| GET NURSERY PLANTS
|--------------------------------------------------------------------------
*/

export const getNurseryPlantsApi = async ({
  category = '',
  search = '',
  state = '',
  district = '',
  minPrice = '',
  maxPrice = '',
  page = 1,
  limit = 20,
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (category) {
    params.category = category;
  }

  if (search) {
    params.search = search;
  }

  if (state) {
    params.state = state;
  }

  if (district) {
    params.district = district;
  }

  if (minPrice !== '') {
    params.minPrice = minPrice;
  }

  if (maxPrice !== '') {
    params.maxPrice = maxPrice;
  }

  const response = await apiClient.get(
    API_ENDPOINTS.NURSERY_PLANTS,
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PLANT
|--------------------------------------------------------------------------
*/

export const getNurseryPlantByIdApi =
  async plantId => {
    const response =
      await apiClient.get(
        API_ENDPOINTS.NURSERY_PLANT_BY_ID(
          plantId,
        ),
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET CATEGORIES
|--------------------------------------------------------------------------
*/

export const getNurseryCategoriesApi =
  async () => {
    const response =
      await apiClient.get(
        API_ENDPOINTS.NURSERY_CATEGORIES,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| CREATE PLANT LISTING
|--------------------------------------------------------------------------
*/

export const createNurseryPlantApi =
  async plantData => {
    const response =
      await apiClient.post(
        API_ENDPOINTS.NURSERY_CREATE_PLANT,
        plantData,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET MY LISTINGS
|--------------------------------------------------------------------------
*/

export const getMyNurseryListingsApi =
  async () => {
    const response =
      await apiClient.get(
        API_ENDPOINTS.NURSERY_MY_LISTINGS,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| UPDATE PLANT
|--------------------------------------------------------------------------
*/

export const updateNurseryPlantApi =
  async (plantId, plantData) => {
    const response =
      await apiClient.put(
        API_ENDPOINTS.NURSERY_UPDATE_PLANT(
          plantId,
        ),
        plantData,
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| DELETE PLANT
|--------------------------------------------------------------------------
*/

export const deleteNurseryPlantApi =
  async plantId => {
    const response =
      await apiClient.delete(
        API_ENDPOINTS.NURSERY_DELETE_PLANT(
          plantId,
        ),
      );

    return response.data;
  };