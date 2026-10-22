import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  createDoctorConsultationApi,
  getMyConsultationsApi,
  getDoctorRequestsApi,
  getDoctorConsultationByIdApi,
  acceptDoctorConsultationApi,
  rejectDoctorConsultationApi,
  cancelDoctorConsultationApi,
  completeDoctorConsultationApi,
  updateConsultationNotesApi,
  reviewDoctorConsultationApi,
} from '../../api/doctorConsultationApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| CREATE (FARMER)
|--------------------------------------------------------------------------
|
| Rejects with {message, consultationId}. consultationId is set when the
| farmer already has a consultation with this doctor that day (409).
|
*/

export const createConsultation = createAsyncThunk(
  'doctorConsultation/create',
  async (consultationData, { rejectWithValue }) => {
    try {
      return await createDoctorConsultationApi(consultationData);
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'Unable to send the request'),
        consultationId: error.response?.data?.consultation?._id || null,
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| LISTS
|--------------------------------------------------------------------------
|
| {params: {status, date, page, limit}, append}
|
*/

export const fetchMyConsultations = createAsyncThunk(
  'doctorConsultation/fetchMine',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getMyConsultationsApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load your consultations'),
      );
    }
  },
);

export const fetchDoctorRequests = createAsyncThunk(
  'doctorConsultation/fetchRequests',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getDoctorRequestsApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load requests'));
    }
  },
);

export const fetchConsultationById = createAsyncThunk(
  'doctorConsultation/fetchById',
  async (consultationId, { rejectWithValue }) => {
    try {
      return await getDoctorConsultationByIdApi(consultationId);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load consultation'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
|
| {consultationId, action, reason, outcome}
|   accept | reject (reason) | cancel (reason) |
|   complete (outcome) | notes (outcome)
|
*/

const ACTION_APIS = {
  accept: ({ consultationId }) => acceptDoctorConsultationApi(consultationId),
  reject: ({ consultationId, reason }) =>
    rejectDoctorConsultationApi(consultationId, reason),
  cancel: ({ consultationId, reason }) =>
    cancelDoctorConsultationApi(consultationId, reason),
  complete: ({ consultationId, outcome }) =>
    completeDoctorConsultationApi(consultationId, outcome),
  notes: ({ consultationId, outcome }) =>
    updateConsultationNotesApi(consultationId, outcome),
};

export const updateConsultation = createAsyncThunk(
  'doctorConsultation/update',
  async (arg, { rejectWithValue }) => {
    try {
      return await ACTION_APIS[arg.action](arg);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to update consultation'),
      );
    }
  },
);

export const reviewConsultation = createAsyncThunk(
  'doctorConsultation/review',
  async ({ consultationId, rating, comment }, { rejectWithValue }) => {
    try {
      return await reviewDoctorConsultationApi(consultationId, {
        rating,
        comment,
      });
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to submit review'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| STATE
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
  myConsultations: emptyList,
  requests: emptyList,

  selected: null,
  selectedLoading: false,
  selectedError: null,

  creating: false,
  // name of the action in flight, e.g. 'accept'
  actionInProgress: null,
  // consultation the action is for (list quick actions)
  actionTargetId: null,
};

const storeConsultation = (state, consultation) => {
  if (!consultation?._id) return;

  if (state.selected?._id === consultation._id || !state.selected) {
    state.selected = consultation;
  }

  for (const key of ['myConsultations', 'requests']) {
    state[key].items = state[key].items.map(item =>
      item._id === consultation._id ? consultation : item,
    );
  }
};

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
      const consultations = action.payload?.consultations || [];

      list.loading = false;
      list.loadingMore = false;

      if (action.meta.arg?.append) {
        const known = new Set(list.items.map(item => item._id));
        list.items = [
          ...list.items,
          ...consultations.filter(item => !known.has(item._id)),
        ];
      } else {
        list.items = consultations;
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

const doctorConsultationSlice = createSlice({
  name: 'doctorConsultation',

  initialState,

  reducers: {
    clearSelectedConsultation: state => {
      state.selected = null;
      state.selectedError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(createConsultation.pending, state => {
        state.creating = true;
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        state.creating = false;

        const consultation = action.payload?.consultation;

        if (consultation?._id) {
          state.selected = consultation;
          state.myConsultations.items.unshift(consultation);
        }
      })
      .addCase(createConsultation.rejected, state => {
        state.creating = false;
      });

    addListCases(builder, fetchMyConsultations, 'myConsultations');
    addListCases(builder, fetchDoctorRequests, 'requests');

    builder
      .addCase(fetchConsultationById.pending, (state, action) => {
        state.selectedLoading = true;
        state.selectedError = null;

        if (state.selected?._id !== action.meta.arg) {
          state.selected = null;
        }
      })
      .addCase(fetchConsultationById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload?.consultation || null;
        storeConsultation(state, state.selected);
      })
      .addCase(fetchConsultationById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload;
      });

    for (const thunk of [updateConsultation, reviewConsultation]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.actionInProgress = action.meta.arg.action || 'review';
          state.actionTargetId = action.meta.arg.consultationId;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.actionInProgress = null;
          state.actionTargetId = null;
          storeConsultation(state, action.payload?.consultation);
        })
        .addCase(thunk.rejected, state => {
          state.actionInProgress = null;
          state.actionTargetId = null;
        });
    }
  },
});

export const { clearSelectedConsultation } = doctorConsultationSlice.actions;

export default doctorConsultationSlice.reducer;
