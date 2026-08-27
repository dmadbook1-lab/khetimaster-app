import apiClient from './client';
export const createLabourerApi = async labourerData => {
  const response = await apiClient.post('/api/labourers', labourerData);
  return response.data;
};
export const getAllLabourersApi = async params => {
  const response = await apiClient.get('/api/labourers', {
    params,
  });
  return response.data;
};
export const getMyLabourerProfileApi = async () => {
  const response = await apiClient.get('/api/labourers/me');
  return response.data;
};
export const getLabourerByIdApi = async labourerId => {
  const response = await apiClient.get(`/api/labourers/${labourerId}`);
  return response.data;
};
export const updateMyLabourerProfileApi = async labourerData => {
  const response = await apiClient.put('/api/labourers/me', labourerData);
  return response.data;
};
export const deactivateMyLabourerProfileApi = async () => {
  const response = await apiClient.delete('/api/labourers/me');
  return response.data;
};
export const activateMyLabourerProfileApi = async () => {
  const response = await apiClient.patch('/api/labourers/me/activate');
  return response.data;
};
