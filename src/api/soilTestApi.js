import apiClient from './client';

/*
 * {firstName, lastName, mobileNo, emailId?, address, city, state, pincode,
 *  farmSize, farmSizeUnit: 'Acres' | 'Hectares', previousCrop, nextCrop,
 *  farmField?, comment?}
 */
export const createSoilTestApi = async data =>
  (await apiClient.post('/api/soil-tests', data)).data;

export const getMySoilTestsApi = async () =>
  (await apiClient.get('/api/soil-tests/my')).data;

// Opening a pending test also lets the server check for a finished report.
export const getSoilTestApi = async id =>
  (await apiClient.get(`/api/soil-tests/${id}`)).data;

export const refreshSoilTestApi = async id =>
  (await apiClient.post(`/api/soil-tests/${id}/refresh`)).data;
