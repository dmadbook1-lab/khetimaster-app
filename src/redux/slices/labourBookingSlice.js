import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  createLabourBookingApi,
  getMyBookingsApi,
  getLabourRequestsApi,
  getBookingByIdApi,
  acceptLabourBookingApi,
  rejectLabourBookingApi,
  cancelLabourBookingApi,
  completeLabourBookingApi,
  reviewLabourBookingApi,
} from '../../api/labourBookingApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

/*
|--------------------------------------------------------------------------
| CREATE BOOKING (FARMER)
|--------------------------------------------------------------------------
|
| Rejects with {message, bookingId}. bookingId is set when the farmer
| already has a booking with this worker on these dates (409).
|
*/

export const createLabourBooking = createAsyncThunk(
  'labourBooking/create',
  async (bookingData, {rejectWithValue}) => {
    try {
      return await createLabourBookingApi(bookingData);
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'Unable to send the booking request'),
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
| {params: {status, page, limit}, append}
|
*/

export const fetchMyLabourBookings = createAsyncThunk(
  'labourBooking/fetchMine',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getMyBookingsApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load your bookings'));
    }
  },
);

export const fetchLabourRequests = createAsyncThunk(
  'labourBooking/fetchRequests',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getLabourRequestsApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load work requests'));
    }
  },
);

export const fetchLabourBookingById = createAsyncThunk(
  'labourBooking/fetchById',
  async (bookingId, {rejectWithValue}) => {
    try {
      return await getBookingByIdApi(bookingId);
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
| {bookingId, action: accept | reject | cancel | complete, reason}
|
*/

const ACTION_APIS = {
  accept: bookingId => acceptLabourBookingApi(bookingId),
  reject: (bookingId, reason) => rejectLabourBookingApi(bookingId, reason),
  cancel: (bookingId, reason) => cancelLabourBookingApi(bookingId, reason),
  complete: bookingId => completeLabourBookingApi(bookingId),
};

export const updateLabourBooking = createAsyncThunk(
  'labourBooking/update',
  async ({bookingId, action, reason}, {rejectWithValue}) => {
    try {
      return await ACTION_APIS[action](bookingId, reason);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update booking'));
    }
  },
);

export const reviewLabourBooking = createAsyncThunk(
  'labourBooking/review',
  async ({bookingId, rating, comment}, {rejectWithValue}) => {
    try {
      return await reviewLabourBookingApi(bookingId, {rating, comment});
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
  if (!booking?._id) {
    return;
  }

  state.selectedBooking = booking;

  for (const key of ['myBookings', 'requests']) {
    state[key].items = state[key].items.map(item =>
      item._id === booking._id ? booking : item,
    );
  }
};

/*
 * Reducers for a paginated list thunk stored under state[key].
 */
const addListCases = (builder, thunk, key) => {
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
      const bookings = action.payload?.bookings || [];

      list.loading = false;
      list.loadingMore = false;

      if (action.meta.arg?.append) {
        const known = new Set(list.items.map(item => item._id));
        list.items = [...list.items, ...bookings.filter(item => !known.has(item._id))];
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

const labourBookingSlice = createSlice({
  name: 'labourBooking',

  initialState,

  reducers: {
    clearSelectedLabourBooking: state => {
      state.selectedBooking = null;
      state.bookingError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(createLabourBooking.pending, state => {
        state.creating = true;
      })
      .addCase(createLabourBooking.fulfilled, (state, action) => {
        state.creating = false;

        const booking = action.payload?.booking;

        if (booking) {
          state.selectedBooking = booking;
          state.myBookings.items.unshift(booking);
        }
      })
      .addCase(createLabourBooking.rejected, state => {
        state.creating = false;
      });

    addListCases(builder, fetchMyLabourBookings, 'myBookings');
    addListCases(builder, fetchLabourRequests, 'requests');

    builder
      .addCase(fetchLabourBookingById.pending, (state, action) => {
        state.bookingLoading = true;
        state.bookingError = null;

        if (state.selectedBooking?._id !== action.meta.arg) {
          state.selectedBooking = null;
        }
      })
      .addCase(fetchLabourBookingById.fulfilled, (state, action) => {
        state.bookingLoading = false;
        storeBooking(state, action.payload?.booking);
      })
      .addCase(fetchLabourBookingById.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      });

    builder
      .addCase(updateLabourBooking.pending, (state, action) => {
        state.actionInProgress = action.meta.arg.action;
      })
      .addCase(updateLabourBooking.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeBooking(state, action.payload?.booking);
      })
      .addCase(updateLabourBooking.rejected, state => {
        state.actionInProgress = null;
      })

      .addCase(reviewLabourBooking.pending, state => {
        state.actionInProgress = 'review';
      })
      .addCase(reviewLabourBooking.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeBooking(state, action.payload?.booking);
      })
      .addCase(reviewLabourBooking.rejected, state => {
        state.actionInProgress = null;
      });
  },
});

export const {clearSelectedLabourBooking} = labourBookingSlice.actions;

export default labourBookingSlice.reducer;
