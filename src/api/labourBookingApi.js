import apiClient from './client';

/*
|--------------------------------------------------------------------------
| CREATE LABOUR BOOKING
|--------------------------------------------------------------------------
| Farmer creates a booking for a specific labourer.
|
| Expected data example:
|
| {
|   labourerId: "xxxxxxxx",
|   farmName: "My Farm",
|   farmLocation: "Neyyattinkara, Kerala",
|   activity: "Harvesting",
|   workerCount: 1,
|   bookingDate: "2026-08-30",
|   duration: "Full Day",
|   time: "8:00 AM - 5:00 PM",
|   totalAmount: 800
| }
|--------------------------------------------------------------------------
*/

export const createLabourBookingApi = async data => {
  const response = await apiClient.post(
    '/api/labour-bookings',
    data,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
| Returns bookings created by the logged-in farmer.
|
| Pending bookings are included here.
| Confirmed bookings are included here.
|--------------------------------------------------------------------------
*/

export const getMyBookingsApi = async params => {
  const response = await apiClient.get(
    '/api/labour-bookings/my-bookings',
    {
      params,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getBookingByIdApi = async bookingId => {
  const response = await apiClient.get(
    `/api/labour-bookings/${bookingId}`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelLabourBookingApi = async (
  bookingId,
  reason = '',
) => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/cancel`,
    {
      reason,
    },
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET LABOUR REQUESTS
|--------------------------------------------------------------------------
| Returns pending requests for the logged-in labourer.
|--------------------------------------------------------------------------
*/

export const getLabourRequestsApi = async () => {
  const response = await apiClient.get(
    '/api/labour-bookings/requests',
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ACCEPT BOOKING
|--------------------------------------------------------------------------
| pending -> confirmed
|--------------------------------------------------------------------------
*/

export const acceptLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/accept`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| REJECT BOOKING
|--------------------------------------------------------------------------
| pending -> rejected
|--------------------------------------------------------------------------
*/

export const rejectLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/reject`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| COMPLETE BOOKING
|--------------------------------------------------------------------------
| confirmed -> completed
|--------------------------------------------------------------------------
*/

export const completeLabourBookingApi = async bookingId => {
  const response = await apiClient.patch(
    `/api/labour-bookings/${bookingId}/complete`,
  );

  return response.data;
};