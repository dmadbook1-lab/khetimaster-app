import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getMachineryMetaApi,
  getAllMachineryApi,
  getMachineryByIdApi,
  getMyMachineryApi,
  createMachineryApi,
  updateMachineryApi,
  deactivateMachineryApi,
  activateMachineryApi,
} from '../../api/machineryApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
*/

export const fetchMachineryMeta = createAsyncThunk(
  'machinery/fetchMeta',
  async (_, { rejectWithValue }) => {
    try {
      return await getMachineryMetaApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load options'));
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

export const fetchMachineryList = createAsyncThunk(
  'machinery/fetchList',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getAllMachineryApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load machinery'));
    }
  },
);

export const fetchMachineryById = createAsyncThunk(
  'machinery/fetchById',
  async (machineryId, { rejectWithValue }) => {
    try {
      return await getMachineryByIdApi(machineryId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load machinery'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| OWNER
|--------------------------------------------------------------------------
*/

export const fetchMyMachinery = createAsyncThunk(
  'machinery/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyMachineryApi();
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load your machines'),
      );
    }
  },
);

/*
 * {machineryId, machineryData} - no machineryId creates a new machine.
 */
export const saveMachinery = createAsyncThunk(
  'machinery/save',
  async ({ machineryId, machineryData }, { rejectWithValue }) => {
    try {
      return machineryId
        ? await updateMachineryApi(machineryId, machineryData)
        : await createMachineryApi(machineryData);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to save machine'));
    }
  },
);

/*
 * {machineryId, active}
 */
export const setMachineryActive = createAsyncThunk(
  'machinery/setActive',
  async ({ machineryId, active }, { rejectWithValue }) => {
    try {
      return active
        ? await activateMachineryApi(machineryId)
        : await deactivateMachineryApi(machineryId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update machine'));
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
    implements: [],
    fuelTypes: [],
    driveTypes: [],
    enginePowerUnits: [],
    availabilityOptions: [],
    customPriceUnits: [],
    paymentMethods: [],
    maxBookingDays: 30,
    maxBookingHours: 24,
  },
  metaLoading: false,
  metaError: null,

  list: [],
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
  },
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
  togglingActive: false,
};

/*
 * Apply a change to every copy of a machine held in the store.
 */
const patchMachine = (state, machine) => {
  if (!machine?._id) return;

  const apply = item =>
    item._id === machine._id
      ? { ...item, ...machine, owner: item.owner }
      : item;

  state.list = state.list.map(apply);
  state.mine = state.mine.map(apply);

  if (state.selected?._id === machine._id) {
    state.selected = {
      ...state.selected,
      ...machine,
      owner: state.selected.owner,
    };
  }
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const machinerySlice = createSlice({
  name: 'machinery',

  initialState,

  reducers: {
    clearSelectedMachinery: state => {
      state.selected = null;
      state.selectedError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchMachineryMeta.pending, state => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(fetchMachineryMeta.fulfilled, (state, action) => {
        state.metaLoading = false;

        const data = action.payload || {};

        state.meta = {
          categories: data.categories || [],
          implements: data.implements || [],
          fuelTypes: data.fuelTypes || [],
          driveTypes: data.driveTypes || [],
          enginePowerUnits: data.enginePowerUnits || [],
          availabilityOptions: data.availabilityOptions || [],
          customPriceUnits: data.customPriceUnits || [],
          paymentMethods: data.paymentMethods || [],
          maxBookingDays: data.maxBookingDays || 30,
          maxBookingHours: data.maxBookingHours || 24,
        };
      })
      .addCase(fetchMachineryMeta.rejected, (state, action) => {
        state.metaLoading = false;
        state.metaError = action.payload;
      });

    builder
      .addCase(fetchMachineryList.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.listLoadingMore = true;
        } else {
          state.listLoading = true;
        }

        state.listError = null;
      })
      .addCase(fetchMachineryList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;

        const machinery = action.payload?.machinery || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.list.map(item => item._id));
          state.list = [
            ...state.list,
            ...machinery.filter(item => !known.has(item._id)),
          ];
        } else {
          state.list = machinery;
        }

        state.pagination = {
          page: action.payload?.pagination?.currentPage || 1,
          totalPages: action.payload?.pagination?.totalPages || 1,
          total: action.payload?.total || 0,
        };
      })
      .addCase(fetchMachineryList.rejected, (state, action) => {
        state.listLoading = false;
        state.listLoadingMore = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchMachineryById.pending, (state, action) => {
        state.selectedLoading = true;
        state.selectedError = null;

        if (state.selected?._id !== action.meta.arg) {
          state.selected = null;
        }
      })
      .addCase(fetchMachineryById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload?.machinery || null;
      })
      .addCase(fetchMachineryById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload;
      });

    builder
      .addCase(fetchMyMachinery.pending, state => {
        state.mineStatus = state.mineStatus === 'loaded' ? 'loaded' : 'loading';
        state.mineError = null;
      })
      .addCase(fetchMyMachinery.fulfilled, (state, action) => {
        state.mineStatus = 'loaded';
        state.mine = action.payload?.machinery || [];
      })
      .addCase(fetchMyMachinery.rejected, (state, action) => {
        state.mineStatus = state.mineStatus === 'loaded' ? 'loaded' : 'error';
        state.mineError = action.payload;
      });

    builder
      .addCase(saveMachinery.pending, state => {
        state.saving = true;
      })
      .addCase(saveMachinery.fulfilled, (state, action) => {
        state.saving = false;

        const machine = action.payload?.machinery;

        if (!machine?._id) return;

        if (action.meta.arg.machineryId) {
          patchMachine(state, machine);
        } else {
          state.mine.unshift({ ...machine, pendingRequests: 0 });
        }
      })
      .addCase(saveMachinery.rejected, state => {
        state.saving = false;
      })

      .addCase(setMachineryActive.pending, state => {
        state.togglingActive = true;
      })
      .addCase(setMachineryActive.fulfilled, (state, action) => {
        state.togglingActive = false;

        const machine = action.payload?.machinery;

        if (machine?._id) {
          patchMachine(state, {
            _id: machine._id,
            isActive: machine.isActive,
            availability: machine.availability,
            ...(!machine.isActive && { pendingRequests: 0 }),
          });
        }
      })
      .addCase(setMachineryActive.rejected, state => {
        state.togglingActive = false;
      });
  },
});

export const { clearSelectedMachinery } = machinerySlice.actions;

export default machinerySlice.reducer;
