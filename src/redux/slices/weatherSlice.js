import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

import {getLocalWeatherApi} from '../../api/weatherApi';

const OBSERVEARTH_API_KEY = '5b97d3f0-a01a-490b-aad1-3bfa848309f2';

const VISUAL_CROSSING_KEY =
  process.env.VISUAL_CROSSING_KEY || 'NAJUNXK89Y3ZLPJL3NYH6BS4E';

const OBSERVEARTH_BASE_URL = 'https://observearth.com/api';

function safeStringifyForReject(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getErrorMessage(error, fallback) {
  const raw =
    error?.response?.data ||
    error?.message ||
    fallback;

  if (typeof raw === 'string') {
    return raw;
  }

  return safeStringifyForReject(raw);
}

/**
 * ---------------------------------------------------------
 * VISUAL CROSSING
 * ---------------------------------------------------------
 *
 * Used when we only have latitude + longitude.
 */
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async ({latitude, longitude} = {}, {rejectWithValue}) => {
    const hasLatLon =
      latitude != null &&
      longitude != null &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude));

    if (!hasLatLon) {
      return rejectWithValue('latitude and longitude required');
    }

    try {
      const url =
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
        `${latitude},${longitude}?key=${VISUAL_CROSSING_KEY}`;

      const response = await axios.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch current weather'),
      );
    }
  },
);

/**
 * ---------------------------------------------------------
 * CREATE OBSERVEARTH AOI
 * ---------------------------------------------------------
 *
 * Payload expected:
 *
 * {
 *   name: 'Farm Name',
 *   geometry: {
 *     type: 'Polygon',
 *     coordinates: [...]
 *   }
 * }
 */
