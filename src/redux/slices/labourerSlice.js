import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  getLabourMetaApi,
  getAllLabourersApi,
  getLabourerByIdApi,
  getMyLabourerProfileApi,
  createLabourerApi,
  updateMyLabourerProfileApi,
  deactivateMyLabourerProfileApi,
  activateMyLabourerProfileApi,
} from '../../api/labourerApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
*/

export const fetchLabourMeta = createAsyncThunk(
  'labourer/fetchMeta',
  async (_, {rejectWithValue}) => {
    try {
      return await getLabourMetaApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load options'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| BROWSE LABOURERS
|--------------------------------------------------------------------------
|
| {params, append} - append adds the next page to the current list.
|
*/

export const fetchLabourers = createAsyncThunk(
  'labourer/fetchLabourers',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getAllLabourersApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load workers'));
    }
  },
);

export const fetchLabourerById = createAsyncThunk(
  'labourer/fetchById',
  async (labourerId, {rejectWithValue}) => {
    try {
      return await getLabourerByIdApi(labourerId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load worker'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| MY LABOURER PROFILE
|--------------------------------------------------------------------------
|
| A 404 means the user hasn't registered as a worker yet; the slice keeps
| that as myProfileStatus 'missing' instead of an error.
|
*/

export const fetchMyLabourerProfile = createAsyncThunk(
  'labourer/fetchMine',
  async (_, {rejectWithValue}) => {
    try {
      return await getMyLabourerProfileApi();
    } catch (error) {
      return rejectWithValue({
        notFound: error.response?.status === 404,
        message: errorMessage(error, 'Unable to load your worker profile'),
      });
    }
  },
);

/*
 * {labourerData, isCreate}
 */
export const saveMyLabourerProfile = createAsyncThunk(
  'labourer/saveMine',
  async ({labourerData, isCreate}, {rejectWithValue}) => {
    try {
      return isCreate
        ? await createLabourerApi(labourerData)
        : await updateMyLabourerProfileApi(labourerData);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to save your profile'));
    }
  },
);

/*
 * active: true -> activate, false -> deactivate
 */
export const setMyLabourerActive = createAsyncThunk(
  'labourer/setActive',
  async (active, {rejectWithValue}) => {
    try {
      return active
        ? await activateMyLabourerProfileApi()
        : await deactivateMyLabourerProfileApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update your profile'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  meta: {
    labourTypes: [],
    workTypes: [],
    languages: [],
    genders: [],
    wageTypes: [],
    experienceUnits: [],
    availabilityOptions: [],
    maxBookingDays: 90,
  },
  metaLoading: false,
  metaError: null,

  labourers: [],
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
  listLoading: false,
  listLoadingMore: false,
  listError: null,

  selectedLabourer: null,
  labourerLoading: false,
  labourerError: null,

  myProfile: null,
  // idle | loading | loaded | missing | error
  myProfileStatus: 'idle',
  myProfileError: null,

  saving: false,
  togglingActive: false,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const labourerSlice = createSlice({
  name: 'labourer',

  initialState,

  reducers: {
    clearSelectedLabourer: state => {
      state.selectedLabourer = null;
      state.labourerError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchLabourMeta.pending, state => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(fetchLabourMeta.fulfilled, (state, action) => {
        state.metaLoading = false;

        const data = action.payload || {};

        state.meta = {
          labourTypes: data.labourTypes || [],
          workTypes: data.workTypes || [],
          languages: data.languages || [],
          genders: data.genders || [],
          wageTypes: data.wageTypes || [],
          experienceUnits: data.experienceUnits || [],
          availabilityOptions: data.availabilityOptions || [],
          maxBookingDays: data.maxBookingDays || 90,
        };
      })
      .addCase(fetchLabourMeta.rejected, (state, action) => {
        state.metaLoading = false;
        state.metaError = action.payload;
      });

    builder
      .addCase(fetchLabourers.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.listLoadingMore = true;
        } else {
          state.listLoading = true;
        }

        state.listError = null;
      })
      .addCase(fetchLabourers.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;

        const labourers = action.payload?.labourers || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.labourers.map(item => item._id));

          state.labourers = [
            ...state.labourers,
            ...labourers.filter(item => !known.has(item._id)),
          ];
        } else {
          state.labourers = labourers;
        }

        state.pagination = {
          page: action.payload?.pagination?.currentPage || 1,
          totalPages: action.payload?.pagination?.totalPages || 1,
          total: action.payload?.total || 0,
        };
      })
      .addCase(fetchLabourers.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchLabourerById.pending, (state, action) => {
        state.labourerLoading = true;
        state.labourerError = null;

        if (state.selectedLabourer?._id !== action.meta.arg) {
          state.selectedLabourer = null;
        }
      })
      .addCase(fetchLabourerById.fulfilled, (state, action) => {
        state.labourerLoading = false;
        state.selectedLabourer = action.payload?.labourer || null;
      })
      .addCase(fetchLabourerById.rejected, (state, action) => {
        state.labourerLoading = false;
        state.labourerError = action.payload;
      });

    builder
      .addCase(fetchMyLabourerProfile.pending, state => {
        state.myProfileStatus = state.myProfile ? 'loaded' : 'loading';
        state.myProfileError = null;
      })
      .addCase(fetchMyLabourerProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload?.labourer || null;
        state.myProfileStatus = state.myProfile ? 'loaded' : 'missing';
      })
      .addCase(fetchMyLabourerProfile.rejected, (state, action) => {
        if (action.payload?.notFound) {
          state.myProfile = null;
          state.myProfileStatus = 'missing';
        } else {
          state.myProfileStatus = state.myProfile ? 'loaded' : 'error';
          state.myProfileError = action.payload?.message;
        }
      });

    builder
      .addCase(saveMyLabourerProfile.pending, state => {
        state.saving = true;
      })
      .addCase(saveMyLabourerProfile.fulfilled, (state, action) => {
        state.saving = false;

        const labourer = action.payload?.labourer;

        if (labourer) {
          state.myProfile = {
            ...labourer,
            pendingRequests: state.myProfile?.pendingRequests || 0,
          };
          state.myProfileStatus = 'loaded';
        }
      })
      .addCase(saveMyLabourerProfile.rejected, state => {
        state.saving = false;
      })

      .addCase(setMyLabourerActive.pending, state => {
        state.togglingActive = true;
      })
      .addCase(setMyLabourerActive.fulfilled, (state, action) => {
        state.togglingActive = false;

        const labourer = action.payload?.labourer;

        if (labourer && state.myProfile) {
          state.myProfile = {
            ...state.myProfile,
            isActive: labourer.isActive,
            availability: labourer.availability,
            // deactivating cancels pending requests
            pendingRequests: labourer.isActive ? state.myProfile.pendingRequests : 0,
          };
        }
      })
      .addCase(setMyLabourerActive.rejected, state => {
        state.togglingActive = false;
      });
  },
});

export const {clearSelectedLabourer} = labourerSlice.actions;

export default labourerSlice.reducer;
