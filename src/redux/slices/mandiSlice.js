import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {
  getMandiCropsApi,
  getMandiStatesApi,
  getMandiDistrictsApi,
  getMandiRatesApi,
} from '../../api/mandiApi';

/*
|--------------------------------------------------------------------------
| FETCH CROPS
|--------------------------------------------------------------------------
|
| Crops are manually maintained by KhetiMaster backend.
|
*/

export const getMandiCrops = createAsyncThunk(
  'mandi/getMandiCrops',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getMandiCropsApi();

      return response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch mandi crops',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| FETCH STATES
|--------------------------------------------------------------------------
*/

export const getMandiStates = createAsyncThunk(
  'mandi/getMandiStates',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getMandiStatesApi();

      return response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch mandi states',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| FETCH DISTRICTS
|--------------------------------------------------------------------------
*/

export const getMandiDistricts = createAsyncThunk(
  'mandi/getMandiDistricts',
  async (stateName, {rejectWithValue}) => {
    try {
      if (!stateName) {
        return rejectWithValue('State is required');
      }

      const response =
        await getMandiDistrictsApi(stateName);

      return response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch mandi districts',
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| FETCH MANDI RATES
|--------------------------------------------------------------------------
*/

export const getMandiRates = createAsyncThunk(
  'mandi/getMandiRates',
  async (
    {
      state,
      district,
      crop,
      arrivalDate = '',
      limit = 50,
    },
    {rejectWithValue},
  ) => {
    try {
      if (!state) {
        return rejectWithValue('State is required');
      }

      if (!district) {
        return rejectWithValue('District is required');
      }

      if (!crop) {
        return rejectWithValue('Crop is required');
      }

      const response = await getMandiRatesApi({
        state,
        district,
        crop,
        arrivalDate,
        limit,
      });

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch mandi rates',
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
  // Crops
  crops: [],
  cropsLoading: false,

  // Locations
  states: [],
  districts: [],

  statesLoading: false,
  districtsLoading: false,

  // Selected filters
  selectedCrop: null,
  selectedState: '',
  selectedDistrict: '',

  // Rates
  rates: [],
  total: 0,

  // Loading / error
  loading: false,
  error: null,

  // Backend filters returned with rates
  filters: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const mandiSlice = createSlice({
  name: 'mandi',

  initialState,

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | CROP
    |--------------------------------------------------------------------------
    */

    setSelectedCrop: (state, action) => {
      state.selectedCrop = action.payload || null;

      state.rates = [];
      state.total = 0;
      state.filters = null;
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    |
    | Changing the state invalidates the current district.
    |
    */

    setSelectedState: (state, action) => {
      state.selectedState = action.payload || '';

      state.selectedDistrict = '';

      state.districts = [];

      state.rates = [];
      state.total = 0;
      state.filters = null;
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | DISTRICT
    |--------------------------------------------------------------------------
    */

    setSelectedDistrict: (state, action) => {
      state.selectedDistrict =
        action.payload || '';

      state.rates = [];
      state.total = 0;
      state.filters = null;
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR LOCATION
    |--------------------------------------------------------------------------
    */

    clearSelectedLocation: state => {
      state.selectedState = '';
      state.selectedDistrict = '';

      state.districts = [];

      state.rates = [];
      state.total = 0;
      state.filters = null;
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR RATES
    |--------------------------------------------------------------------------
    */

    clearMandiRates: state => {
      state.rates = [];
      state.total = 0;
      state.filters = null;
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | CLEAR ERROR
    |--------------------------------------------------------------------------
    */

    clearMandiError: state => {
      state.error = null;
    },
  },

  /*
  |--------------------------------------------------------------------------
  | ASYNC THUNKS
  |--------------------------------------------------------------------------
  */

  extraReducers: builder => {
    /*
    |--------------------------------------------------------------------------
    | CROPS
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(getMandiCrops.pending, state => {
        state.cropsLoading = true;
        state.error = null;
      })

      .addCase(
        getMandiCrops.fulfilled,
        (state, action) => {
          state.cropsLoading = false;

          state.crops = Array.isArray(action.payload)
            ? action.payload
            : [];
        },
      )

      .addCase(
        getMandiCrops.rejected,
        (state, action) => {
          state.cropsLoading = false;

          state.error =
            action.payload ||
            'Failed to fetch mandi crops';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | STATES
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(getMandiStates.pending, state => {
        state.statesLoading = true;
        state.error = null;
      })

      .addCase(
        getMandiStates.fulfilled,
        (state, action) => {
          state.statesLoading = false;

          state.states = Array.isArray(action.payload)
            ? action.payload
            : [];
        },
      )

      .addCase(
        getMandiStates.rejected,
        (state, action) => {
          state.statesLoading = false;

          state.error =
            action.payload ||
            'Failed to fetch mandi states';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | DISTRICTS
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(getMandiDistricts.pending, state => {
        state.districtsLoading = true;
        state.error = null;
      })

      .addCase(
        getMandiDistricts.fulfilled,
        (state, action) => {
          state.districtsLoading = false;

          state.districts = Array.isArray(
            action.payload,
          )
            ? action.payload
            : [];
        },
      )

      .addCase(
        getMandiDistricts.rejected,
        (state, action) => {
          state.districtsLoading = false;

          state.districts = [];

          state.error =
            action.payload ||
            'Failed to fetch mandi districts';
        },
      );

    /*
    |--------------------------------------------------------------------------
    | RATES
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(getMandiRates.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getMandiRates.fulfilled,
        (state, action) => {
          state.loading = false;

          state.rates = Array.isArray(
            action.payload?.data,
          )
            ? action.payload.data
            : [];

          state.total =
            Number(action.payload?.total) || 0;

          state.filters =
            action.payload?.filters || null;

          state.error = null;
        },
      )

      .addCase(
        getMandiRates.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            'Failed to fetch mandi rates';

          state.rates = [];
          state.total = 0;
          state.filters = null;
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
  setSelectedCrop,
  setSelectedState,
  setSelectedDistrict,
  clearSelectedLocation,
  clearMandiRates,
  clearMandiError,
} = mandiSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectMandiCrops = state =>
  state.mandi.crops;

export const selectMandiCropsLoading = state =>
  state.mandi.cropsLoading;

export const selectMandiStates = state =>
  state.mandi.states;

export const selectMandiDistricts = state =>
  state.mandi.districts;

export const selectMandiStatesLoading = state =>
  state.mandi.statesLoading;

export const selectMandiDistrictsLoading = state =>
  state.mandi.districtsLoading;

export const selectSelectedMandiCrop = state =>
  state.mandi.selectedCrop;

export const selectSelectedMandiState = state =>
  state.mandi.selectedState;

export const selectSelectedMandiDistrict = state =>
  state.mandi.selectedDistrict;

export const selectMandiRates = state =>
  state.mandi.rates;

export const selectMandiTotal = state =>
  state.mandi.total;

export const selectMandiLoading = state =>
  state.mandi.loading;

export const selectMandiError = state =>
  state.mandi.error;

export const selectMandiFilters = state =>
  state.mandi.filters;

export default mandiSlice.reducer;