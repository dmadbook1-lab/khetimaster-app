import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  createMachineryBookingApi,
  getMyMachineryBookingsApi,
  getMachineryRequestsApi,
  getMachineryBookingByIdApi,
  acceptMachineryBookingApi,
  rejectMachineryBookingApi,
  cancelMachineryBookingApi,
  completeMachineryBookingApi,
} from '../../api/machineryBookingApi';

/*
|--------------------------------------------------------------------------
| ERROR HELPER
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  error,
  fallback,
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createMachineryBooking =
  createAsyncThunk(
    'machineryBooking/create',

    async (
      data,
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await createMachineryBookingApi(
          data,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to create machinery booking',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| MY BOOKINGS
|--------------------------------------------------------------------------
*/

export const getMyMachineryBookings =
  createAsyncThunk(
    'machineryBooking/getMyBookings',

    async (
      params = {},
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await getMyMachineryBookingsApi(
          params,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to fetch machinery bookings',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| OWNER REQUESTS
|--------------------------------------------------------------------------
*/

export const getMachineryRequests =
  createAsyncThunk(
    'machineryBooking/getRequests',

    async (
      params = {},
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await getMachineryRequestsApi(
          params,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to fetch machinery requests',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET BY ID
|--------------------------------------------------------------------------
*/

export const getMachineryBookingById =
  createAsyncThunk(
    'machineryBooking/getById',

    async (
      id,
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await getMachineryBookingByIdApi(
          id,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to fetch machinery booking',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| ACCEPT
|--------------------------------------------------------------------------
*/

export const acceptMachineryBooking =
  createAsyncThunk(
    'machineryBooking/accept',

    async (
      id,
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await acceptMachineryBookingApi(
          id,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to accept machinery booking',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| REJECT
|--------------------------------------------------------------------------
*/

export const rejectMachineryBooking =
  createAsyncThunk(
    'machineryBooking/reject',

    async (
      id,
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await rejectMachineryBookingApi(
          id,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to reject machinery booking',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| CANCEL
|--------------------------------------------------------------------------
*/

export const cancelMachineryBooking =
  createAsyncThunk(
    'machineryBooking/cancel',

    async (
      {
        id,
        reason = '',
      },
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await cancelMachineryBookingApi(
          id,
          reason,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to cancel machinery booking',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| COMPLETE
|--------------------------------------------------------------------------
*/

export const completeMachineryBooking =
  createAsyncThunk(
    'machineryBooking/complete',

    async (
      id,
      {
        rejectWithValue,
      },
    ) => {
      try {
        return await completeMachineryBookingApi(
          id,
        );
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to complete machinery booking',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  bookings: [],

  requests: [],

  selectedBooking: null,

  bookingCount: 0,

  requestCount: 0,

  isLoading: false,

  isLoadingBookings: false,

  isLoadingRequests: false,

  isCreating: false,

  isAccepting: false,

  isRejecting: false,

  isCancelling: false,

  isCompleting: false,

  error: null,

  message: '',

  createSuccess: false,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getId = item =>
  String(
    item?._id ||
      item?.id ||
      '',
  );

const replaceItem = (
  list,
  updated,
) => {
  const id =
    getId(updated);

  if (!id) {
    return list;
  }

  return list.map(
    item =>
      getId(item) === id
        ? updated
        : item,
  );
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const machineryBookingSlice =
  createSlice({
    name: 'machineryBooking',

    initialState,

    reducers: {
      clearMachineryBookingError:
        state => {
          state.error =
            null;
        },

      clearMachineryBookingMessage:
        state => {
          state.message =
            '';
        },

      clearSelectedMachineryBooking:
        state => {
          state.selectedBooking =
            null;
        },

      clearMachineryBookingCreateSuccess:
        state => {
          state.createSuccess =
            false;
        },

      resetMachineryBookingState:
        () => initialState,
    },

    extraReducers:
      builder => {
        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            createMachineryBooking.pending,
            state => {
              state.isCreating =
                true;

              state.createSuccess =
                false;

              state.error =
                null;

              state.message =
                '';
            },
          )

          .addCase(
            createMachineryBooking.fulfilled,
            (
              state,
              action,
            ) => {
              state.isCreating =
                false;

              state.createSuccess =
                true;

              state.error =
                null;

              state.message =
                action.payload
                  ?.message ||
                'Machinery booking request sent successfully';

              const booking =
                action.payload
                  ?.booking;

              if (booking) {
                state.bookings.unshift(
                  booking,
                );

                state.bookingCount =
                  state.bookings.length;

                state.selectedBooking =
                  booking;
              }
            },
          )

          .addCase(
            createMachineryBooking.rejected,
            (
              state,
              action,
            ) => {
              state.isCreating =
                false;

              state.createSuccess =
                false;

              state.error =
                action.payload ||
                'Failed to create machinery booking';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | MY BOOKINGS
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            getMyMachineryBookings.pending,
            state => {
              state.isLoadingBookings =
                true;

              state.error =
                null;
            },
          )

          .addCase(
            getMyMachineryBookings.fulfilled,
            (
              state,
              action,
            ) => {
              state.isLoadingBookings =
                false;

              state.bookings =
                Array.isArray(
                  action.payload
                    ?.bookings,
                )
                  ? action.payload
                      .bookings
                  : [];

              state.bookingCount =
                action.payload
                  ?.count ??
                state.bookings
                  .length;

              state.error =
                null;
            },
          )

          .addCase(
            getMyMachineryBookings.rejected,
            (
              state,
              action,
            ) => {
              state.isLoadingBookings =
                false;

              state.error =
                action.payload ||
                'Failed to fetch machinery bookings';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | REQUESTS
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            getMachineryRequests.pending,
            state => {
              state.isLoadingRequests =
                true;

              state.error =
                null;
            },
          )

          .addCase(
            getMachineryRequests.fulfilled,
            (
              state,
              action,
            ) => {
              state.isLoadingRequests =
                false;

              state.requests =
                Array.isArray(
                  action.payload
                    ?.requests,
                )
                  ? action.payload
                      .requests
                  : [];

              state.requestCount =
                action.payload
                  ?.count ??
                state.requests
                  .length;

              state.error =
                null;
            },
          )

          .addCase(
            getMachineryRequests.rejected,
            (
              state,
              action,
            ) => {
              state.isLoadingRequests =
                false;

              state.error =
                action.payload ||
                'Failed to fetch machinery requests';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | GET BY ID
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            getMachineryBookingById.pending,
            state => {
              state.isLoading =
                true;

              state.selectedBooking =
                null;

              state.error =
                null;
            },
          )

          .addCase(
            getMachineryBookingById.fulfilled,
            (
              state,
              action,
            ) => {
              state.isLoading =
                false;

              state.selectedBooking =
                action.payload
                  ?.booking ||
                null;

              state.error =
                null;
            },
          )

          .addCase(
            getMachineryBookingById.rejected,
            (
              state,
              action,
            ) => {
              state.isLoading =
                false;

              state.error =
                action.payload ||
                'Failed to fetch machinery booking';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | ACCEPT
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            acceptMachineryBooking.pending,
            state => {
              state.isAccepting =
                true;

              state.error =
                null;
            },
          )

          .addCase(
            acceptMachineryBooking.fulfilled,
            (
              state,
              action,
            ) => {
              state.isAccepting =
                false;

              state.error =
                null;

              state.message =
                action.payload
                  ?.message ||
                'Machinery booking accepted';

              const updated =
                action.payload
                  ?.booking;

              if (updated) {
                state.requests =
                  replaceItem(
                    state.requests,
                    updated,
                  );

                state.bookings =
                  replaceItem(
                    state.bookings,
                    updated,
                  );

                state.selectedBooking =
                  updated;
              }
            },
          )

          .addCase(
            acceptMachineryBooking.rejected,
            (
              state,
              action,
            ) => {
              state.isAccepting =
                false;

              state.error =
                action.payload ||
                'Failed to accept machinery booking';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | REJECT
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            rejectMachineryBooking.pending,
            state => {
              state.isRejecting =
                true;

              state.error =
                null;
            },
          )

          .addCase(
            rejectMachineryBooking.fulfilled,
            (
              state,
              action,
            ) => {
              state.isRejecting =
                false;

              state.error =
                null;

              state.message =
                action.payload
                  ?.message ||
                'Machinery booking rejected';

              const updated =
                action.payload
                  ?.booking;

              if (updated) {
                state.requests =
                  replaceItem(
                    state.requests,
                    updated,
                  );

                state.bookings =
                  replaceItem(
                    state.bookings,
                    updated,
                  );

                state.selectedBooking =
                  updated;
              }
            },
          )

          .addCase(
            rejectMachineryBooking.rejected,
            (
              state,
              action,
            ) => {
              state.isRejecting =
                false;

              state.error =
                action.payload ||
                'Failed to reject machinery booking';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | CANCEL
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            cancelMachineryBooking.pending,
            state => {
              state.isCancelling =
                true;

              state.error =
                null;
            },
          )

          .addCase(
            cancelMachineryBooking.fulfilled,
            (
              state,
              action,
            ) => {
              state.isCancelling =
                false;

              state.error =
                null;

              state.message =
                action.payload
                  ?.message ||
                'Machinery booking cancelled';

              const updated =
                action.payload
                  ?.booking;

              if (updated) {
                state.bookings =
                  replaceItem(
                    state.bookings,
                    updated,
                  );

                state.requests =
                  replaceItem(
                    state.requests,
                    updated,
                  );

                state.selectedBooking =
                  updated;
              }
            },
          )

          .addCase(
            cancelMachineryBooking.rejected,
            (
              state,
              action,
            ) => {
              state.isCancelling =
                false;

              state.error =
                action.payload ||
                'Failed to cancel machinery booking';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | COMPLETE
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            completeMachineryBooking.pending,
            state => {
              state.isCompleting =
                true;

              state.error =
                null;
            },
          )

          .addCase(
            completeMachineryBooking.fulfilled,
            (
              state,
              action,
            ) => {
              state.isCompleting =
                false;

              state.error =
                null;

              state.message =
                action.payload
                  ?.message ||
                'Machinery booking completed';

              const updated =
                action.payload
                  ?.booking;

              if (updated) {
                state.bookings =
                  replaceItem(
                    state.bookings,
                    updated,
                  );

                state.requests =
                  replaceItem(
                    state.requests,
                    updated,
                  );

                state.selectedBooking =
                  updated;
              }
            },
          )

          .addCase(
            completeMachineryBooking.rejected,
            (
              state,
              action,
            ) => {
              state.isCompleting =
                false;

              state.error =
                action.payload ||
                'Failed to complete machinery booking';
            },
          );
      },
  });

export const {
  clearMachineryBookingError,
  clearMachineryBookingMessage,
  clearSelectedMachineryBooking,
  clearMachineryBookingCreateSuccess,
  resetMachineryBookingState,
} = machineryBookingSlice.actions;

export default machineryBookingSlice.reducer;