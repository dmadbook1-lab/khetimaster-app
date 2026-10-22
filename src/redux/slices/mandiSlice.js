import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getMandiCropsApi,
  getMandiStatesApi,
  getMandiDistrictsApi,
  getMandiRatesApi,
} from '../../api/mandiApi';
import { summaryKey } from '../../utils/mandiFormat';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| LISTS
|--------------------------------------------------------------------------
*/

export const fetchMandiCrops = createAsyncThunk(
  'mandi/fetchCrops',
  async (_, { rejectWithValue }) => {
    try {
      return await getMandiCropsApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load crops'));
    }
  },
);

export const fetchMandiStates = createAsyncThunk(
  'mandi/fetchStates',
  async (_, { rejectWithValue }) => {
    try {
      return await getMandiStatesApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load states'));
    }
  },
);

export const fetchMandiDistricts = createAsyncThunk(
  'mandi/fetchDistricts',
  async (state, { rejectWithValue }) => {
    try {
      return await getMandiDistrictsApi(state);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load districts'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| RATES
|--------------------------------------------------------------------------
|
| {params, append} - the crop screen's market list. append adds the
| next page.
|
*/

export const fetchMandiRates = createAsyncThunk(
  'mandi/fetchRates',
  async ({ params }, { rejectWithValue }) => {
    try {
      return await getMandiRatesApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load mandi prices'),
      );
    }
  },
);

/*
 * Only the summary of a query, for comparisons and the trend chart.
 * {crop, state, district, arrivalDate, force}. Stored under summaryKey(arg).
 */
export const fetchMandiSummary = createAsyncThunk(
  'mandi/fetchSummary',
  async (arg, { rejectWithValue }) => {
    try {
      const { force, ...params } = arg;
      const response = await getMandiRatesApi({ ...params, limit: 1 });
      return {
        summary: response.summary,
        source: response.source,
        stale: response.stale,
      };
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load prices'));
    }
  },
  {
    // a summary that is loading or loaded isn't fetched again (unless force)
    condition: (arg, { getState }) => {
      const entry = getState().mandi.summaries[summaryKey(arg)];
      if (entry?.status === 'loading') return false;
      return arg.force || !entry || entry.status === 'error';
    },
  },
);

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const emptyRates = {
  key: null,
  data: [],
  summary: null,
  source: null,
  stale: false,
  truncated: false,
  fetchedAt: null,
  filters: null,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  loadingMore: false,
  error: null,
};

const initialState = {
  crops: [],
  cropsStatus: 'idle',
  cropsError: null,

  states: [],
  districts: {},
  districtsLoading: false,

  // {state, district} chosen by the user; null until set
  location: null,

  rates: emptyRates,

  // summaryKey -> {status: loading | loaded | error, summary, source}
  summaries: {},

  // crops opened recently, newest first: [{id, name, category}]
  recentCrops: [],
};

const ratesKey = params =>
  JSON.stringify({ ...params, page: undefined, limit: undefined });

const mandiSlice = createSlice({
  name: 'mandi',

  initialState,

  reducers: {
    setMandiLocation: (state, action) => {
      state.location = action.payload;
    },

    addRecentCrop: (state, action) => {
      const crop = action.payload;
      if (!crop?.id) return;

      state.recentCrops = [
        { id: crop.id, name: crop.name, category: crop.category },
        ...state.recentCrops.filter(item => item.id !== crop.id),
      ].slice(0, 6);
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchMandiCrops.pending, state => {
        state.cropsStatus = state.crops.length ? 'loaded' : 'loading';
        state.cropsError = null;
      })
      .addCase(fetchMandiCrops.fulfilled, (state, action) => {
        state.cropsStatus = 'loaded';
        state.crops = action.payload?.data || [];
      })
      .addCase(fetchMandiCrops.rejected, (state, action) => {
        state.cropsStatus = state.crops.length ? 'loaded' : 'error';
        state.cropsError = action.payload;
      })

      .addCase(fetchMandiStates.fulfilled, (state, action) => {
        state.states = action.payload?.data || [];
      })

      .addCase(fetchMandiDistricts.pending, state => {
        state.districtsLoading = true;
      })
      .addCase(fetchMandiDistricts.fulfilled, (state, action) => {
        state.districtsLoading = false;
        state.districts[action.meta.arg] = action.payload?.data || [];
      })
      .addCase(fetchMandiDistricts.rejected, state => {
        state.districtsLoading = false;
      });

    builder
      .addCase(fetchMandiRates.pending, (state, action) => {
        const key = ratesKey(action.meta.arg.params);

        if (action.meta.arg.append) {
          state.rates.loadingMore = true;
        } else {
          // keep the old numbers on screen while refreshing the same query
          if (state.rates.key !== key) state.rates = { ...emptyRates, key };
          state.rates.loading = true;
        }

        state.rates.error = null;
      })
      .addCase(fetchMandiRates.fulfilled, (state, action) => {
        const key = ratesKey(action.meta.arg.params);
        if (state.rates.key !== key) return;

        const payload = action.payload || {};
        const data = payload.data || [];

        state.rates = {
          ...state.rates,
          data: action.meta.arg.append ? [...state.rates.data, ...data] : data,
          summary: payload.summary || null,
          source: payload.source || null,
          stale: Boolean(payload.stale),
          truncated: Boolean(payload.truncated),
          fetchedAt: payload.fetchedAt || null,
          filters: payload.filters || null,
          total: payload.total || 0,
          page: payload.page || 1,
          pages: payload.pages || 1,
          loading: false,
          loadingMore: false,
        };

        // the full query also gives this location's summary for free
        const params = action.meta.arg.params;
        if (!params.market && !params.variety) {
          state.summaries[summaryKey(params)] = {
            status: 'loaded',
            summary: payload.summary,
            source: payload.source,
          };
        }
      })
      .addCase(fetchMandiRates.rejected, (state, action) => {
        if (state.rates.key !== ratesKey(action.meta.arg.params)) return;

        state.rates.loading = false;
        state.rates.loadingMore = false;
        state.rates.error = action.payload;
      });

    builder
      .addCase(fetchMandiSummary.pending, (state, action) => {
        state.summaries[summaryKey(action.meta.arg)] = { status: 'loading' };
      })
      .addCase(fetchMandiSummary.fulfilled, (state, action) => {
        state.summaries[summaryKey(action.meta.arg)] = {
          status: 'loaded',
          ...action.payload,
        };
      })
      .addCase(fetchMandiSummary.rejected, (state, action) => {
        state.summaries[summaryKey(action.meta.arg)] = {
          status: 'error',
          error: action.payload,
        };
      });
  },
});

export const { setMandiLocation, addRecentCrop } = mandiSlice.actions;

export default mandiSlice.reducer;
