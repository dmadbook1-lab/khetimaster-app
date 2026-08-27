import apiClient from './client';
export const createLabourBookingApi = async data => {
  const response = await apiClient.post('/api/labour-bookings', data);
  return response.data;
};
export const getMyBookingsApi = async params => {
  const response = await apiClient.get('/api/labour-bookings/my-bookings', {
    params,
  });
  return response.data;
};
export const getBookingByIdApi = async bookingId => {
  const response = await apiClient.get(`/api/labour-bookings/${bookingId}`);
  return response.data;
};
export const cancelLabourBookingApi = async (bookingId, reason = '') => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/cancel`,
    {
      reason,
    },
  );
  return response.data;
};
export const getLabourRequestsApi = async () => {
  const response = await apiClient.get('/api/labour-bookings/requests');
  return response.data;
};
export const acceptLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/accept`,
  );
  return response.data;
};
export const rejectLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/reject`,
  );
  return response.data;
};
export const completeLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/complete`,
  );
  return response.data;
};
