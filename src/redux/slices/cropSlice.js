import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

import {API_URLS, SATELLITE_API_KEY} from '../../config/api';

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
          message: 'Farm geometry is required',
        });
      }

      if (!date) {
        return rejectWithValue({
          status: 400,
          message: 'Satellite date is required',
        });
      }

      if (!sowingDate) {
        return rejectWithValue({
          status: 400,
          message: 'Sowing date is required',
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
          'Failed to fetch crop health',
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
          'Unable to fetch crop health';
      });
  },
});

export const {clearCropHealth} = cropSlice.actions;

export default cropSlice.reducer;