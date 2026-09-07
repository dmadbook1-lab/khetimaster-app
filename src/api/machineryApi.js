import apiClient from './client';

/*
|--------------------------------------------------------------------------
| CREATE MACHINERY
|--------------------------------------------------------------------------
*/

export const createMachineryApi = async data => {
  const response = await apiClient.post(
    '/api/machinery',
    data,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ALL MACHINERY
|--------------------------------------------------------------------------
*/

export const getAllMachineryApi = async (
  params = {},
) => {
  const response = await apiClient.get(
    '/api/machinery',
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MY MACHINERY
|--------------------------------------------------------------------------
*/

export const getMyMachineryApi = async (
  params = {},
) => {
  const response = await apiClient.get(
    '/api/machinery/my-machinery',
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MACHINERY BY ID
|--------------------------------------------------------------------------
*/

export const getMachineryByIdApi = async id => {
  const response = await apiClient.get(
    `/api/machinery/${id}`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE MACHINERY
|--------------------------------------------------------------------------
*/

export const updateMachineryApi = async (
  id,
  data,
) => {
  const response = await apiClient.put(
    `/api/machinery/${id}`,
    data,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DEACTIVATE MACHINERY
|--------------------------------------------------------------------------
*/

export const deactivateMachineryApi = async id => {
  const response = await apiClient.delete(
    `/api/machinery/${id}`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACTIVATE MACHINERY
|--------------------------------------------------------------------------
*/

export const activateMachineryApi = async id => {
  const response = await apiClient.patch(
    `/api/machinery/${id}/activate`,
  );

  return response.data;
};