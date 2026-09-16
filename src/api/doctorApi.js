import apiClient from './client';

/*
|--------------------------------------------------------------------------
| CREATE DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const createDoctorApi = async (doctorData) => {
  const response = await apiClient.post('/api/doctors', doctorData);
  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ALL DOCTORS
|--------------------------------------------------------------------------
*/

export const getAllDoctorsApi = async (params = {}) => {
  const response = await apiClient.get('/api/doctors', {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MY DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const getMyDoctorProfileApi = async () => {
  const response = await apiClient.get('/api/doctors/me');
  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET DOCTOR BY ID
|--------------------------------------------------------------------------
*/

export const getDoctorByIdApi = async (doctorId) => {
  const response = await apiClient.get(`/api/doctors/${doctorId}`);
  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE MY DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const updateMyDoctorProfileApi = async (doctorData) => {
  const response = await apiClient.put('/api/doctors/me', doctorData);
  return response.data;
};

/*
|--------------------------------------------------------------------------
| DEACTIVATE MY DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const deactivateMyDoctorProfileApi = async () => {
  const response = await apiClient.patch(
    '/api/doctors/me/deactivate',
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACTIVATE MY DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const activateMyDoctorProfileApi = async () => {
  const response = await apiClient.patch(
    '/api/doctors/me/activate',
  );

  return response.data;
};