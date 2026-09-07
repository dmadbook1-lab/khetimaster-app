import apiClient from './client';

/*
|--------------------------------------------------------------------------
| CREATE MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const createMachineryBookingApi =
  async data => {
    const response = await apiClient.post(
      '/api/machinery-bookings',
      data,
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET MY MACHINERY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyMachineryBookingsApi =
  async (params = {}) => {
    const response = await apiClient.get(
      '/api/machinery-bookings/my-bookings',
      {
        params,
      },
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET MACHINERY REQUESTS
|--------------------------------------------------------------------------
*/

export const getMachineryRequestsApi =
  async (params = {}) => {
    const response = await apiClient.get(
      '/api/machinery-bookings/requests',
      {
        params,
      },
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| GET SINGLE MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const getMachineryBookingByIdApi =
  async id => {
    const response = await apiClient.get(
      `/api/machinery-bookings/${id}`,
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| ACCEPT MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const acceptMachineryBookingApi =
  async id => {
    const response = await apiClient.patch(
      `/api/machinery-bookings/${id}/accept`,
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| REJECT MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const rejectMachineryBookingApi =
  async id => {
    const response = await apiClient.patch(
      `/api/machinery-bookings/${id}/reject`,
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| CANCEL MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const cancelMachineryBookingApi =
  async (
    id,
    reason = '',
  ) => {
    const response = await apiClient.patch(
      `/api/machinery-bookings/${id}/cancel`,
      {
        reason,
      },
    );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| COMPLETE MACHINERY BOOKING
|--------------------------------------------------------------------------
*/

export const completeMachineryBookingApi =
  async id => {
    const response = await apiClient.patch(
      `/api/machinery-bookings/${id}/complete`,
    );

    return response.data;
  };