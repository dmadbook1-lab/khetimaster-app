import apiClient from './client';

/*
|--------------------------------------------------------------------------
| CREATE DOCTOR CONSULTATION
|--------------------------------------------------------------------------
|
| POST /api/doctor-consultations
|
*/

export const createDoctorConsultationApi = async (
  consultationData,
) => {
  const response = await apiClient.post(
    '/api/doctor-consultations',
    consultationData,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MY CONSULTATIONS
|--------------------------------------------------------------------------
|
| GET /api/doctor-consultations/my
|
| Used by the farmer to see consultations they created.
|
| Supported backend query parameters:
| - page
| - limit
| - status
|
*/

export const getMyConsultationsApi = async (
  params = {},
) => {
  const response = await apiClient.get(
    '/api/doctor-consultations/my',
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET DOCTOR REQUESTS
|--------------------------------------------------------------------------
|
| GET /api/doctor-consultations/requests
|
| Used by a doctor to see consultation requests
| received from farmers.
|
| Supported backend query parameters:
| - page
| - limit
| - status
|
*/

export const getDoctorRequestsApi = async (
  params = {},
) => {
  const response = await apiClient.get(
    '/api/doctor-consultations/requests',
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET CONSULTATION BY ID
|--------------------------------------------------------------------------
|
| GET /api/doctor-consultations/:id
|
*/

export const getDoctorConsultationByIdApi = async (
  consultationId,
) => {
  const response = await apiClient.get(
    `/api/doctor-consultations/${consultationId}`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACCEPT CONSULTATION
|--------------------------------------------------------------------------
|
| PATCH /api/doctor-consultations/:id/accept
|
*/

export const acceptDoctorConsultationApi = async (
  consultationId,
) => {
  const response = await apiClient.patch(
    `/api/doctor-consultations/${consultationId}/accept`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| REJECT CONSULTATION
|--------------------------------------------------------------------------
|
| PATCH /api/doctor-consultations/:id/reject
|
| Backend accepts cancellationReason from req.body.
|
*/

export const rejectDoctorConsultationApi = async (
  consultationId,
  data = {},
) => {
  const response = await apiClient.patch(
    `/api/doctor-consultations/${consultationId}/reject`,
    data,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CANCEL CONSULTATION
|--------------------------------------------------------------------------
|
| PATCH /api/doctor-consultations/:id/cancel
|
| Backend accepts cancellationReason from req.body.
|
*/

export const cancelDoctorConsultationApi = async (
  consultationId,
  data = {},
) => {
  const response = await apiClient.patch(
    `/api/doctor-consultations/${consultationId}/cancel`,
    data,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| COMPLETE CONSULTATION
|--------------------------------------------------------------------------
|
| PATCH /api/doctor-consultations/:id/complete
|
| Backend can receive:
| - doctorNotes
| - diagnosis
| - prescription
|
*/

export const completeDoctorConsultationApi = async (
  consultationId,
  data = {},
) => {
  const response = await apiClient.patch(
    `/api/doctor-consultations/${consultationId}/complete`,
    data,
  );

  return response.data;
};