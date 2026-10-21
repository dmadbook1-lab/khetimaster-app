import apiClient from './client';

/*
|--------------------------------------------------------------------------
| CREATE MACHINERY BOOKING
|--------------------------------------------------------------------------
|
| {machinery, bookingDate: 'YYYY-MM-DD', startTime, endTime, workType,
|  pricingType: hourly | daily | custom, duration, customRateId,
|  selectedImplement, state, district, village, address, farmSize, crop,
|  paymentMethod, farmerNotes}
|
| Prices are calculated by the server from the machine's rates.
|
*/

export const createMachineryBookingApi = async data => {
  const response = await apiClient.post('/api/machinery-bookings', data);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MY MACHINERY BOOKINGS (FARMER)
|--------------------------------------------------------------------------
|
| params: {status: active | pending | confirmed | completed | rejected |
|          cancelled | all, page, limit}
|
*/

export const getMyMachineryBookingsApi = async (params = {}) => {
  const response = await apiClient.get('/api/machinery-bookings/my-bookings', {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MACHINERY REQUESTS (OWNER)
|--------------------------------------------------------------------------
|
| params: {status, machineryId, page, limit}. Response key is `requests`.
|
*/

export const getMachineryRequestsApi = async (params = {}) => {
  const response = await apiClient.get('/api/machinery-bookings/requests', {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const getMachineryBookingByIdApi = async id => {
  const response = await apiClient.get(`/api/machinery-bookings/${id}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACCEPT / REJECT (OWNER)
|--------------------------------------------------------------------------
*/

export const acceptMachineryBookingApi = async (id, ownerNotes) => {
  const response = await apiClient.patch(
    `/api/machinery-bookings/${id}/accept`,
    ownerNotes ? { ownerNotes } : {},
  );

  return response.data;
};

export const rejectMachineryBookingApi = async (id, reason = '') => {
  const response = await apiClient.patch(
    `/api/machinery-bookings/${id}/reject`,
    {
      reason,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CANCEL / COMPLETE (FARMER OR OWNER)
|--------------------------------------------------------------------------
*/

export const cancelMachineryBookingApi = async (id, reason = '') => {
  const response = await apiClient.patch(
    `/api/machinery-bookings/${id}/cancel`,
    {
      reason,
    },
  );

  return response.data;
};

// on or after the booking date
export const completeMachineryBookingApi = async id => {
  const response = await apiClient.patch(
    `/api/machinery-bookings/${id}/complete`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| REVIEW (FARMER)
|--------------------------------------------------------------------------
*/

export const reviewMachineryBookingApi = async (id, { rating, comment }) => {
  const response = await apiClient.post(
    `/api/machinery-bookings/${id}/review`,
    {
      rating,
      comment,
    },
  );

  return response.data;
};
