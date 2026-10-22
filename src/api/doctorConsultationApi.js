import apiClient from './client';

const BASE = '/api/doctor-consultations';

/*
|--------------------------------------------------------------------------
| CREATE CONSULTATION (FARMER)
|--------------------------------------------------------------------------
|
| {doctorId, consultationDate: 'YYYY-MM-DD', startTime, endTime,
|  consultationType, problemType, symptoms, description, animalType,
|  animalCount, animalAge, cropName, images, state, district, village,
|  address, paymentMethod, farmerNotes}
|
| The fee comes from the doctor's profile.
|
*/

export const createDoctorConsultationApi = async consultationData => {
  const response = await apiClient.post(BASE, consultationData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| LISTS
|--------------------------------------------------------------------------
|
| params: {status: active | pending | accepted | completed | rejected |
|          cancelled | all, page, limit}; requests also take date.
|
*/

export const getMyConsultationsApi = async (params = {}) => {
  const response = await apiClient.get(`${BASE}/my`, { params });

  return response.data;
};

export const getDoctorRequestsApi = async (params = {}) => {
  const response = await apiClient.get(`${BASE}/requests`, { params });

  return response.data;
};

export const getDoctorConsultationByIdApi = async consultationId => {
  const response = await apiClient.get(`${BASE}/${consultationId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const acceptDoctorConsultationApi = async consultationId => {
  const response = await apiClient.patch(`${BASE}/${consultationId}/accept`);

  return response.data;
};

export const rejectDoctorConsultationApi = async (
  consultationId,
  reason = '',
) => {
  const response = await apiClient.patch(`${BASE}/${consultationId}/reject`, {
    reason,
  });

  return response.data;
};

export const cancelDoctorConsultationApi = async (
  consultationId,
  reason = '',
) => {
  const response = await apiClient.patch(`${BASE}/${consultationId}/cancel`, {
    reason,
  });

  return response.data;
};

/*
 * On or after the consultation date. The doctor may send
 * {doctorNotes, diagnosis, prescription, followUpDate}.
 */
export const completeDoctorConsultationApi = async (
  consultationId,
  outcome = {},
) => {
  const response = await apiClient.patch(
    `${BASE}/${consultationId}/complete`,
    outcome,
  );

  return response.data;
};

// doctor: add or correct the outcome on accepted / completed ones
export const updateConsultationNotesApi = async (consultationId, outcome) => {
  const response = await apiClient.patch(
    `${BASE}/${consultationId}/notes`,
    outcome,
  );

  return response.data;
};

export const reviewDoctorConsultationApi = async (
  consultationId,
  { rating, comment },
) => {
  const response = await apiClient.post(`${BASE}/${consultationId}/review`, {
    rating,
    comment,
  });

  return response.data;
};
