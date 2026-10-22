import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getNurseryMetaApi,
  getNurseryPlantsApi,
  getNurseryPlantByIdApi,
  getNurseryCategoriesApi,
  createNurseryPlantApi,
  getMyNurseryListingsApi,
  updateNurseryPlantApi,
  deleteNurseryPlantApi,
} from '../../api/nurseryApi';
import { DEFAULT_DELIVERY } from '../../utils/nurseryFormat';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| META + CATEGORIES
|--------------------------------------------------------------------------
*/

export const fetchNurseryMeta = createAsyncThunk(
  'nursery/fetchMeta',
  async (_, { rejectWithValue }) => {
    try {
      return await getNurseryMetaApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load options'));
    }
  },
);

// categories that currently have plants
export const fetchNurseryCategories = createAsyncThunk(
  'nursery/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await getNurseryCategoriesApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load categories'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| BROWSE
|--------------------------------------------------------------------------
|
| {params, append} - append adds the next page to the current list.
|
*/

export const fetchNurseryPlants = createAsyncThunk(
  'nursery/fetchPlants',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getNurseryPlantsApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load plants'));
    }
  },
);

export const fetchNurseryPlantById = createAsyncThunk(
  'nursery/fetchPlantById',
  async (plantId, { rejectWithValue }) => {
    try {
      return await getNurseryPlantByIdApi(plantId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load plant'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| SELLER
|--------------------------------------------------------------------------
*/

export const fetchMyNurseryListings = createAsyncThunk(
  'nursery/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyNurseryListingsApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load your plants'));
    }
  },
);

/*
 * {plantId, plantData} - no plantId lists a new plant.
 */
export const saveNurseryPlant = createAsyncThunk(
  'nursery/save',
  async ({ plantId, plantData }, { rejectWithValue }) => {
    try {
      return plantId
        ? await updateNurseryPlantApi(plantId, plantData)
        : await createNurseryPlantApi(plantData);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to save plant'));
    }
  },
);

/*
 * {plantId, active} - pausing hides the plant, resuming shows it again.
 */
export const setNurseryPlantActive = createAsyncThunk(
  'nursery/setActive',
  async ({ plantId, active }, { rejectWithValue }) => {
    try {
      return active
        ? await updateNurseryPlantApi(plantId, { isActive: true })
        : await deleteNurseryPlantApi(plantId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update plant'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  meta: {
    categories: [],
    delivery: DEFAULT_DELIVERY,
    paymentMethods: ['COD'],
  },
  metaLoading: false,
  metaError: null,

  // categories that have plants right now
  liveCategories: [],

  list: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  listLoading: false,
  listLoadingMore: false,
  listError: null,

  selected: null,
  selectedLoading: false,
  selectedError: null,

  mine: [],
  // idle | loading | loaded | error
  mineStatus: 'idle',
  mineError: null,

  saving: false,
  // plantId being paused / resumed
  togglingId: null,
};

/*
 * Apply a change to every copy of a plant held in the store.
 */
const patchPlant = (state, plant) => {
  if (!plant?._id) return;

  const apply = item => (item._id === plant._id ? { ...item, ...plant } : item);

  state.list = state.list.map(apply);
  state.mine = state.mine.map(apply);

  if (state.selected?._id === plant._id) {
    state.selected = { ...state.selected, ...plant };
  }
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const nurserySlice = createSlice({
  name: 'nursery',

  initialState,

  reducers: {
    clearSelectedPlant: state => {
      state.selected = null;
      state.selectedError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchNurseryMeta.pending, state => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(fetchNurseryMeta.fulfilled, (state, action) => {
        state.metaLoading = false;

        const data = action.payload?.data || {};

        state.meta = {
          categories: data.categories || [],
          delivery: {
            fee: data.delivery?.fee ?? DEFAULT_DELIVERY.fee,
            freeAbove: data.delivery?.freeAbove ?? DEFAULT_DELIVERY.freeAbove,
          },
          paymentMethods: data.paymentMethods || ['COD'],
        };
      })
      .addCase(fetchNurseryMeta.rejected, (state, action) => {
        state.metaLoading = false;
        state.metaError = action.payload;
      })

      .addCase(fetchNurseryCategories.fulfilled, (state, action) => {
        state.liveCategories = action.payload?.data || [];
      });

    builder
      .addCase(fetchNurseryPlants.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.listLoadingMore = true;
        } else {
          state.listLoading = true;
        }

        state.listError = null;
      })
      .addCase(fetchNurseryPlants.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;

        const plants = action.payload?.data || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.list.map(item => item._id));
          state.list = [
            ...state.list,
            ...plants.filter(item => !known.has(item._id)),
          ];
        } else {
          state.list = plants;
        }

        const pagination = action.payload?.pagination || {};

        state.pagination = {
          page: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
          total: pagination.total || 0,
        };
      })
      .addCase(fetchNurseryPlants.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchNurseryPlantById.pending, (state, action) => {
        state.selectedLoading = true;
        state.selectedError = null;

        if (state.selected?._id !== action.meta.arg) {
          state.selected = null;
        }
      })
      .addCase(fetchNurseryPlantById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload?.data || null;
      })
      .addCase(fetchNurseryPlantById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload;
      });

    builder
      .addCase(fetchMyNurseryListings.pending, state => {
        state.mineStatus = state.mineStatus === 'loaded' ? 'loaded' : 'loading';
        state.mineError = null;
      })
      .addCase(fetchMyNurseryListings.fulfilled, (state, action) => {
        state.mineStatus = 'loaded';
        state.mine = action.payload?.data || [];
      })
      .addCase(fetchMyNurseryListings.rejected, (state, action) => {
        state.mineStatus = state.mineStatus === 'loaded' ? 'loaded' : 'error';
        state.mineError = action.payload;
      });

    builder
      .addCase(saveNurseryPlant.pending, state => {
        state.saving = true;
      })
      .addCase(saveNurseryPlant.fulfilled, (state, action) => {
        state.saving = false;

        const plant = action.payload?.data;
        if (!plant?._id) return;

        if (action.meta.arg.plantId) {
          patchPlant(state, plant);
        } else {
          state.mine.unshift({ ...plant, pendingOrders: 0 });
        }
      })
      .addCase(saveNurseryPlant.rejected, state => {
        state.saving = false;
      })

      .addCase(setNurseryPlantActive.pending, (state, action) => {
        state.togglingId = action.meta.arg.plantId;
      })
      .addCase(setNurseryPlantActive.fulfilled, (state, action) => {
        state.togglingId = null;

        const { plantId, active } = action.meta.arg;
        patchPlant(state, { _id: plantId, isActive: active });

        if (!active) {
          state.list = state.list.filter(item => item._id !== plantId);
        }
      })
      .addCase(setNurseryPlantActive.rejected, state => {
        state.togglingId = null;
      });
  },
});

export const { clearSelectedPlant } = nurserySlice.actions;

export default nurserySlice.reducer;
