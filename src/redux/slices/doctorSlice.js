import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  createDoctorApi,
  getAllDoctorsApi,
  getMyDoctorProfileApi,
  getDoctorByIdApi,
  updateMyDoctorProfileApi,
  deactivateMyDoctorProfileApi,
  activateMyDoctorProfileApi,
} from '../../api/doctorApi';

/*
|--------------------------------------------------------------------------
| ERROR HELPER
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  error,
  fallback = 'Something went wrong',
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
| CREATE DOCTOR
|--------------------------------------------------------------------------
*/

export const createDoctor = createAsyncThunk(
  'doctor/createDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await createDoctorApi(
        doctorData,
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'Failed to create doctor profile',
        ),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET ALL DOCTORS
|--------------------------------------------------------------------------
*/

export const getAllDoctors = createAsyncThunk(
  'doctor/getAllDoctors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllDoctorsApi(
        params,
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'Failed to fetch doctors',
        ),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET MY DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const getMyDoctorProfile = createAsyncThunk(
  'doctor/getMyDoctorProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getMyDoctorProfileApi();

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'Failed to fetch your doctor profile',
        ),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET DOCTOR BY ID
|--------------------------------------------------------------------------
*/

export const getDoctorById = createAsyncThunk(
  'doctor/getDoctorById',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response =
        await getDoctorByIdApi(doctorId);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'Failed to fetch doctor',
        ),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| UPDATE MY DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const updateMyDoctorProfile = createAsyncThunk(
  'doctor/updateMyDoctorProfile',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response =
        await updateMyDoctorProfileApi(
          doctorData,
        );

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'Failed to update doctor profile',
        ),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| DEACTIVATE DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const deactivateMyDoctorProfile =
  createAsyncThunk(
    'doctor/deactivateMyDoctorProfile',
    async (_, { rejectWithValue }) => {
      try {
        const response =
          await deactivateMyDoctorProfileApi();

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to deactivate doctor profile',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| ACTIVATE DOCTOR PROFILE
|--------------------------------------------------------------------------
*/

export const activateMyDoctorProfile =
  createAsyncThunk(
    'doctor/activateMyDoctorProfile',
    async (_, { rejectWithValue }) => {
      try {
        const response =
          await activateMyDoctorProfileApi();

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to activate doctor profile',
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
  myDoctor: null,

  selectedDoctor: null,

  doctors: [],

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  isLoading: false,
  isCreating: false,
  isLoadingMyDoctor: false,
  isLoadingDoctor: false,
  isUpdating: false,
  isActivating: false,
  isDeactivating: false,

  error: null,
  createError: null,
  myDoctorError: null,
  selectedDoctorError: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const doctorSlice = createSlice({
  name: 'doctor',

  initialState,

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | CLEAR ERRORS
    |--------------------------------------------------------------------------
    */

    clearDoctorError: state => {
      state.error = null;
      state.createError = null;
      state.myDoctorError = null;
      state.selectedDoctorError = null;
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR SELECTED DOCTOR
    |--------------------------------------------------------------------------
    */

    clearSelectedDoctor: state => {
      state.selectedDoctor = null;
      state.selectedDoctorError = null;
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR MY DOCTOR
    |--------------------------------------------------------------------------
    */

    clearMyDoctor: state => {
      state.myDoctor = null;
      state.myDoctorError = null;
    },

    /*
    |--------------------------------------------------------------------------
    | RESET COMPLETE DOCTOR STATE
    |--------------------------------------------------------------------------
    */

    resetDoctorState: () => {
      return {
        ...initialState,
        pagination: {
          ...initialState.pagination,
        },
      };
    },
  },

  extraReducers: builder => {
    /*
    |--------------------------------------------------------------------------
    | CREATE DOCTOR
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        createDoctor.pending,
        state => {
          state.isCreating = true;
          state.createError = null;
        },
      )

      .addCase(
        createDoctor.fulfilled,
        (state, action) => {
          state.isCreating = false;
          state.createError = null;

          if (action.payload?.doctor) {
            state.myDoctor =
              action.payload.doctor;
          }
        },
      )

      .addCase(
        createDoctor.rejected,
        (state, action) => {
          state.isCreating = false;

          state.createError =
            action.payload ||
            'Failed to create doctor profile';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | GET ALL DOCTORS
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        getAllDoctors.pending,
        state => {
          state.isLoading = true;
          state.error = null;
        },
      )

      .addCase(
        getAllDoctors.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.error = null;

          state.doctors =
            action.payload?.doctors || [];

          if (action.payload?.pagination) {
            state.pagination =
              action.payload.pagination;
          }
        },
      )

      .addCase(
        getAllDoctors.rejected,
        (state, action) => {
          state.isLoading = false;

          state.doctors = [];

          state.error =
            action.payload ||
            'Failed to fetch doctors';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | GET MY DOCTOR
    |--------------------------------------------------------------------------
    */

    builder

      /*
      | IMPORTANT:
      | Clear the previous user's doctor immediately
      | when a new request starts.
      */

      .addCase(
        getMyDoctorProfile.pending,
        state => {
          state.isLoadingMyDoctor = true;

          state.myDoctor = null;

          state.myDoctorError = null;
        },
      )

      .addCase(
        getMyDoctorProfile.fulfilled,
        (state, action) => {
          state.isLoadingMyDoctor = false;

          state.myDoctorError = null;

          state.myDoctor =
            action.payload?.doctor || null;
        },
      )

      .addCase(
        getMyDoctorProfile.rejected,
        (state, action) => {
          state.isLoadingMyDoctor = false;

          /*
           * IMPORTANT:
           * If this user doesn't have a doctor profile,
           * the previous user's doctor must not remain.
           */

          state.myDoctor = null;

          state.myDoctorError =
            action.payload ||
            'Doctor profile not found';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | GET DOCTOR BY ID
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        getDoctorById.pending,
        state => {
          state.isLoadingDoctor = true;

          state.selectedDoctor = null;

          state.selectedDoctorError = null;
        },
      )

      .addCase(
        getDoctorById.fulfilled,
        (state, action) => {
          state.isLoadingDoctor = false;

          state.selectedDoctorError = null;

          state.selectedDoctor =
            action.payload?.doctor || null;
        },
      )

      .addCase(
        getDoctorById.rejected,
        (state, action) => {
          state.isLoadingDoctor = false;

          state.selectedDoctor = null;

          state.selectedDoctorError =
            action.payload ||
            'Failed to fetch doctor';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | UPDATE MY DOCTOR
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        updateMyDoctorProfile.pending,
        state => {
          state.isUpdating = true;
          state.error = null;
        },
      )

      .addCase(
        updateMyDoctorProfile.fulfilled,
        (state, action) => {
          state.isUpdating = false;
          state.error = null;

          if (action.payload?.doctor) {
            state.myDoctor =
              action.payload.doctor;
          }
        },
      )

      .addCase(
        updateMyDoctorProfile.rejected,
        (state, action) => {
          state.isUpdating = false;

          state.error =
            action.payload ||
            'Failed to update doctor profile';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | DEACTIVATE
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        deactivateMyDoctorProfile.pending,
        state => {
          state.isDeactivating = true;
          state.error = null;
        },
      )

      .addCase(
        deactivateMyDoctorProfile.fulfilled,
        (state, action) => {
          state.isDeactivating = false;
          state.error = null;

          if (action.payload?.doctor) {
            state.myDoctor =
              action.payload.doctor;
          } else if (state.myDoctor) {
            state.myDoctor.isActive = false;

            state.myDoctor.availability =
              'unavailable';
          }
        },
      )

      .addCase(
        deactivateMyDoctorProfile.rejected,
        (state, action) => {
          state.isDeactivating = false;

          state.error =
            action.payload ||
            'Failed to deactivate doctor profile';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | ACTIVATE
    |--------------------------------------------------------------------------
    */

    builder

      .addCase(
        activateMyDoctorProfile.pending,
        state => {
          state.isActivating = true;
          state.error = null;
        },
      )

      .addCase(
        activateMyDoctorProfile.fulfilled,
        (state, action) => {
          state.isActivating = false;
          state.error = null;

          if (action.payload?.doctor) {
            state.myDoctor =
              action.payload.doctor;
          } else if (state.myDoctor) {
            state.myDoctor.isActive = true;

            state.myDoctor.availability =
              'available';
          }
        },
      )

      .addCase(
        activateMyDoctorProfile.rejected,
        (state, action) => {
          state.isActivating = false;

          state.error =
            action.payload ||
            'Failed to activate doctor profile';
        },
      );
  },
});

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

export const {
  clearDoctorError,
  clearSelectedDoctor,
  clearMyDoctor,
  resetDoctorState,
} = doctorSlice.actions;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default doctorSlice.reducer;