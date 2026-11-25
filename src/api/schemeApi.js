import apiClient from './client';
import API_ENDPOINTS from './endpoints';

export const getSchemesApi = async (lang = 'en') => {
  const response = await apiClient.get(API_ENDPOINTS.SCHEMES, {
    params: {lang},
  });
  return response.data;
};

export const getSchemeStatsApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.SCHEMES_STATS);
  return response.data;
};
