import api from './client';
import API_ENDPOINTS from './endpoints';

/*
|--------------------------------------------------------------------------
| FARM FIELD API
|--------------------------------------------------------------------------
|
| Backend:
|
| POST   /api/field/add-field/:userId
| GET    /api/field/user/:userId
| GET    /api/field/:fieldId
| PUT    /api/field/:fieldId
| DELETE /api/field/:fieldId
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| ADD FARM FIELD
|--------------------------------------------------------------------------
*/

export const addFarmFieldApi = async (
  userId,
  farmData,
) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!farmData) {
    throw new Error('Farm field data is required');
  }

  const response = await api.post(
    API_ENDPOINTS.FARM_FIELD_ADD(userId),
    farmData,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ALL FARMS OF USER
|--------------------------------------------------------------------------
*/

export const getUserFarmFieldsApi = async (
  userId,
) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const response = await api.get(
    API_ENDPOINTS.FARM_FIELDS_BY_USER(userId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE FARM
|--------------------------------------------------------------------------
*/

export const getFarmFieldApi = async (
  fieldId,
) => {
  if (!fieldId) {
    throw new Error('Farm field ID is required');
  }

  const response = await api.get(
    API_ENDPOINTS.FARM_FIELD_BY_ID(fieldId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE FARM
|--------------------------------------------------------------------------
*/

export const updateFarmFieldApi = async (
  fieldId,
  farmData,
) => {
  if (!fieldId) {
    throw new Error('Farm field ID is required');
  }

  if (!farmData) {
    throw new Error('Farm field data is required');
  }

  const response = await api.put(
    API_ENDPOINTS.FARM_FIELD_UPDATE(fieldId),
    farmData,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DELETE FARM
|--------------------------------------------------------------------------
*/

export const deleteFarmFieldApi = async (
  fieldId,
) => {
  if (!fieldId) {
    throw new Error('Farm field ID is required');
  }

  const response = await api.delete(
    API_ENDPOINTS.FARM_FIELD_DELETE(fieldId),
  );

  return response.data;
};