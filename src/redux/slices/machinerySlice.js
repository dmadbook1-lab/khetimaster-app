import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createMachineryApi,
  getAllMachineryApi,
  getMyMachineryApi,
  getMachineryByIdApi,
  updateMachineryApi,
  deactivateMachineryApi,
  activateMachineryApi,
} from '../../api/machineryApi';

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

export const createMachinery = createAsyncThunk(
  'machinery/createMachinery',
  async (data, { rejectWithValue }) => {
    try {
      return await createMachineryApi(data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to add machinery'),
      );
    }
  },
);

export const getAllMachinery = createAsyncThunk(
  'machinery/getAllMachinery',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllMachineryApi(params);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch machinery'),
      );
    }
  },
);

export const getMyMachinery = createAsyncThunk(
  'machinery/getMyMachinery',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getMyMachineryApi(params);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch your machinery'),
      );
    }
  },
);

export const getMachineryById = createAsyncThunk(
  'machinery/getMachineryById',
  async (id, { rejectWithValue }) => {
    try {
      return await getMachineryByIdApi(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch machinery details'),
      );
    }
  },
);

export const updateMachinery = createAsyncThunk(
  'machinery/updateMachinery',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateMachineryApi(id, data);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to update machinery'),
      );
    }
  },
);

export const deactivateMachinery = createAsyncThunk(
  'machinery/deactivateMachinery',
  async (id, { rejectWithValue }) => {
    try {
      return await deactivateMachineryApi(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to deactivate machinery'),
      );
    }
  },
);

export const activateMachinery = createAsyncThunk(
  'machinery/activateMachinery',
  async (id, { rejectWithValue }) => {
    try {
      return await activateMachineryApi(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to activate machinery'),
      );
    }
  },
);

const initialState = {
  machinery: [],
  myMachinery: [],
  selectedMachinery: null,
  total: 0,
  pagination: null,
  isLoading: false,
  isLoadingAll: false,
  isLoadingMyMachinery: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  message: '',
  createSuccess: false,
  updateSuccess: false,
};

const extractArray = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.machinery)) return payload.machinery;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const machinerySlice = createSlice({
  name: 'machinery',
  initialState,
  reducers: {
    clearMachineryError: state => {
      state.error = null;
    },
    clearMachineryMessage: state => {
      state.message = '';
    },
    clearSelectedMachinery: state => {
      state.selectedMachinery = null;
    },
    clearMachineryCreateSuccess: state => {
      state.createSuccess = false;
    },
    clearMachineryUpdateSuccess: state => {
      state.updateSuccess = false;
    },
    resetMachineryState: () => initialState,
  },
  extraReducers: builder => {
    /* CREATE */
    builder
      .addCase(createMachinery.pending, state => {
        state.isCreating = true;
        state.error = null;
        state.message = '';
        state.createSuccess = false;
      })
      .addCase(createMachinery.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = true;
        state.error = null;
        state.message =
          action.payload?.message || 'Machinery added successfully';

        const item =
          action.payload?.machinery || action.payload?.data || action.payload;

        if (item && typeof item === 'object' && (item._id || item.id)) {
          state.myMachinery = [
            item,
            ...state.myMachinery.filter(
              m => String(m._id || m.id) !== String(item._id || item.id),
            ),
          ];
          state.selectedMachinery = item;
        }
      })
      .addCase(createMachinery.rejected, (state, action) => {
        state.isCreating = false;
        state.createSuccess = false;
        state.error = action.payload || 'Failed to add machinery';
      });

    /* GET ALL */
    builder
      .addCase(getAllMachinery.pending, state => {
        state.isLoadingAll = true;
        state.error = null;
      })
      .addCase(getAllMachinery.fulfilled, (state, action) => {
        state.isLoadingAll = false;
        state.machinery = extractArray(action.payload);
        state.total =
          action.payload?.total ??
          action.payload?.count ??
          state.machinery.length;
        state.pagination = action.payload?.pagination || null;
        state.error = null;
      })
      .addCase(getAllMachinery.rejected, (state, action) => {
        state.isLoadingAll = false;
        state.error = action.payload || 'Failed to fetch machinery';
      });

    /* GET MY MACHINERY */
    builder
      .addCase(getMyMachinery.pending, state => {
        state.isLoadingMyMachinery = true;
        state.error = null;
      })
      .addCase(getMyMachinery.fulfilled, (state, action) => {
        state.isLoadingMyMachinery = false;
        state.myMachinery = extractArray(action.payload);
        state.error = null;
      })
      .addCase(getMyMachinery.rejected, (state, action) => {
        state.isLoadingMyMachinery = false;
        state.error = action.payload || 'Failed to fetch your machinery';
      });

    /* GET BY ID */
    builder
      .addCase(getMachineryById.pending, state => {
        state.isLoading = true;
        state.selectedMachinery = null;
        state.error = null;
      })
      .addCase(getMachineryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMachinery =
          action.payload?.machinery || action.payload?.data || null;
        state.error = null;
      })
      .addCase(getMachineryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || 'Failed to fetch machinery details';
      });

    /* UPDATE */
    builder
      .addCase(updateMachinery.pending, state => {
        state.isUpdating = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateMachinery.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.error = null;
        state.message =
          action.payload?.message || 'Machinery updated successfully';

        const updated =
          action.payload?.machinery || action.payload?.data;

        if (!updated) return;

        state.selectedMachinery = updated;

        const myIndex = state.myMachinery.findIndex(
          item =>
            String(item?._id || item?.id) ===
            String(updated?._id || updated?.id),
        );
        if (myIndex >= 0) {
          state.myMachinery[myIndex] = updated;
        }

        const allIndex = state.machinery.findIndex(
          item =>
            String(item?._id || item?.id) ===
            String(updated?._id || updated?.id),
        );
        if (allIndex >= 0) {
          state.machinery[allIndex] = updated;
        }
      })
      .addCase(updateMachinery.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = false;
        state.error = action.payload || 'Failed to update machinery';
      });

    /* DEACTIVATE */
    builder.addCase(deactivateMachinery.fulfilled, (state, action) => {
      const updated = action.payload?.machinery;
      if (updated) {
        const id = updated._id || updated.id;
        const index = state.myMachinery.findIndex(
          item => String(item?._id || item?.id) === String(id),
        );
        if (index >= 0) state.myMachinery[index] = updated;
        state.machinery = state.machinery.filter(
          item => String(item?._id || item?.id) !== String(id),
        );
      }
    });

    /* ACTIVATE */
    builder.addCase(activateMachinery.fulfilled, (state, action) => {
      const updated = action.payload?.machinery;
      if (updated) {
        const id = updated._id || updated.id;
        const index = state.myMachinery.findIndex(
          item => String(item?._id || item?.id) === String(id),
        );
        if (index >= 0) state.myMachinery[index] = updated;
      }
    });
  },
});

export const {
  clearMachineryError,
  clearMachineryMessage,
  clearSelectedMachinery,
  clearMachineryCreateSuccess,
  clearMachineryUpdateSuccess,
  resetMachineryState,
} = machinerySlice.actions;

export default machinerySlice.reducer;