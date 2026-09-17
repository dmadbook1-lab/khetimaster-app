import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| GET LATEST AGRICULTURE ARTICLES
|--------------------------------------------------------------------------
*/

export const getLatestArticlesApi = async ({
  limit = 20,
  category,
} = {}) => {
  const params = {
    limit,
  };

  if (category) {
    params.category = category;
  }

  const response = await apiClient.get(
    API_ENDPOINTS.LATEST_ARTICLES,
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ARTICLE STATISTICS
|--------------------------------------------------------------------------
*/

export const getArticleStatsApi = async () => {
  const response = await apiClient.get(
    API_ENDPOINTS.ARTICLE_STATS,
  );

  return response.data;
};