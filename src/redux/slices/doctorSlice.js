import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getDoctorMetaApi,
  getAllDoctorsApi,
  getDoctorByIdApi,
  createDoctorApi,
  getMyDoctorProfileApi,
  updateMyDoctorProfileApi,
  deactivateMyDoctorProfileApi,
  activateMyDoctorProfileApi,
} from '../../api/doctorApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
*/

export const fetchDoctorMeta = createAsyncThunk(
  'doctor/fetchMeta',
  async (_, { rejectWithValue }) => {
    try {
      return await getDoctorMetaApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load options'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| FIND DOCTORS
|--------------------------------------------------------------------------
|
| {params, append} - append adds the next page to the current list.
|
*/

export const fetchDoctors = createAsyncThunk(
  'doctor/fetchList',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getAllDoctorsApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load doctors'));
    }
  },
);

export const fetchDoctorById = createAsyncThunk(
  'doctor/fetchById',
  async (doctorId, { rejectWithValue }) => {
    try {
      return await getDoctorByIdApi(doctorId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load doctor'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| MY DOCTOR PROFILE
|--------------------------------------------------------------------------
|
| A 404 means the user has no doctor profile yet (status 'missing').
|
*/

export const fetchMyDoctorProfile = createAsyncThunk(
  'doctor/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyDoctorProfileApi();
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'Unable to load your doctor profile'),
        missing: error.response?.status === 404,
      });
    }
  },
);

/*
 * {doctorData, isCreate}
 */
export const saveMyDoctorProfile = createAsyncThunk(
  'doctor/saveMine',
  async ({ doctorData, isCreate }, { rejectWithValue }) => {
    try {
      return isCreate
        ? await createDoctorApi(doctorData)
        : await updateMyDoctorProfileApi(doctorData);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to save profile'));
    }
  },
);

export const setMyDoctorActive = createAsyncThunk(
  'doctor/setActive',
  async (active, { rejectWithValue }) => {
    try {
      return active
        ? await activateMyDoctorProfileApi()
        : await deactivateMyDoctorProfileApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update profile'));
    }
  },
);

/*
 * Quick availability switch from the dashboard.
 */
export const setMyDoctorAvailability = createAsyncThunk(
  'doctor/setAvailability',
  async (availability, { rejectWithValue }) => {
    try {
      return await updateMyDoctorProfileApi({ availability });
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to update availability'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  meta: {
    doctorTypes: [],
    specializations: {},
    problemTypes: {},
    animalTypes: [],
    languages: [],
    paymentMethods: ['cod', 'upi', 'card', 'wallet'],
    availabilityOptions: ['available', 'busy', 'unavailable'],
    defaultSlotMinutes: 30,
    maxImages: 5,
  },
  metaLoaded: false,
  metaLoading: false,
  metaError: null,

  list: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  listLoading: false,
  listLoadingMore: false,
  listError: null,

  selected: null,
  selectedLoading: false,
  selectedError: null,

  myProfile: null,
  // idle | loading | loaded | missing | error
  myProfileStatus: 'idle',
  myProfileError: null,

  saving: false,
  updating: false,
};

/*
 * Keep the dashboard counts when the server returns a plain profile.
 */
const storeMyProfile = (state, doctor) => {
  if (!doctor?._id) return;

  state.myProfile = {
    pendingRequests: state.myProfile?.pendingRequests || 0,
    upcomingConsultations: state.myProfile?.upcomingConsultations || 0,
    ...doctor,
  };
  state.myProfileStatus = 'loaded';
};

const doctorSlice = createSlice({
  name: 'doctor',

  initialState,

  reducers: {
    clearSelectedDoctor: state => {
      state.selected = null;
      state.selectedError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchDoctorMeta.pending, state => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(fetchDoctorMeta.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.metaLoading = false;
        state.metaLoaded = true;
        state.meta = {
          doctorTypes: data.doctorTypes || [],
          specializations: data.specializations || {},
          problemTypes: data.problemTypes || {},
          animalTypes: data.animalTypes || [],
          languages: data.languages || [],
          paymentMethods:
            data.paymentMethods || initialState.meta.paymentMethods,
          availabilityOptions:
            data.availabilityOptions || initialState.meta.availabilityOptions,
          defaultSlotMinutes: data.defaultSlotMinutes || 30,
          maxImages: data.maxImages || 5,
        };
      })
      .addCase(fetchDoctorMeta.rejected, (state, action) => {
        state.metaLoading = false;
        state.metaError = action.payload;
      });

    builder
      .addCase(fetchDoctors.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.listLoadingMore = true;
        } else {
          state.listLoading = true;
        }

        state.listError = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;

        const doctors = action.payload?.doctors || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.list.map(item => item._id));
          state.list = [
            ...state.list,
            ...doctors.filter(item => !known.has(item._id)),
          ];
        } else {
          state.list = doctors;
        }

        const pagination = action.payload?.pagination || {};
        state.pagination = {
          page: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || 0,
        };
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchDoctorById.pending, (state, action) => {
        state.selectedLoading = true;
        state.selectedError = null;

        if (state.selected?._id !== action.meta.arg) {
          state.selected = null;
        }
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload?.doctor || null;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload;
      });

    builder
      .addCase(fetchMyDoctorProfile.pending, state => {
        if (state.myProfileStatus !== 'loaded')
          state.myProfileStatus = 'loading';
        state.myProfileError = null;
      })
      .addCase(fetchMyDoctorProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload?.doctor || null;
        state.myProfileStatus = state.myProfile ? 'loaded' : 'missing';
      })
      .addCase(fetchMyDoctorProfile.rejected, (state, action) => {
        if (action.payload?.missing) {
          state.myProfile = null;
          state.myProfileStatus = 'missing';
          return;
        }

        if (state.myProfileStatus !== 'loaded') state.myProfileStatus = 'error';
        state.myProfileError = action.payload?.message;
      });

    builder
      .addCase(saveMyDoctorProfile.pending, state => {
        state.saving = true;
      })
      .addCase(saveMyDoctorProfile.fulfilled, (state, action) => {
        state.saving = false;
        storeMyProfile(state, action.payload?.doctor);
      })
      .addCase(saveMyDoctorProfile.rejected, state => {
        state.saving = false;
      });

    for (const thunk of [setMyDoctorActive, setMyDoctorAvailability]) {
      builder
        .addCase(thunk.pending, state => {
          state.updating = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.updating = false;
          storeMyProfile(state, action.payload?.doctor);
        })
        .addCase(thunk.rejected, state => {
          state.updating = false;
        });
    }
  },
});

export const { clearSelectedDoctor } = doctorSlice.actions;

export default doctorSlice.reducer;
