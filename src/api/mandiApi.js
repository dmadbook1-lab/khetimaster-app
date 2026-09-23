import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| GET MANDI CROPS
|--------------------------------------------------------------------------
*/

export const getMandiCropsApi = async () => {
  const response =
    await apiClient.get(
      API_ENDPOINTS.MANDI_CROPS,
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MANDI STATES
|--------------------------------------------------------------------------
*/

export const getMandiStatesApi = async () => {
  const response =
    await apiClient.get(
      API_ENDPOINTS.MANDI_STATES,
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MANDI DISTRICTS
|--------------------------------------------------------------------------
*/

export const getMandiDistrictsApi =
  async state => {
    const response =
      await apiClient.get(
        API_ENDPOINTS.MANDI_DISTRICTS,
        {
          params: {
            state,
          },
        },
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET MANDI RATES
|--------------------------------------------------------------------------
*/

export const getMandiRatesApi = async ({
  state,
  district,
  crop,
  arrivalDate = '',
  limit = 100,
}) => {
  const params = {
    state,
    district,
    crop,
    limit,
  };

  if (arrivalDate) {
    params.arrivalDate =
      arrivalDate;
  }

  const response =
    await apiClient.get(
      API_ENDPOINTS.MANDI_RATES,
      {
        params,
      },
    );

  return response.data;
};