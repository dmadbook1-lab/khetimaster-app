import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createLabourerApi,
  getAllLabourersApi,
  getMyLabourerProfileApi,
  getLabourerByIdApi,
  updateMyLabourerProfileApi,
  deactivateMyLabourerProfileApi,
  activateMyLabourerProfileApi,
} from '../../api/labourerApi';
const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};
export const createLabourer = createAsyncThunk(
  'labourer/createLabourer',
  async (labourerData, { rejectWithValue }) => {
    try {
      return await createLabourerApi(labourerData);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to create labourer profile'),
      );
    }
  },
);
export const getAllLabourers = createAsyncThunk(
  'labourer/getAllLabourers',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAllLabourersApi(params);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch labourers'),
      );
    }
  },
);
export const getMyLabourerProfile = createAsyncThunk(
  'labourer/getMyLabourerProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyLabourerProfileApi();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch labourer profile'),
      );
    }
  },
);
export const getLabourerById = createAsyncThunk(
  'labourer/getLabourerById',
  async (labourerId, { rejectWithValue }) => {
    try {
      return await getLabourerByIdApi(labourerId);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to fetch labourer'),
      );
    }
  },
);
export const updateMyLabourerProfile = createAsyncThunk(
  'labourer/updateMyLabourerProfile',
  async (labourerData, { rejectWithValue }) => {
    try {
      return await updateMyLabourerProfileApi(labourerData);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to update labourer profile'),
      );
    }
  },
);
export const deactivateMyLabourerProfile = createAsyncThunk(
  'labourer/deactivateMyLabourerProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await deactivateMyLabourerProfileApi();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to deactivate labourer profile'),
      );
    }
  },
);
export const activateMyLabourerProfile = createAsyncThunk(
  'labourer/activateMyLabourerProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await activateMyLabourerProfileApi();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to activate labourer profile'),
      );
    }
  },
);
const initialState = {
  myProfile: null,
  labourers: [],
  selectedLabourer: null,
  pagination: null,
  total: 0,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isLoadingProfile: false,
  isLoadingLabourers: false,
  error: null,
  message: '',
  createSuccess: false,
  updateSuccess: false,
};
const labourerSlice = createSlice({
  name: 'labourer',
  initialState,
  reducers: {
    clearLabourerError: state => {
      state.error = null;
    },
    clearLabourerMessage: state => {
      state.message = '';
    },
    clearSelectedLabourer: state => {
      state.selectedLabourer = null;
    },
    clearCreateSuccess: state => {
      state.createSuccess = false;
    },
    clearUpdateSuccess: state => {
      state.updateSuccess = false;
    },
    resetLabourerState: state => {
      state.myProfile = null;
      state.labourers = [];
      state.selectedLabourer = null;
      state.pagination = null;
      state.total = 0;
      state.isLoading = false;
      state.isCreating = false;
      state.isUpdating = false;
      state.isLoadingProfile = false;
      state.isLoadingLabourers = false;
      state.error = null;
      state.message = '';
      state.createSuccess = false;
      state.updateSuccess = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createLabourer.pending, state => {
        state.isCreating = true;
        state.error = null;
        state.message = '';
        state.createSuccess = false;
      })
      .addCase(createLabourer.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = true;
        state.message =
          action.payload?.message || 'Labourer profile created successfully';
        state.myProfile = action.payload?.labourer || null;
        state.error = null;
      })
      .addCase(createLabourer.rejected, (state, action) => {
        state.isCreating = false;
        state.createSuccess = false;
        state.error = action.payload || 'Failed to create labourer profile';
      });
    builder
      .addCase(getAllLabourers.pending, state => {
        state.isLoadingLabourers = true;
        state.error = null;
      })
      .addCase(getAllLabourers.fulfilled, (state, action) => {
        state.isLoadingLabourers = false;
        state.labourers =
          action.payload?.labourers || action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
        state.total =
          action.payload?.total ??
          action.payload?.pagination?.total ??
          state.labourers.length;
        state.error = null;
      })
      .addCase(getAllLabourers.rejected, (state, action) => {
        state.isLoadingLabourers = false;
        state.error = action.payload || 'Failed to fetch labourers';
      });
    builder
      .addCase(getMyLabourerProfile.pending, state => {
        state.isLoadingProfile = true;
        state.error = null;
      })
      .addCase(getMyLabourerProfile.fulfilled, (state, action) => {
        state.isLoadingProfile = false;
        state.myProfile = action.payload?.labourer || null;
        state.error = null;
      })
      .addCase(getMyLabourerProfile.rejected, (state, action) => {
        state.isLoadingProfile = false;
        state.error = action.payload || 'Failed to fetch labourer profile';
      });
    builder
      .addCase(getLabourerById.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.selectedLabourer = null;
      })
      .addCase(getLabourerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLabourer = action.payload?.labourer || null;
        state.error = null;
      })
      .addCase(getLabourerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch labourer';
      });
    builder
      .addCase(updateMyLabourerProfile.pending, state => {
        state.isUpdating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateMyLabourerProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = true;
        state.message =
          action.payload?.message || 'Labourer profile updated successfully';
        state.myProfile = action.payload?.labourer || state.myProfile;
        state.error = null;
      })
      .addCase(updateMyLabourerProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = false;
        state.error = action.payload || 'Failed to update labourer profile';
      });
    builder
      .addCase(deactivateMyLabourerProfile.pending, state => {
        state.error = null;
      })
      .addCase(deactivateMyLabourerProfile.fulfilled, (state, action) => {
        state.message =
          action.payload?.message ||
          'Labourer profile deactivated successfully';
        if (state.myProfile) {
          state.myProfile.isActive = false;
          state.myProfile.availability = 'unavailable';
        }
      })
      .addCase(deactivateMyLabourerProfile.rejected, (state, action) => {
        state.error = action.payload || 'Failed to deactivate labourer profile';
      });
    builder
      .addCase(activateMyLabourerProfile.pending, state => {
        state.error = null;
      })
      .addCase(activateMyLabourerProfile.fulfilled, (state, action) => {
        state.message =
          action.payload?.message || 'Labourer profile activated successfully';
        state.myProfile = action.payload?.labourer || state.myProfile;
      })
      .addCase(activateMyLabourerProfile.rejected, (state, action) => {
        state.error = action.payload || 'Failed to activate labourer profile';
      });
  },
});
export const {
  clearLabourerError,
  clearLabourerMessage,
  clearSelectedLabourer,
  clearCreateSuccess,
  clearUpdateSuccess,
  resetLabourerState,
} = labourerSlice.actions;
export default labourerSlice.reducer;
