import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  createDoctorConsultationApi,
  getMyConsultationsApi,
  getDoctorRequestsApi,
  getDoctorConsultationByIdApi,
  acceptDoctorConsultationApi,
  rejectDoctorConsultationApi,
  cancelDoctorConsultationApi,
  completeDoctorConsultationApi,
} from '../../api/doctorConsultationApi';

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
| CREATE CONSULTATION
|--------------------------------------------------------------------------
*/

export const createDoctorConsultation =
  createAsyncThunk(
    'doctorConsultation/createDoctorConsultation',
    async (
      consultationData,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await createDoctorConsultationApi(
            consultationData,
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to create consultation',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET MY CONSULTATIONS
|--------------------------------------------------------------------------
*/

export const getMyConsultations =
  createAsyncThunk(
    'doctorConsultation/getMyConsultations',
    async (
      params = {},
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getMyConsultationsApi(
            params,
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to fetch consultations',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET DOCTOR REQUESTS
|--------------------------------------------------------------------------
*/

export const getDoctorRequests =
  createAsyncThunk(
    'doctorConsultation/getDoctorRequests',
    async (
      params = {},
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getDoctorRequestsApi(
            params,
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to fetch consultation requests',
          ),
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET CONSULTATION BY ID
|--------------------------------------------------------------------------
*/

export const getDoctorConsultationById =
  createAsyncThunk(
    'doctorConsultation/getDoctorConsultationById',
    async (
      consultationId,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getDoctorConsultationByIdApi(
            consultationId,
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to fetch consultation',
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

export const acceptDoctorConsultation =
  createAsyncThunk(
    'doctorConsultation/acceptDoctorConsultation',
    async (
      consultationId,
      { rejectWithValue },
    ) => {
      try {
        const response =
          await acceptDoctorConsultationApi(
            consultationId,
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to accept consultation',
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

export const rejectDoctorConsultation =
  createAsyncThunk(
    'doctorConsultation/rejectDoctorConsultation',
    async (
      {
        consultationId,
        cancellationReason = '',
      },
      { rejectWithValue },
    ) => {
      try {
        const response =
          await rejectDoctorConsultationApi(
            consultationId,
            {
              cancellationReason,
            },
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to reject consultation',
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

export const cancelDoctorConsultation =
  createAsyncThunk(
    'doctorConsultation/cancelDoctorConsultation',
    async (
      {
        consultationId,
        cancellationReason = '',
      },
      { rejectWithValue },
    ) => {
      try {
        const response =
          await cancelDoctorConsultationApi(
            consultationId,
            {
              cancellationReason,
            },
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to cancel consultation',
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

export const completeDoctorConsultation =
  createAsyncThunk(
    'doctorConsultation/completeDoctorConsultation',
    async (
      {
        consultationId,
        doctorNotes = '',
        diagnosis = '',
        prescription = '',
      },
      { rejectWithValue },
    ) => {
      try {
        const response =
          await completeDoctorConsultationApi(
            consultationId,
            {
              doctorNotes,
              diagnosis,
              prescription,
            },
          );

        return response;
      } catch (error) {
        return rejectWithValue(
          getErrorMessage(
            error,
            'Failed to complete consultation',
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
  myConsultations: [],

  myConsultationsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  doctorRequests: [],

  doctorRequestsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  selectedConsultation: null,

  isCreating: false,
  isLoadingMyConsultations: false,
  isLoadingDoctorRequests: false,
  isLoadingConsultation: false,

  isAccepting: false,
  isRejecting: false,
  isCancelling: false,
  isCompleting: false,

  error: null,
  createError: null,
  myConsultationsError: null,
  doctorRequestsError: null,
  consultationError: null,
  actionError: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const doctorConsultationSlice =
  createSlice({
    name: 'doctorConsultation',

    initialState,

    reducers: {
      /*
      |--------------------------------------------------------------------------
      | CLEAR ERRORS
      |--------------------------------------------------------------------------
      */

      clearDoctorConsultationErrors:
        state => {
          state.error = null;
          state.createError = null;
          state.myConsultationsError = null;
          state.doctorRequestsError = null;
          state.consultationError = null;
          state.actionError = null;
        },

      /*
      |--------------------------------------------------------------------------
      | CLEAR SELECTED
      |--------------------------------------------------------------------------
      */

      clearSelectedConsultation:
        state => {
          state.selectedConsultation = null;
          state.consultationError = null;
        },

      /*
      |--------------------------------------------------------------------------
      | CLEAR MY CONSULTATIONS
      |--------------------------------------------------------------------------
      */

      clearMyConsultations: state => {
        state.myConsultations = [];

        state.myConsultationsPagination = {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };

        state.myConsultationsError = null;
      },

      /*
      |--------------------------------------------------------------------------
      | CLEAR DOCTOR REQUESTS
      |--------------------------------------------------------------------------
      */

      clearDoctorRequests: state => {
        state.doctorRequests = [];

        state.doctorRequestsPagination = {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };

        state.doctorRequestsError = null;
      },

      /*
      |--------------------------------------------------------------------------
      | RESET COMPLETE STATE
      |--------------------------------------------------------------------------
      */

      resetDoctorConsultationState:
        () => {
          return {
            ...initialState,

            myConsultationsPagination: {
              ...initialState.myConsultationsPagination,
            },

            doctorRequestsPagination: {
              ...initialState.doctorRequestsPagination,
            },
          };
        },
    },

    extraReducers: builder => {
      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          createDoctorConsultation.pending,
          state => {
            state.isCreating = true;
            state.createError = null;
          },
        )

        .addCase(
          createDoctorConsultation.fulfilled,
          (state, action) => {
            state.isCreating = false;
            state.createError = null;

            const consultation =
              action.payload
                ?.consultation;

            if (consultation) {
              state.selectedConsultation =
                consultation;

              /*
               * Add newest consultation to
               * current user's list.
               */

              state.myConsultations = [
                consultation,
                ...state.myConsultations,
              ];
            }
          },
        )

        .addCase(
          createDoctorConsultation.rejected,
          (state, action) => {
            state.isCreating = false;

            state.createError =
              action.payload ||
              'Failed to create consultation';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | GET MY CONSULTATIONS
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          getMyConsultations.pending,
          state => {
            state.isLoadingMyConsultations =
              true;

            /*
             * VERY IMPORTANT:
             * Clear previous user's consultations
             * immediately.
             */

            state.myConsultations = [];

            state.myConsultationsPagination = {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            };

            state.myConsultationsError = null;
          },
        )

        .addCase(
          getMyConsultations.fulfilled,
          (state, action) => {
            state.isLoadingMyConsultations =
              false;

            state.myConsultations =
              action.payload
                ?.consultations || [];

            state.myConsultationsPagination =
              action.payload
                ?.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
              };

            state.myConsultationsError =
              null;
          },
        )

        .addCase(
          getMyConsultations.rejected,
          (state, action) => {
            state.isLoadingMyConsultations =
              false;

            /*
             * VERY IMPORTANT:
             * Never keep old user's bookings.
             */

            state.myConsultations = [];

            state.myConsultationsPagination = {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            };

            state.myConsultationsError =
              action.payload ||
              'Failed to fetch consultations';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | GET DOCTOR REQUESTS
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          getDoctorRequests.pending,
          state => {
            state.isLoadingDoctorRequests =
              true;

            state.doctorRequests = [];

            state.doctorRequestsPagination = {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            };

            state.doctorRequestsError = null;
          },
        )

        .addCase(
          getDoctorRequests.fulfilled,
          (state, action) => {
            state.isLoadingDoctorRequests =
              false;

            state.doctorRequests =
              action.payload
                ?.consultations || [];

            state.doctorRequestsPagination =
              action.payload
                ?.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
              };

            state.doctorRequestsError =
              null;
          },
        )

        .addCase(
          getDoctorRequests.rejected,
          (state, action) => {
            state.isLoadingDoctorRequests =
              false;

            state.doctorRequests = [];

            state.doctorRequestsPagination = {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            };

            state.doctorRequestsError =
              action.payload ||
              'Failed to fetch consultation requests';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | GET CONSULTATION BY ID
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          getDoctorConsultationById.pending,
          state => {
            state.isLoadingConsultation =
              true;

            state.selectedConsultation = null;

            state.consultationError = null;
          },
        )

        .addCase(
          getDoctorConsultationById.fulfilled,
          (state, action) => {
            state.isLoadingConsultation =
              false;

            state.selectedConsultation =
              action.payload
                ?.consultation || null;

            state.consultationError = null;
          },
        )

        .addCase(
          getDoctorConsultationById.rejected,
          (state, action) => {
            state.isLoadingConsultation =
              false;

            state.selectedConsultation = null;

            state.consultationError =
              action.payload ||
              'Failed to fetch consultation';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | ACCEPT
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          acceptDoctorConsultation.pending,
          state => {
            state.isAccepting = true;
            state.actionError = null;
          },
        )

        .addCase(
          acceptDoctorConsultation.fulfilled,
          (state, action) => {
            state.isAccepting = false;
            state.actionError = null;

            const consultation =
              action.payload
                ?.consultation;

            if (consultation) {
              state.selectedConsultation =
                consultation;

              state.myConsultations =
                state.myConsultations.map(
                  item =>
                    item._id ===
                    consultation._id
                      ? consultation
                      : item,
                );

              state.doctorRequests =
                state.doctorRequests.map(
                  item =>
                    item._id ===
                    consultation._id
                      ? consultation
                      : item,
                );
            }
          },
        )

        .addCase(
          acceptDoctorConsultation.rejected,
          (state, action) => {
            state.isAccepting = false;

            state.actionError =
              action.payload ||
              'Failed to accept consultation';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | REJECT
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          rejectDoctorConsultation.pending,
          state => {
            state.isRejecting = true;
            state.actionError = null;
          },
        )

        .addCase(
          rejectDoctorConsultation.fulfilled,
          (state, action) => {
            state.isRejecting = false;
            state.actionError = null;

            const consultation =
              action.payload
                ?.consultation;

            if (consultation) {
              state.selectedConsultation =
                consultation;

              state.myConsultations =
                state.myConsultations.map(
                  item =>
                    item._id ===
                    consultation._id
                      ? consultation
                      : item,
                );

              state.doctorRequests =
                state.doctorRequests.filter(
                  item =>
                    item._id !==
                    consultation._id,
                );
            }
          },
        )

        .addCase(
          rejectDoctorConsultation.rejected,
          (state, action) => {
            state.isRejecting = false;

            state.actionError =
              action.payload ||
              'Failed to reject consultation';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | CANCEL
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          cancelDoctorConsultation.pending,
          state => {
            state.isCancelling = true;
            state.actionError = null;
          },
        )

        .addCase(
          cancelDoctorConsultation.fulfilled,
          (state, action) => {
            state.isCancelling = false;
            state.actionError = null;

            const consultation =
              action.payload
                ?.consultation;

            if (consultation) {
              state.selectedConsultation =
                consultation;

              state.myConsultations =
                state.myConsultations.map(
                  item =>
                    item._id ===
                    consultation._id
                      ? consultation
                      : item,
                );

              state.doctorRequests =
                state.doctorRequests.filter(
                  item =>
                    item._id !==
                    consultation._id,
                );
            }
          },
        )

        .addCase(
          cancelDoctorConsultation.rejected,
          (state, action) => {
            state.isCancelling = false;

            state.actionError =
              action.payload ||
              'Failed to cancel consultation';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | COMPLETE
      |--------------------------------------------------------------------------
      */

      builder

        .addCase(
          completeDoctorConsultation.pending,
          state => {
            state.isCompleting = true;
            state.actionError = null;
          },
        )

        .addCase(
          completeDoctorConsultation.fulfilled,
          (state, action) => {
            state.isCompleting = false;
            state.actionError = null;

            const consultation =
              action.payload
                ?.consultation;

            if (consultation) {
              state.selectedConsultation =
                consultation;

              state.myConsultations =
                state.myConsultations.map(
                  item =>
                    item._id ===
                    consultation._id
                      ? consultation
                      : item,
                );

              state.doctorRequests =
                state.doctorRequests.filter(
                  item =>
                    item._id !==
                    consultation._id,
                );
            }
          },
        )

        .addCase(
          completeDoctorConsultation.rejected,
          (state, action) => {
            state.isCompleting = false;

            state.actionError =
              action.payload ||
              'Failed to complete consultation';
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
  clearDoctorConsultationErrors,
  clearSelectedConsultation,
  clearMyConsultations,
  clearDoctorRequests,
  resetDoctorConsultationState,
} =
  doctorConsultationSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectMyConsultations =
  state =>
    state.doctorConsultation
      ?.myConsultations || [];

export const selectDoctorRequests =
  state =>
    state.doctorConsultation
      ?.doctorRequests || [];

export const selectSelectedConsultation =
  state =>
    state.doctorConsultation
      ?.selectedConsultation || null;

export const selectDoctorConsultationLoading =
  state =>
    state.doctorConsultation
      ?.isLoadingConsultation || false;

export const selectCreatingConsultation =
  state =>
    state.doctorConsultation
      ?.isCreating || false;

export const selectAcceptingConsultation =
  state =>
    state.doctorConsultation
      ?.isAccepting || false;

export const selectRejectingConsultation =
  state =>
    state.doctorConsultation
      ?.isRejecting || false;

export const selectCancellingConsultation =
  state =>
    state.doctorConsultation
      ?.isCancelling || false;

export const selectCompletingConsultation =
  state =>
    state.doctorConsultation
      ?.isCompleting || false;

export default doctorConsultationSlice.reducer;