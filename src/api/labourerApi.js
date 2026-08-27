import apiClient from './client';

// ============================================================
// CREATE LABOURER PROFILE
// POST /api/labourers
// ============================================================

export const createLabourerApi = async labourerData => {
  const response = await apiClient.post(
    '/api/labourers',
    labourerData,
  );

  return response.data;
};

// ============================================================
// GET ALL LABOURERS
// GET /api/labourers
// ============================================================

export const getAllLabourersApi = async params => {
  const response = await apiClient.get(
    '/api/labourers',
    {
      params,
    },
  );

  return response.data;
};

// ============================================================
// GET MY LABOURER PROFILE
// GET /api/labourers/me
// ============================================================

export const getMyLabourerProfileApi = async () => {
  const response = await apiClient.get(
    '/api/labourers/me',
  );

  return response.data;
};

// ============================================================
// GET SINGLE LABOURER
// GET /api/labourers/:id
// ============================================================

export const getLabourerByIdApi = async labourerId => {
  const response = await apiClient.get(
    `/api/labourers/${labourerId}`,
  );

  return response.data;
};

// ============================================================
// UPDATE MY LABOURER PROFILE
// PUT /api/labourers/me
// ============================================================

export const updateMyLabourerProfileApi =
  async labourerData => {
    const response = await apiClient.put(
      '/api/labourers/me',
      labourerData,
    );

    return response.data;
  };

// ============================================================
// DEACTIVATE MY LABOURER PROFILE
// DELETE /api/labourers/me
// ============================================================

export const deactivateMyLabourerProfileApi =
  async () => {
    const response = await apiClient.delete(
      '/api/labourers/me',
    );

    return response.data;
  };

// ============================================================
// ACTIVATE MY LABOURER PROFILE
// PATCH /api/labourers/me/activate
// ============================================================

export const activateMyLabourerProfileApi =
  async () => {
    const response = await apiClient.patch(
      '/api/labourers/me/activate',
    );

    return response.data;
  };