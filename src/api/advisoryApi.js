import api from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| SMART ADVISORY API
|--------------------------------------------------------------------------
|
| Backend:
|
| GET   /api/advisory/:fieldId
| POST  /api/advisory/:fieldId/generate
| GET   /api/advisory/:fieldId/conditions
| PATCH /api/advisory/activity/:advisoryId/:activityType
|
|--------------------------------------------------------------------------
*/

export const getFarmAdvisoryApi = async (fieldId, language = 'en') => {
  if (!fieldId) {
    throw new Error('Farm field ID is required');
  }

  const response = await api.get(API_ENDPOINTS.ADVISORY_BY_FIELD(fieldId), {
    params: {lang: language},
  });

  return response.data;
};

export const regenerateFarmAdvisoryApi = async (fieldId, language = 'en') => {
  if (!fieldId) {
    throw new Error('Farm field ID is required');
  }

  const response = await api.post(
    API_ENDPOINTS.ADVISORY_GENERATE(fieldId),
    {},
    {params: {lang: language}},
  );

  return response.data;
};

export const getFieldConditionsApi = async fieldId => {
  if (!fieldId) {
    throw new Error('Farm field ID is required');
  }

  const response = await api.get(API_ENDPOINTS.ADVISORY_CONDITIONS(fieldId));

  return response.data;
};

export const updateActivityProgressApi = async (
  advisoryId,
  activityType,
  progress,
) => {
  if (!advisoryId || !activityType) {
    throw new Error('Advisory ID and activity type are required');
  }

  const response = await api.patch(
    API_ENDPOINTS.ADVISORY_ACTIVITY_PROGRESS(advisoryId, activityType),
    {progress},
  );

  return response.data;
};
