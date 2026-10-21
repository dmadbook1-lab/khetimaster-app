import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  createMachineryBookingApi,
  getMyMachineryBookingsApi,
  getMachineryRequestsApi,
  getMachineryBookingByIdApi,
  acceptMachineryBookingApi,
  rejectMachineryBookingApi,
  cancelMachineryBookingApi,
  completeMachineryBookingApi,
  reviewMachineryBookingApi,
} from '../../api/machineryBookingApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| CREATE BOOKING (FARMER)
|--------------------------------------------------------------------------
|
| Rejects with {message, bookingId}. bookingId is set when the farmer
| already has a booking for this machine at that time (409).
|
*/

export const createMachineryBooking = createAsyncThunk(
  'machineryBooking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      return await createMachineryBookingApi(bookingData);
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'Unable to send the rental request'),
        bookingId: error.response?.data?.booking?._id || null,
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| LISTS
|--------------------------------------------------------------------------
|
| {params: {status, machineryId, page, limit}, append}
|
*/

export const fetchMyMachineryBookings = createAsyncThunk(
  'machineryBooking/fetchMine',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getMyMachineryBookingsApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load your rentals'),
      );
    }
  },
);

export const fetchMachineryRequests = createAsyncThunk(
  'machineryBooking/fetchRequests',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getMachineryRequestsApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load rental requests'),
      );
    }
  },
);

export const fetchMachineryBookingById = createAsyncThunk(
  'machineryBooking/fetchById',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await getMachineryBookingByIdApi(bookingId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load booking'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
|
| {bookingId, action: accept | reject | cancel | complete, note}
| note is the owner's note on accept, or the reason on reject / cancel.
|
*/

const ACTION_APIS = {
  accept: (bookingId, note) => acceptMachineryBookingApi(bookingId, note),
  reject: (bookingId, note) => rejectMachineryBookingApi(bookingId, note),
  cancel: (bookingId, note) => cancelMachineryBookingApi(bookingId, note),
  complete: bookingId => completeMachineryBookingApi(bookingId),
};

export const updateMachineryBooking = createAsyncThunk(
  'machineryBooking/update',
  async ({ bookingId, action, note }, { rejectWithValue }) => {
    try {
      return await ACTION_APIS[action](bookingId, note);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update booking'));
    }
  },
);

export const reviewMachineryBooking = createAsyncThunk(
  'machineryBooking/review',
  async ({ bookingId, rating, comment }, { rejectWithValue }) => {
    try {
      return await reviewMachineryBookingApi(bookingId, { rating, comment });
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to submit review'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const emptyList = {
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
  loading: false,
  loadingMore: false,
  error: null,
};

const initialState = {
  myBookings: emptyList,
  requests: emptyList,

  selectedBooking: null,
  bookingLoading: false,
  bookingError: null,

  creating: false,

  // name of the action in flight, e.g. 'accept'
  actionInProgress: null,
};

const storeBooking = (state, booking) => {
  if (!booking?._id) return;

  state.selectedBooking = booking;

  for (const key of ['myBookings', 'requests']) {
    state[key].items = state[key].items.map(item =>
      item._id === booking._id ? booking : item,
    );
  }
};

/*
 * Reducers for a paginated list thunk stored under state[key]. The
 * farmer list comes back as `bookings`, the owner list as `requests`.
 */
const addListCases = (builder, thunk, key, responseKey) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      const list = state[key];

      if (action.meta.arg?.append) {
        list.loadingMore = true;
      } else {
        list.loading = true;
      }

      list.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const list = state[key];
      const bookings = action.payload?.[responseKey] || [];

      list.loading = false;
      list.loadingMore = false;

      if (action.meta.arg?.append) {
        const known = new Set(list.items.map(item => item._id));
        list.items = [
          ...list.items,
          ...bookings.filter(item => !known.has(item._id)),
        ];
      } else {
        list.items = bookings;
      }

      list.page = action.payload?.pagination?.currentPage || 1;
      list.totalPages = action.payload?.pagination?.totalPages || 1;
      list.total = action.payload?.total || 0;
    })
    .addCase(thunk.rejected, (state, action) => {
      const list = state[key];

      list.loading = false;
      list.loadingMore = false;
      list.error = action.payload;
    });
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const machineryBookingSlice = createSlice({
  name: 'machineryBooking',

  initialState,

  reducers: {
    clearSelectedMachineryBooking: state => {
      state.selectedBooking = null;
      state.bookingError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(createMachineryBooking.pending, state => {
        state.creating = true;
      })
      .addCase(createMachineryBooking.fulfilled, (state, action) => {
        state.creating = false;

        const booking = action.payload?.booking;

        if (booking) {
          state.selectedBooking = booking;
          state.myBookings.items.unshift(booking);
        }
      })
      .addCase(createMachineryBooking.rejected, state => {
        state.creating = false;
      });

    addListCases(builder, fetchMyMachineryBookings, 'myBookings', 'bookings');
    addListCases(builder, fetchMachineryRequests, 'requests', 'requests');

    builder
      .addCase(fetchMachineryBookingById.pending, (state, action) => {
        state.bookingLoading = true;
        state.bookingError = null;

        if (state.selectedBooking?._id !== action.meta.arg) {
          state.selectedBooking = null;
        }
      })
      .addCase(fetchMachineryBookingById.fulfilled, (state, action) => {
        state.bookingLoading = false;
        storeBooking(state, action.payload?.booking);
      })
      .addCase(fetchMachineryBookingById.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      });

    builder
      .addCase(updateMachineryBooking.pending, (state, action) => {
        state.actionInProgress = action.meta.arg.action;
      })
      .addCase(updateMachineryBooking.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeBooking(state, action.payload?.booking);
      })
      .addCase(updateMachineryBooking.rejected, state => {
        state.actionInProgress = null;
      })

      .addCase(reviewMachineryBooking.pending, state => {
        state.actionInProgress = 'review';
      })
      .addCase(reviewMachineryBooking.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeBooking(state, action.payload?.booking);
      })
      .addCase(reviewMachineryBooking.rejected, state => {
        state.actionInProgress = null;
      });
  },
});

export const { clearSelectedMachineryBooking } = machineryBookingSlice.actions;

export default machineryBookingSlice.reducer;
