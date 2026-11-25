import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import i18n from 'i18next';

import {
  activateDeliveryPartnerApi,
  createDeliveryBookingApi,
  createDeliveryPartnerApi,
  deactivateDeliveryPartnerApi,
  getDeliveryBookingApi,
  getDeliveryMetaApi,
  getDeliveryPartnerByIdApi,
  getDeliveryPartnersApi,
  getDeliveryRequestsApi,
  getMyDeliveriesApi,
  getMyDeliveryPartnerApi,
  reviewDeliveryBookingApi,
  setDeliveryOnlineApi,
  updateDeliveryBookingApi,
  updateDeliveryPartnerApi,
} from '../../api/deliveryApi';

const errorMessage = (error, fallbackKey) =>
  error.response?.data?.message || error.message || i18n.t(fallbackKey);

/*
|--------------------------------------------------------------------------
| META + PARTNERS
|--------------------------------------------------------------------------
*/

export const fetchDeliveryMeta = createAsyncThunk(
  'delivery/fetchMeta',
  async (_, {rejectWithValue}) => {
    try {
      return await getDeliveryMetaApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.loadOptions'));
    }
  },
);

// {params, append}
export const fetchDeliveryPartners = createAsyncThunk(
  'delivery/fetchPartners',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getDeliveryPartnersApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.loadDrivers'));
    }
  },
);

// {partnerId, params: {district, lat, lng}}
export const fetchDeliveryPartner = createAsyncThunk(
  'delivery/fetchPartner',
  async ({partnerId, params}, {rejectWithValue}) => {
    try {
      return await getDeliveryPartnerByIdApi(partnerId, params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.loadDriver'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| MY DRIVER PROFILE
|--------------------------------------------------------------------------
|
| 404 = not registered as a driver -> myPartnerStatus 'missing'.
|
*/

export const fetchMyDeliveryPartner = createAsyncThunk(
  'delivery/fetchMyPartner',
  async (_, {rejectWithValue}) => {
    try {
      return await getMyDeliveryPartnerApi();
    } catch (error) {
      return rejectWithValue({
        notFound: error.response?.status === 404,
        message: errorMessage(error, 'delivery.err.loadProfile'),
      });
    }
  },
);

// {data, isCreate}
export const saveMyDeliveryPartner = createAsyncThunk(
  'delivery/saveMyPartner',
  async ({data, isCreate}, {rejectWithValue}) => {
    try {
      return isCreate
        ? await createDeliveryPartnerApi(data)
        : await updateDeliveryPartnerApi(data);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.saveProfile'));
    }
  },
);

// {isOnline, location}
export const setDeliveryOnline = createAsyncThunk(
  'delivery/setOnline',
  async ({isOnline, location}, {rejectWithValue}) => {
    try {
      return await setDeliveryOnlineApi(isOnline, location);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.updateStatus'));
    }
  },
);

export const setDeliveryPartnerActive = createAsyncThunk(
  'delivery/setActive',
  async (active, {rejectWithValue}) => {
    try {
      return active
        ? await activateDeliveryPartnerApi()
        : await deactivateDeliveryPartnerApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.updateStatus'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

// Rejects with {message, bookingId} (bookingId: an existing open booking)
export const createDeliveryBooking = createAsyncThunk(
  'delivery/createBooking',
  async (data, {rejectWithValue}) => {
    try {
      return await createDeliveryBookingApi(data);
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'delivery.err.book'),
        bookingId: error.response?.data?.booking?._id || null,
      });
    }
  },
);

export const fetchMyDeliveries = createAsyncThunk(
  'delivery/fetchMine',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getMyDeliveriesApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.loadDeliveries'));
    }
  },
);

export const fetchDeliveryRequests = createAsyncThunk(
  'delivery/fetchRequests',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getDeliveryRequestsApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.loadRequests'));
    }
  },
);

