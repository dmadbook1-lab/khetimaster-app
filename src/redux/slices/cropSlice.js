import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

import {API_URLS, SATELLITE_API_KEY} from '../../config/api';
import i18n from 'i18next';

const SATELLITE_API = API_URLS.satellite;
const API_KEY = SATELLITE_API_KEY;

/**
 * Fetch crop health score
 *
 * CropGen API:
 * POST /v4/api/crop-health/score
 *
 * Required:
 * - geometry
 * - date
 * - sowing_date
 * - satellite = s2
 */
export const fetchCropHealth = createAsyncThunk(
  'crop/fetchCropHealth',
  async (
    {
      geometry,
      date,
      sowingDate,
      provider = 'both',
      satellite = 's2',
    },
    {rejectWithValue},
  ) => {
    try {
      if (!geometry) {
        return rejectWithValue({
          status: 400,
          message: i18n.t('cropSlice.farmGeometryIsRequired'),
        });
      }

      if (!date) {
        return rejectWithValue({
          status: 400,
          message: i18n.t('cropSlice.satelliteDateIsRequired'),
        });
      }

      if (!sowingDate) {
        return rejectWithValue({
          status: 400,
          message: i18n.t('cropSlice.sowingDateIsRequired'),
        });
      }

      const response = await axios.post(
        `${SATELLITE_API}/v4/api/crop-health/score`,
        {
          geometry,
          date,
          sowing_date: sowingDate,
          provider,
          satellite,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          timeout: 60000,
        },
      );

      return response.data;
    } catch (error) {
      console.log(
        'Crop health API error:',
        error?.response?.status,
        error?.response?.data || error?.message,
      );

      return rejectWithValue({
        status: error?.response?.status || 500,
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          i18n.t('cropSlice.failedToFetchCropHealth'),
      });
    }
  },
);

const initialState = {
  cropHealth: null,
  loading: false,
  error: null,
};

const cropSlice = createSlice({
  name: 'crop',

  initialState,

  reducers: {
    clearCropHealth: state => {
      state.cropHealth = null;
      state.error = null;
      state.loading = false;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchCropHealth.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCropHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.cropHealth = action.payload;
        state.error = null;
      })

      .addCase(fetchCropHealth.rejected, (state, action) => {
        state.loading = false;
        state.cropHealth = null;
        state.error =
          action.payload?.message ||
          action.error?.message ||
          i18n.t('cropSlice.unableToFetchCropHealth');
      });
  },
});

export const {clearCropHealth} = cropSlice.actions;

export default cropSlice.reducer;