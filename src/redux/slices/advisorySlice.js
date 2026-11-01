import i18n from '../../translation/i18n';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {
  getFarmAdvisoryApi,
  regenerateFarmAdvisoryApi,
  getFieldConditionsApi,
  updateActivityProgressApi,
} from '../../api/advisoryApi';

/*
|--------------------------------------------------------------------------
| SMART ADVISORY SLICE
|--------------------------------------------------------------------------
|
| The backend generates advisories in the background (20–60 s). When
| `generating` is true the screen polls fetchFarmAdvisory until a fresh
| advisory arrives.
|
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const initialState = {
  fieldId: null,

  advisory: null,
  generating: false,
  stale: false,
  loading: false,
  error: null,
  /** Bumped on every successful fetch so polling can re-arm. */
  fetchedAt: 0,

  conditions: null,
  conditionsLoading: false,
  conditionsError: null,

  /** activityType → true while a progress update is saving */
  progressSaving: {},
};

/*
|--------------------------------------------------------------------------
| GET LATEST ADVISORY
|--------------------------------------------------------------------------
*/

export const fetchFarmAdvisory = createAsyncThunk(
  'advisory/fetchFarmAdvisory',

  async ({fieldId, language = 'en'}, {rejectWithValue}) => {
    try {
      const data = await getFarmAdvisoryApi(fieldId, language);

      return {fieldId, ...data};
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, i18n.t('advisory.err_load')),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| REGENERATE
|--------------------------------------------------------------------------
*/

export const regenerateFarmAdvisory = createAsyncThunk(
  'advisory/regenerateFarmAdvisory',

  async ({fieldId, language = 'en'}, {rejectWithValue}) => {
    try {
      return await regenerateFarmAdvisoryApi(fieldId, language);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, i18n.t('advisory.err_refresh')),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| FIELD CONDITIONS
|--------------------------------------------------------------------------
*/

export const fetchFieldConditions = createAsyncThunk(
  'advisory/fetchFieldConditions',

  async ({fieldId}, {rejectWithValue}) => {
    try {
      const data = await getFieldConditionsApi(fieldId);

      return data?.data ?? null;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, i18n.t('advisory.err_soil')),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| ACTIVITY PROGRESS
|--------------------------------------------------------------------------
*/

export const updateActivityProgress = createAsyncThunk(
  'advisory/updateActivityProgress',

  async ({advisoryId, activityType, progress}, {rejectWithValue}) => {
    try {
      const data = await updateActivityProgressApi(
        advisoryId,
        activityType,
        progress,
      );

      return data?.advisory ?? null;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, i18n.t('advisory.err_activity')),
      );
    }
  },
);

const advisorySlice = createSlice({
  name: 'advisory',

  initialState,

  reducers: {
    resetAdvisory: () => ({...initialState}),
  },

  extraReducers: builder => {
    builder
      /* ---------------- GET ---------------- */

      .addCase(fetchFarmAdvisory.pending, (state, action) => {
        const {fieldId} = action.meta.arg;

        if (state.fieldId !== fieldId) {
          state.fieldId = fieldId;
          state.advisory = null;
        }

        state.loading = !state.advisory;
        state.error = null;
      })

      .addCase(fetchFarmAdvisory.fulfilled, (state, action) => {
        if (action.payload.fieldId !== state.fieldId) {
          return;
        }

        state.loading = false;
        state.advisory = action.payload.advisory ?? state.advisory;
        state.generating = Boolean(action.payload.generating);
        state.stale = Boolean(action.payload.stale);
        state.fetchedAt = Date.now();
      })

      .addCase(fetchFarmAdvisory.rejected, (state, action) => {
        state.loading = false;
        state.generating = false;
        state.error = action.payload || i18n.t('advisory.err_load');
      })

      /* ---------------- REGENERATE ---------------- */

      .addCase(regenerateFarmAdvisory.pending, state => {
        state.generating = true;
        state.error = null;
      })

      .addCase(regenerateFarmAdvisory.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload || i18n.t('advisory.err_refresh');
      })

      /* ---------------- CONDITIONS ---------------- */

      .addCase(fetchFieldConditions.pending, state => {
        state.conditionsLoading = true;
        state.conditionsError = null;
      })

      .addCase(fetchFieldConditions.fulfilled, (state, action) => {
        state.conditionsLoading = false;
        state.conditions = action.payload;
      })

      .addCase(fetchFieldConditions.rejected, (state, action) => {
        state.conditionsLoading = false;
        state.conditionsError = action.payload;
      })

      /* ---------------- PROGRESS ---------------- */

      .addCase(updateActivityProgress.pending, (state, action) => {
        const {activityType, progress} = action.meta.arg;

        state.progressSaving[activityType] = true;

        // Optimistic update
        const activity = state.advisory?.activitiesToDo?.find(
          item => item.type === activityType,
        );

        if (activity) {
          activity.previousProgress = activity.progress ?? null;
          activity.progress = progress;
        }
      })

      .addCase(updateActivityProgress.fulfilled, (state, action) => {
        const {activityType} = action.meta.arg;

        delete state.progressSaving[activityType];

        if (action.payload) {
          state.advisory = action.payload;
        }
      })

      .addCase(updateActivityProgress.rejected, (state, action) => {
        const {activityType} = action.meta.arg;

        delete state.progressSaving[activityType];

        const activity = state.advisory?.activitiesToDo?.find(
          item => item.type === activityType,
        );

        if (activity) {
          activity.progress = activity.previousProgress ?? null;
          delete activity.previousProgress;
        }
      });
  },
});

export const {resetAdvisory} = advisorySlice.actions;

export default advisorySlice.reducer;
