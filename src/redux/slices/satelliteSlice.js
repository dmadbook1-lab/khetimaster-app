import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

import {API_URLS, SATELLITE_API_KEY} from '../../config/api';

const SATELLITE_API = `${API_URLS.satellite}/v4/api`;

const DEFAULT_SATELLITE = 's2';
const DEFAULT_INDEX = 'NDVI';

const initialState = {
  datesData: {
    items: [],
  },

  indexData: null,

  selectedDate: null,
  selectedSatellite: DEFAULT_SATELLITE,
  selectedIndex: DEFAULT_INDEX,

  datesLoading: false,
  indexLoading: false,

  datesError: null,
  indexError: null,
};

const satelliteHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': SATELLITE_API_KEY,
};

/* ============================================================
   DATE HELPERS
============================================================ */

const normalizeDate = date => {
  if (!date) {
    return null;
  }

  if (typeof date === 'string') {
    return date.slice(0, 10);
  }

  return null;
};

const normalizeDates = items => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map(item => {
      if (typeof item === 'string') {
        return {
          date: normalizeDate(item),
          cloud_cover: null,
        };
      }

      return {
        ...item,
        date: normalizeDate(item?.date),
        cloud_cover:
          item?.cloud_cover === null ||
          item?.cloud_cover === undefined
            ? null
            : Number(item.cloud_cover),
      };
    })
    .filter(item => item.date)
    .sort((a, b) => b.date.localeCompare(a.date));
};

/* ============================================================
   AVAILABILITY
============================================================ */

export const fetchDatesData = createAsyncThunk(
  'satellite/fetchDatesData',

  async (
    {
      geometry,
      startDate,
      endDate,
      satellite = DEFAULT_SATELLITE,
    },
    {rejectWithValue},
  ) => {
    try {
      if (!geometry) {
        return rejectWithValue({
          message: 'Farm geometry is missing',
        });
      }

      const response = await axios.post(
        `${SATELLITE_API}/availability/`,
        {
          geometry,
          start_date: startDate,
          end_date: endDate,
          provider: 'both',
          satellite,
        },
        {
          headers: satelliteHeaders,
          timeout: 60000,
        },
      );

      const items = normalizeDates(response?.data?.items);

      return {
        items,
      };
    } catch (error) {
      return rejectWithValue({
        status: error?.response?.status,
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to fetch satellite dates',
      });
    }
  },
);

/* ============================================================
   INDEX
============================================================ */

export const fetchIndexData = createAsyncThunk(
  'satellite/fetchIndexData',

  async (
    {
      geometry,
      endDate,
      index,
      satellite = DEFAULT_SATELLITE,
    },
    {rejectWithValue},
  ) => {
    try {
      if (!geometry) {
        return rejectWithValue({
          message: 'Farm geometry is missing',
        });
      }

      if (!endDate) {
        return rejectWithValue({
          message: 'Satellite date is missing',
        });
      }

      const response = await axios.post(
        `${SATELLITE_API}/calculate/index`,
        {
          geometry,

          date: endDate,

          index_name: index,

          provider: 'both',

          satellite,

          width: 800,
          height: 800,

          supersample: 1,
          smooth: false,
          gaussian_sigma: 1,
        },
        {
          headers: satelliteHeaders,
          timeout: 120000,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error?.response?.status,

        message:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to calculate satellite index',

        data: error?.response?.data,
      });
    }
  },
);

/* ============================================================
   SLICE
============================================================ */

const satelliteSlice = createSlice({
  name: 'satellite',

  initialState,

  reducers: {
    setSelectedSatellite: (state, action) => {
      state.selectedSatellite = action.payload;

      state.indexData = null;
      state.selectedDate = null;
      state.datesData = {
        items: [],
      };

      state.datesError = null;
      state.indexError = null;

      if (action.payload === 's1') {
        state.selectedIndex = 'VV';
      } else {
        state.selectedIndex = 'NDVI';
      }
    },

    setSelectedSatelliteDate: (state, action) => {
      state.selectedDate = action.payload;
      state.indexData = null;
      state.indexError = null;
    },

    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
      state.indexData = null;
      state.indexError = null;
    },

    resetState: state => {
      state.datesData = {
        items: [],
      };

      state.indexData = null;

      state.selectedDate = null;

      state.datesLoading = false;
      state.indexLoading = false;

      state.datesError = null;
      state.indexError = null;
    },
  },

  extraReducers: builder => {
    builder

      /* ---------------- DATE ---------------- */

      .addCase(fetchDatesData.pending, state => {
        state.datesLoading = true;
        state.datesError = null;

        state.datesData = {
          items: [],
        };

        state.selectedDate = null;
        state.indexData = null;
      })

      .addCase(fetchDatesData.fulfilled, (state, action) => {
        state.datesLoading = false;

        state.datesData = {
          items: action.payload?.items || [],
        };
      })

      .addCase(fetchDatesData.rejected, (state, action) => {
        state.datesLoading = false;

        state.datesError =
          action.payload?.message ||
          action.error?.message ||
          'Unable to load satellite dates';
      })

      /* ---------------- INDEX ---------------- */

      .addCase(fetchIndexData.pending, state => {
        state.indexLoading = true;
        state.indexError = null;
        state.indexData = null;
      })

      .addCase(fetchIndexData.fulfilled, (state, action) => {
        state.indexLoading = false;

        state.indexData = action.payload;
      })

      .addCase(fetchIndexData.rejected, (state, action) => {
        state.indexLoading = false;

        state.indexError = {
          status: action.payload?.status,
          message:
            action.payload?.message ||
            action.error?.message ||
            'Unable to calculate satellite index',
        };
      });
  },
});

export const {
  setSelectedSatellite,
  setSelectedSatelliteDate,
  setSelectedIndex,
  resetState,
} = satelliteSlice.actions;

export default satelliteSlice.reducer;