export const fetchDeliveryBooking = createAsyncThunk(
  'delivery/fetchBooking',
  async (bookingId, {rejectWithValue}) => {
    try {
      return await getDeliveryBookingApi(bookingId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.loadTrip'));
    }
  },
);

// {bookingId, action, body}
export const updateDeliveryBooking = createAsyncThunk(
  'delivery/updateBooking',
  async ({bookingId, action, body}, {rejectWithValue}) => {
    try {
      return await updateDeliveryBookingApi(bookingId, action, body);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.updateTrip'));
    }
  },
);

export const reviewDeliveryBooking = createAsyncThunk(
  'delivery/reviewBooking',
  async ({bookingId, rating, comment}, {rejectWithValue}) => {
    try {
      return await reviewDeliveryBookingApi(bookingId, {rating, comment});
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'delivery.err.review'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const emptyList = () => ({items: [], loading: false, error: null});

const initialState = {
  meta: {
    vehicleTypes: [],
    goodsTypes: [],
    paymentMethods: ['cod', 'upi'],
    settings: {},
  },
  metaLoading: false,
  metaError: null,

  partners: [],
  partnersDistrict: '',
  partnerStats: {total: 0, inDistrict: 0, onlineInDistrict: 0},
  pagination: {page: 1, totalPages: 1, total: 0},
  listLoading: false,
  listLoadingMore: false,
  listError: null,

  selectedPartner: null,
  partnerLoading: false,
  partnerError: null,

  myPartner: null,
  // idle | loading | loaded | missing | error
  myPartnerStatus: 'idle',
  myPartnerError: null,
  savingPartner: false,
  togglingOnline: false,

  myDeliveries: emptyList(),
  requests: emptyList(),

  currentBooking: null,
  bookingLoading: false,
  bookingError: null,
  creating: false,
  updating: false,
};

/*
 * Keep every copy of a booking in sync after an action.
 */
const upsertBooking = (state, booking) => {
  if (!booking?._id) return;

  if (state.currentBooking?._id === booking._id || !state.currentBooking) {
    state.currentBooking = booking;
  }

  for (const list of [state.myDeliveries, state.requests]) {
    const index = list.items.findIndex(item => item._id === booking._id);
    if (index >= 0) list.items[index] = booking;
  }
};

const listCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, state => {
      state[key].loading = true;
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].loading = false;
      state[key].items = action.payload?.bookings || [];
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].loading = false;
      state[key].error = action.payload;
    });
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,

  reducers: {
    clearCurrentBooking: state => {
      state.currentBooking = null;
      state.bookingError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchDeliveryMeta.pending, state => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(fetchDeliveryMeta.fulfilled, (state, action) => {
        state.metaLoading = false;
        const data = action.payload || {};
        state.meta = {
          vehicleTypes: data.vehicleTypes || [],
          goodsTypes: data.goodsTypes || [],
          paymentMethods: data.paymentMethods || ['cod', 'upi'],
          settings: data.settings || {},
        };
      })
      .addCase(fetchDeliveryMeta.rejected, (state, action) => {
        state.metaLoading = false;
        state.metaError = action.payload;
      });

    builder
      .addCase(fetchDeliveryPartners.pending, (state, action) => {
        if (action.meta.arg?.append) state.listLoadingMore = true;
        else state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;

        const data = action.payload || {};
        const partners = data.partners || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.partners.map(item => item._id));
          state.partners = [
            ...state.partners,
            ...partners.filter(item => !known.has(item._id)),
          ];
        } else {
          state.partners = partners;
        }

        state.partnersDistrict = data.district || '';
        state.partnerStats = data.stats || initialState.partnerStats;
        state.pagination = {
          page: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          total: data.total || 0,
        };
      })
      .addCase(fetchDeliveryPartners.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchDeliveryPartner.pending, state => {
        state.partnerLoading = true;
        state.partnerError = null;
      })
      .addCase(fetchDeliveryPartner.fulfilled, (state, action) => {
        state.partnerLoading = false;
        state.selectedPartner = action.payload?.partner || null;
      })
      .addCase(fetchDeliveryPartner.rejected, (state, action) => {
        state.partnerLoading = false;
        state.partnerError = action.payload;
      });

    builder
      .addCase(fetchMyDeliveryPartner.pending, state => {
        if (state.myPartnerStatus !== 'loaded') state.myPartnerStatus = 'loading';
        state.myPartnerError = null;
      })
      .addCase(fetchMyDeliveryPartner.fulfilled, (state, action) => {
        state.myPartner = action.payload?.partner || null;
        state.myPartnerStatus = 'loaded';
      })
      .addCase(fetchMyDeliveryPartner.rejected, (state, action) => {
        if (action.payload?.notFound) {
          state.myPartner = null;
          state.myPartnerStatus = 'missing';
        } else {
          state.myPartnerStatus = state.myPartner ? 'loaded' : 'error';
          state.myPartnerError = action.payload?.message;
        }
      });

    builder
      .addCase(saveMyDeliveryPartner.pending, state => {
        state.savingPartner = true;
      })
      .addCase(saveMyDeliveryPartner.fulfilled, (state, action) => {
        state.savingPartner = false;
        state.myPartner = {...state.myPartner, ...action.payload?.partner};
        state.myPartnerStatus = 'loaded';
      })
      .addCase(saveMyDeliveryPartner.rejected, state => {
        state.savingPartner = false;
      });

    for (const thunk of [setDeliveryOnline, setDeliveryPartnerActive]) {
      builder
        .addCase(thunk.pending, state => {
          state.togglingOnline = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.togglingOnline = false;
          state.myPartner = {...state.myPartner, ...action.payload?.partner};
        })
        .addCase(thunk.rejected, state => {
          state.togglingOnline = false;
        });
    }

    listCases(builder, fetchMyDeliveries, 'myDeliveries');
    listCases(builder, fetchDeliveryRequests, 'requests');

    builder
      .addCase(fetchDeliveryBooking.pending, (state, action) => {
        state.bookingLoading = true;
        state.bookingError = null;
        if (state.currentBooking?._id !== action.meta.arg) {
          state.currentBooking = null;
        }
      })
      .addCase(fetchDeliveryBooking.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.currentBooking = action.payload?.booking || null;
      })
      .addCase(fetchDeliveryBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      });

    builder
      .addCase(createDeliveryBooking.pending, state => {
        state.creating = true;
      })
      .addCase(createDeliveryBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.currentBooking = action.payload?.booking || null;
      })
      .addCase(createDeliveryBooking.rejected, state => {
        state.creating = false;
      });

    for (const thunk of [updateDeliveryBooking, reviewDeliveryBooking]) {
      builder
        .addCase(thunk.pending, state => {
          state.updating = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.updating = false;
          upsertBooking(state, action.payload?.booking);
        })
        .addCase(thunk.rejected, state => {
          state.updating = false;
        });
    }
  },
});

export const {clearCurrentBooking} = deliverySlice.actions;

export default deliverySlice.reducer;
