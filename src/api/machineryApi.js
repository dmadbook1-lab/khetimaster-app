import apiClient from './client';

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
|
| categories, implements, fuelTypes, driveTypes, enginePowerUnits,
| availabilityOptions, pricingTypes, customPriceUnits, paymentMethods,
| maxBookingDays, maxBookingHours
|
*/

export const getMachineryMetaApi = async () => {
  const response = await apiClient.get('/api/machinery/meta');

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CREATE MACHINERY
|--------------------------------------------------------------------------
*/

export const createMachineryApi = async data => {
  const response = await apiClient.post('/api/machinery', data);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET ALL MACHINERY
|--------------------------------------------------------------------------
|
| search, category, state, district, village, availability, implement,
| fuelType, driveType, maxHourly, maxDaily, minRating, excludeMine,
| sort (newest | rating | hourly_asc | daily_asc), page, limit
|
*/

export const getAllMachineryApi = async (params = {}) => {
  const response = await apiClient.get('/api/machinery', {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MY MACHINERY
|--------------------------------------------------------------------------
|
| Each machine includes pendingRequests.
|
*/

export const getMyMachineryApi = async () => {
  const response = await apiClient.get('/api/machinery/my-machinery');

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MACHINERY BY ID
|--------------------------------------------------------------------------
|
| Includes isOwner, bookedSlots, myActiveBooking and recentReviews.
|
*/

export const getMachineryByIdApi = async id => {
  const response = await apiClient.get(`/api/machinery/${id}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE MACHINERY
|--------------------------------------------------------------------------
*/

export const updateMachineryApi = async (id, data) => {
  const response = await apiClient.put(`/api/machinery/${id}`, data);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DEACTIVATE / ACTIVATE MACHINERY
|--------------------------------------------------------------------------
*/

export const deactivateMachineryApi = async id => {
  const response = await apiClient.delete(`/api/machinery/${id}`);

  return response.data;
};

export const activateMachineryApi = async id => {
  const response = await apiClient.patch(`/api/machinery/${id}/activate`);

  return response.data;
};
