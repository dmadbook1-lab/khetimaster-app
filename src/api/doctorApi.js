import apiClient from './client';

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
|
| doctorTypes, consultationTypes, specializations (by doctor type),
| problemTypes (by consultation type), animalTypes, languages, feeTypes,
| availabilityOptions, paymentMethods, defaultSlotMinutes, maxImages
|
*/

export const getDoctorMetaApi = async () => {
  const response = await apiClient.get('/api/doctors/meta');

  return response.data;
};

/*
|--------------------------------------------------------------------------
| FIND DOCTORS
|--------------------------------------------------------------------------
|
| search, doctorType, specialization, language, state, district,
| availability (available | unavailable | busy | all), minFee, maxFee,
| freeOnly, minRating, sort (rating | fee_asc | experience | newest),
| page, limit. Empty values are left out.
|
*/

export const getAllDoctorsApi = async (params = {}) => {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

  const response = await apiClient.get('/api/doctors', { params: cleaned });

  return response.data;
};

/*
 * Includes isOwner, bookedSlots (next 14 days), myActiveConsultation
 * and recentReviews. No phone or email.
 */
export const getDoctorByIdApi = async doctorId => {
  const response = await apiClient.get(`/api/doctors/${doctorId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| MY DOCTOR PROFILE
|--------------------------------------------------------------------------
|
| /me includes pendingRequests and upcomingConsultations.
|
*/

export const createDoctorApi = async doctorData => {
  const response = await apiClient.post('/api/doctors', doctorData);

  return response.data;
};

export const getMyDoctorProfileApi = async () => {
  const response = await apiClient.get('/api/doctors/me');

  return response.data;
};

export const updateMyDoctorProfileApi = async doctorData => {
  const response = await apiClient.put('/api/doctors/me', doctorData);

  return response.data;
};

// refused while accepted consultations are upcoming
export const deactivateMyDoctorProfileApi = async () => {
  const response = await apiClient.patch('/api/doctors/me/deactivate');

  return response.data;
};

export const activateMyDoctorProfileApi = async () => {
  const response = await apiClient.patch('/api/doctors/me/activate');

  return response.data;
};