export const createAOI = createAsyncThunk(
  'weather/createAOI',
  async (payload, {rejectWithValue}) => {
    try {
      const response = await axios.post(
        `${OBSERVEARTH_BASE_URL}/geometry/`,
        payload,
        {
          headers: {
            'X-API-Key': OBSERVEARTH_API_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data?.id ?? response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to create weather AOI'),
      );
    }
  },
);

/**
 * ---------------------------------------------------------
 * FETCH AOIs
 * ---------------------------------------------------------
 */
export const fetchAOIs = createAsyncThunk(
  'weather/fetchAOIs',
  async (_, {rejectWithValue}) => {
    try {
      const response = await axios.get(
        `${OBSERVEARTH_BASE_URL}/geometry/?detail=false`,
        {
          headers: {
            'X-API-Key': OBSERVEARTH_API_KEY,
          },
        },
      );

      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }

      return Array.isArray(data?.results)
        ? data.results
        : [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch AOIs'),
      );
    }
  },
);

/**
 * ---------------------------------------------------------
 * FETCH OBSERVEARTH FORECAST
 * ---------------------------------------------------------
 */
export const fetchForecastData = createAsyncThunk(
  'weather/fetchForecastData',
  async ({geometry_id}, {rejectWithValue}) => {
    if (!geometry_id) {
      return rejectWithValue('geometry_id required');
    }

    try {
      const response = await axios.get(
        `${OBSERVEARTH_BASE_URL}/weather/forecast/`,
        {
          params: {
            geometry_id,
          },
          headers: {
            'X-API-Key': OBSERVEARTH_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch forecast data'),
      );
    }
  },
);

/**
 * ---------------------------------------------------------
 * CURRENT OBSERVEARTH WEATHER
 * ---------------------------------------------------------
 *
 * Useful if later you want current conditions from the AOI.
 */
export const fetchAOICurrentWeather = createAsyncThunk(
  'weather/fetchAOICurrentWeather',
  async ({geometry_id}, {rejectWithValue}) => {
    if (!geometry_id) {
      return rejectWithValue('geometry_id required');
    }

    try {
      const response = await axios.get(
        `${OBSERVEARTH_BASE_URL}/weather/current/`,
        {
          params: {
            geometry_id,
          },
          headers: {
            'X-API-Key': OBSERVEARTH_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          'Failed to fetch current AOI weather',
        ),
      );
    }
  },
);

/**
 * ---------------------------------------------------------
 * LOCAL WEATHER (home card + Weather screens)
 * ---------------------------------------------------------
 *
 * {latitude, longitude, force}. Skipped when the same place was loaded
 * in the last 15 minutes, unless force.
 */
const LOCAL_TTL_MS = 15 * 60 * 1000;

const coordsKeyOf = (latitude, longitude) =>
  `${Number(latitude).toFixed(2)},${Number(longitude).toFixed(2)}`;

export const fetchLocalWeather = createAsyncThunk(
  'weather/fetchLocalWeather',
  async ({latitude, longitude}, {rejectWithValue}) => {
    try {
      const data = await getLocalWeatherApi({latitude, longitude});

      return {
        address: data.resolvedAddress || '',
        timezone: data.timezone || '',
        current: data.currentConditions || null,
        days: Array.isArray(data.days) ? data.days : [],
        alerts: Array.isArray(data.alerts) ? data.alerts : [],
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.status === 429
          ? 'Weather service is busy. Please try again in a minute.'
          : error?.response
          ? 'Couldn’t load the weather. Please try again.'
          : 'No internet connection. Weather needs a connection.',
      );
    }
  },
  {
    condition: ({latitude, longitude, force} = {}, {getState}) => {
      if (
        !Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude))
      ) {
        return false;
      }

      const local = getState().weather.local;
      if (local.status === 'loading') return false;
      if (force) return true;

      return !(
        local.data &&
        local.coordsKey === coordsKeyOf(latitude, longitude) &&
        Date.now() - local.fetchedAt < LOCAL_TTL_MS
      );
    },
  },
);

const initialState = {
  // idle | loading | loaded | error
  local: {
    data: null,
    status: 'idle',
    error: null,
    fetchedAt: null,
    coordsKey: null,
  },

  currentWeather: null,
  timelineDays: null,

  forecastData: null,
  aoiCurrentWeather: null,

  aois: [],
  aoiId: null,

  isLoading: {
    currentWeather: false,
    forecast: false,
    aois: false,
    createAoi: false,
    aoiCurrentWeather: false,
  },

  loading: false,
  error: null,
};

const weatherSlice = createSlice({
  name: 'weather',

  initialState,

  reducers: {
    clearWeatherCache: state => {
      state.currentWeather = null;
      state.timelineDays = null;
      state.forecastData = null;
      state.aoiCurrentWeather = null;
      state.aois = [];
      state.aoiId = null;
      state.error = null;
    },

    clearWeatherError: state => {
      state.error = null;
    },

    setWeatherAoiId: (state, action) => {
      state.aoiId = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchLocalWeather.pending, state => {
        state.local.status = 'loading';
        state.local.error = null;
      })
      .addCase(fetchLocalWeather.fulfilled, (state, action) => {
        const {latitude, longitude} = action.meta.arg;
        state.local = {
          data: action.payload,
          status: 'loaded',
          error: null,
          fetchedAt: Date.now(),
          coordsKey: coordsKeyOf(latitude, longitude),
        };
      })
      .addCase(fetchLocalWeather.rejected, (state, action) => {
        // keep showing older weather if there is some
        state.local.status = state.local.data ? 'loaded' : 'error';
        state.local.error = action.payload || action.error?.message;
      });

    builder

      // =====================================================
      // VISUAL CROSSING
      // =====================================================

      .addCase(fetchWeatherData.pending, state => {
        state.isLoading.currentWeather = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.currentWeather =
          action.payload?.currentConditions ?? null;

        state.timelineDays = Array.isArray(action.payload?.days)
          ? action.payload.days
          : null;

        state.isLoading.currentWeather = false;
        state.loading = false;
      })

      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.isLoading.currentWeather = false;
        state.loading = false;
        state.error =
          action.payload || action.error?.message;
      })

      // =====================================================
      // CREATE AOI
      // =====================================================

      .addCase(createAOI.pending, state => {
        state.isLoading.createAoi = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(createAOI.fulfilled, (state, action) => {
        state.aoiId = action.payload;
        state.isLoading.createAoi = false;
        state.loading = false;
      })

      .addCase(createAOI.rejected, (state, action) => {
        state.isLoading.createAoi = false;
        state.loading = false;
        state.error =
          action.payload || action.error?.message;
      })

      // =====================================================
      // FETCH AOIs
      // =====================================================

      .addCase(fetchAOIs.pending, state => {
        state.isLoading.aois = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAOIs.fulfilled, (state, action) => {
        state.aois = Array.isArray(action.payload)
          ? action.payload
          : [];

        state.isLoading.aois = false;
        state.loading = false;
      })

      .addCase(fetchAOIs.rejected, (state, action) => {
        state.isLoading.aois = false;
        state.loading = false;
        state.error =
          action.payload || action.error?.message;
      })

      // =====================================================
      // OBSERVEARTH FORECAST
      // =====================================================

      .addCase(fetchForecastData.pending, state => {
        state.isLoading.forecast = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchForecastData.fulfilled, (state, action) => {
        state.forecastData = action.payload;

        state.isLoading.forecast = false;
        state.loading = false;
      })

      .addCase(fetchForecastData.rejected, (state, action) => {
        state.isLoading.forecast = false;
        state.loading = false;
        state.error =
          action.payload || action.error?.message;
      })

      // =====================================================
      // AOI CURRENT WEATHER
      // =====================================================

      .addCase(fetchAOICurrentWeather.pending, state => {
        state.isLoading.aoiCurrentWeather = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchAOICurrentWeather.fulfilled,
        (state, action) => {
          state.aoiCurrentWeather = action.payload;

          state.isLoading.aoiCurrentWeather = false;
          state.loading = false;
        },
      )

      .addCase(
        fetchAOICurrentWeather.rejected,
        (state, action) => {
          state.isLoading.aoiCurrentWeather = false;
          state.loading = false;
          state.error =
            action.payload || action.error?.message;
        },
      );
  },
});

export const {
  clearWeatherCache,
  clearWeatherError,
  setWeatherAoiId,
} = weatherSlice.actions;

export default weatherSlice.reducer;