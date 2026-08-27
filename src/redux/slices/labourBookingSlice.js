import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createLabourBookingApi,
  getMyBookingsApi,
  getBookingByIdApi,
  cancelLabourBookingApi,
  getLabourRequestsApi,
  acceptLabourBookingApi,
  rejectLabourBookingApi,
  completeLabourBookingApi,
} from '../../api/labourBookingApi';
const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
export const createLabourBooking = createAsyncThunk(
  'labourBooking/createLabourBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      return await createLabourBookingApi(bookingData);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to create labour booking'),
      );
    }
  },
);
export const getMyBookings = createAsyncThunk(
  'labourBooking/getMyBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getMyBookingsApi(params);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch bookings'),
      );
    }
  },
);
export const getBookingById = createAsyncThunk(
  'labourBooking/getBookingById',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await getBookingByIdApi(bookingId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch booking'));
    }
  },
);
export const cancelLabourBooking = createAsyncThunk(
  'labourBooking/cancelLabourBooking',
  async ({ bookingId, reason = '' }, { rejectWithValue }) => {
    try {
      return await cancelLabourBookingApi(bookingId, reason);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to cancel booking'),
      );
    }
  },
);
export const getLabourRequests = createAsyncThunk(
  'labourBooking/getLabourRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await getLabourRequestsApi();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch booking requests'),
      );
    }
  },
);
export const acceptLabourBooking = createAsyncThunk(
  'labourBooking/acceptLabourBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await acceptLabourBookingApi(bookingId);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to accept booking'),
      );
    }
  },
);
export const rejectLabourBooking = createAsyncThunk(
  'labourBooking/rejectLabourBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await rejectLabourBookingApi(bookingId);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to reject booking'),
      );
    }
  },
);
export const completeLabourBooking = createAsyncThunk(
  'labourBooking/completeLabourBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await completeLabourBookingApi(bookingId);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to complete booking'),
      );
    }
  },
);
const initialState = {
  bookings: [],
  requests: [],
  selectedBooking: null,
  isLoadingBookings: false,
  isLoadingRequests: false,
  isCreating: false,
  isProcessing: false,
  error: null,
  message: '',
  createSuccess: false,
};
const labourBookingSlice = createSlice({
  name: 'labourBooking',
  initialState,
  reducers: {
    clearLabourBookingError: state => {
      state.error = null;
    },
    clearLabourBookingMessage: state => {
      state.message = '';
    },
    clearSelectedBooking: state => {
      state.selectedBooking = null;
    },
    clearCreateBookingSuccess: state => {
      state.createSuccess = false;
    },
    resetLabourBookingState: state => {
      state.bookings = [];
      state.requests = [];
      state.selectedBooking = null;
      state.isLoadingBookings = false;
      state.isLoadingRequests = false;
      state.isCreating = false;
      state.isProcessing = false;
      state.error = null;
      state.message = '';
      state.createSuccess = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createLabourBooking.pending, state => {
        state.isCreating = true;
        state.createSuccess = false;
        state.error = null;
        state.message = '';
      })
      .addCase(createLabourBooking.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = true;
        const booking = action.payload?.booking;
        if (booking) {
          state.bookings.unshift(booking);
        }
        state.message =
          action.payload?.message || 'Booking request sent successfully';
        state.error = null;
      })
      .addCase(createLabourBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.createSuccess = false;
        state.error = action.payload || 'Failed to create labour booking';
      });
    builder
      .addCase(getMyBookings.pending, state => {
        state.isLoadingBookings = true;
        state.error = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoadingBookings = false;
        state.bookings =
          action.payload?.bookings ||
          action.payload?.data ||
          action.payload?.results ||
          [];
        state.error = null;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.isLoadingBookings = false;
        state.error = action.payload || 'Failed to fetch bookings';
      });
    builder
      .addCase(getBookingById.pending, state => {
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.selectedBooking = action.payload?.booking || null;
        state.error = null;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch booking';
      });
    builder
      .addCase(cancelLabourBooking.pending, state => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(cancelLabourBooking.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedBooking = action.payload?.booking;
        if (updatedBooking?._id) {
          const index = state.bookings.findIndex(
            item => item._id === updatedBooking._id,
          );
          if (index !== -1) {
            state.bookings[index] = updatedBooking;
          }
        }
        state.message =
          action.payload?.message || 'Booking cancelled successfully';
        state.error = null;
      })
      .addCase(cancelLabourBooking.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to cancel booking';
      });
    builder
      .addCase(getLabourRequests.pending, state => {
        state.isLoadingRequests = true;
        state.error = null;
      })
      .addCase(getLabourRequests.fulfilled, (state, action) => {
        state.isLoadingRequests = false;
        state.requests =
          action.payload?.bookings ||
          action.payload?.requests ||
          action.payload?.data ||
          [];
        state.error = null;
      })
      .addCase(getLabourRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        state.error = action.payload || 'Failed to fetch booking requests';
      });
    builder
      .addCase(acceptLabourBooking.pending, state => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(acceptLabourBooking.fulfilled, (state, action) => {
        state.isProcessing = false;
        const booking = action.payload?.booking;
        const bookingId = booking?._id || action.meta.arg;
        state.requests = state.requests.filter(
          item => String(item?._id) !== String(bookingId),
        );
        state.message =
          action.payload?.message || 'Booking accepted successfully';
        state.error = null;
      })
      .addCase(acceptLabourBooking.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to accept booking';
      });
    builder
      .addCase(rejectLabourBooking.pending, state => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(rejectLabourBooking.fulfilled, (state, action) => {
        state.isProcessing = false;
        const booking = action.payload?.booking;
        const bookingId = booking?._id || action.meta.arg;
        state.requests = state.requests.filter(
          item => String(item?._id) !== String(bookingId),
        );
        state.message =
          action.payload?.message || 'Booking rejected successfully';
        state.error = null;
      })
      .addCase(rejectLabourBooking.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to reject booking';
      });
    builder
      .addCase(completeLabourBooking.pending, state => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(completeLabourBooking.fulfilled, (state, action) => {
        state.isProcessing = false;
        const booking = action.payload?.booking;
        if (booking?._id) {
          const index = state.bookings.findIndex(
            item => String(item?._id) === String(booking._id),
          );
          if (index !== -1) {
            state.bookings[index] = booking;
          }
        }
        state.message =
          action.payload?.message || 'Booking completed successfully';
        state.error = null;
      })
      .addCase(completeLabourBooking.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'Failed to complete booking';
      });
  },
});
export const {
  clearLabourBookingError,
  clearLabourBookingMessage,
  clearSelectedBooking,
  clearCreateBookingSuccess,
  resetLabourBookingState,
} = labourBookingSlice.actions;
export default labourBookingSlice.reducer;
