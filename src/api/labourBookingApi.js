import apiClient from './client';

/*
 * {labourerId, bookingDate: 'YYYY-MM-DD', numberOfDays, startTime,
 *  endTime, workType, description, wage, wageType, state, district,
 *  village, address, farmerNotes}
 *
 * totalAmount is calculated by the server.
 */
export const createLabourBookingApi = async data => {
  const response = await apiClient.post('/api/labour-bookings', data);
  return response.data;
};

/*
 * params: {status: active | pending | accepted | completed | rejected |
 *          cancelled | all, page, limit}
 */
export const getMyBookingsApi = async params => {
  const response = await apiClient.get('/api/labour-bookings/my-bookings', {
    params,
  });
  return response.data;
};

export const getLabourRequestsApi = async params => {
  const response = await apiClient.get('/api/labour-bookings/requests', {
    params,
  });
  return response.data;
};

export const getBookingByIdApi = async bookingId => {
  const response = await apiClient.get(`/api/labour-bookings/${bookingId}`);
  return response.data;
};

export const acceptLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/accept`,
  );
  return response.data;
};

// labourer, pending requests only
export const rejectLabourBookingApi = async (bookingId, reason = '') => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/reject`,
    {
      reason,
    },
  );
  return response.data;
};

// farmer: pending or accepted, labourer: accepted only
export const cancelLabourBookingApi = async (bookingId, reason = '') => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/cancel`,
    {
      reason,
    },
  );
  return response.data;
};

// on or after the booking date
export const completeLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/complete`,
  );
  return response.data;
};

// farmer, completed bookings
export const reviewLabourBookingApi = async (bookingId, {rating, comment}) => {
  const response = await apiClient.post(
    `/api/labour-bookings/${bookingId}/review`,
    {
      rating,
      comment,
    },
  );
  return response.data;
};
