import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  getNurseryPlantsApi,
  getNurseryPlantByIdApi,
  getNurseryCategoriesApi,
  createNurseryPlantApi,
  getMyNurseryListingsApi,
  updateNurseryPlantApi,
  deleteNurseryPlantApi,
} from '../../api/nurseryApi';

/*
|--------------------------------------------------------------------------
| GET PLANTS
|--------------------------------------------------------------------------
*/

export const fetchNurseryPlants =
  createAsyncThunk(
    'nursery/fetchPlants',
    async (params, {rejectWithValue}) => {
      try {
        return await getNurseryPlantsApi(
          params,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load plants',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET PLANT BY ID
|--------------------------------------------------------------------------
*/

export const fetchNurseryPlantById =
  createAsyncThunk(
    'nursery/fetchPlantById',
    async (plantId, {rejectWithValue}) => {
      try {
        return await getNurseryPlantByIdApi(
          plantId,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load plant',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET CATEGORIES
|--------------------------------------------------------------------------
*/

export const fetchNurseryCategories =
  createAsyncThunk(
    'nursery/fetchCategories',
    async (_, {rejectWithValue}) => {
      try {
        return await getNurseryCategoriesApi();
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load categories',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| CREATE LISTING
|--------------------------------------------------------------------------
*/

export const createNurseryPlant =
  createAsyncThunk(
    'nursery/createPlant',
    async (plantData, {rejectWithValue}) => {
      try {
        return await createNurseryPlantApi(
          plantData,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to create listing',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET MY LISTINGS
|--------------------------------------------------------------------------
*/

export const fetchMyNurseryListings =
  createAsyncThunk(
    'nursery/myListings',
    async (_, {rejectWithValue}) => {
      try {
        return await getMyNurseryListingsApi();
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load your listings',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| UPDATE LISTING
|--------------------------------------------------------------------------
*/

export const updateNurseryPlant =
  createAsyncThunk(
    'nursery/updatePlant',
    async (
      {plantId, plantData},
      {rejectWithValue},
    ) => {
      try {
        return await updateNurseryPlantApi(
          plantId,
          plantData,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to update listing',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| DELETE LISTING
|--------------------------------------------------------------------------
*/

export const deleteNurseryPlant =
  createAsyncThunk(
    'nursery/deletePlant',
    async (
      plantId,
      {rejectWithValue},
    ) => {
      try {
        const data =
          await deleteNurseryPlantApi(
            plantId,
          );

        return {
          plantId,
          data,
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to delete listing',
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
  plants: [],
  selectedPlant: null,
  categories: [],
  myListings: [],

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  },

  loading: false,
  plantLoading: false,
  categoriesLoading: false,
  listingsLoading: false,

  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  error: null,
  plantError: null,
  categoriesError: null,
  listingsError: null,

  createError: null,
  updateError: null,
  deleteError: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const nurserySlice =
  createSlice({
    name: 'nursery',

    initialState,

    reducers: {
      clearNurseryErrors: state => {
        state.error = null;
        state.plantError = null;
        state.categoriesError = null;
        state.listingsError = null;
        state.createError = null;
        state.updateError = null;
        state.deleteError = null;
      },

      clearSelectedPlant: state => {
        state.selectedPlant = null;
        state.plantError = null;
      },

      clearNurseryPlants: state => {
        state.plants = [];
      },

      clearMyListings: state => {
        state.myListings = [];
      },
    },

    extraReducers: builder => {
      /*
      |--------------------------------------------------------------------------
      | FETCH PLANTS
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchNurseryPlants.pending,
          state => {
            state.loading = true;
            state.error = null;
          },
        )

        .addCase(
          fetchNurseryPlants.fulfilled,
          (state, action) => {
            state.loading = false;

            const response =
              action.payload;

            state.plants =
              response?.plants ||
              response?.data ||
              [];

            if (response?.pagination) {
              state.pagination =
                response.pagination;
            }
          },
        )

        .addCase(
          fetchNurseryPlants.rejected,
          (state, action) => {
            state.loading = false;

            state.error =
              action.payload ||
              'Unable to load plants';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | FETCH PLANT
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchNurseryPlantById.pending,
          state => {
            state.plantLoading = true;
            state.plantError = null;
          },
        )

        .addCase(
          fetchNurseryPlantById.fulfilled,
          (state, action) => {
            state.plantLoading = false;

            state.selectedPlant =
              action.payload?.plant ||
              action.payload?.data ||
              action.payload;
          },
        )

        .addCase(
          fetchNurseryPlantById.rejected,
          (state, action) => {
            state.plantLoading = false;

            state.plantError =
              action.payload ||
              'Unable to load plant';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | CATEGORIES
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchNurseryCategories.pending,
          state => {
            state.categoriesLoading = true;
            state.categoriesError = null;
          },
        )

        .addCase(
          fetchNurseryCategories.fulfilled,
          (state, action) => {
            state.categoriesLoading = false;

            state.categories =
              action.payload?.categories ||
              action.payload?.data ||
              action.payload ||
              [];
          },
        )

        .addCase(
          fetchNurseryCategories.rejected,
          (state, action) => {
            state.categoriesLoading = false;

            state.categoriesError =
              action.payload ||
              'Unable to load categories';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | CREATE PLANT
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          createNurseryPlant.pending,
          state => {
            state.createLoading = true;
            state.createError = null;
          },
        )

        .addCase(
          createNurseryPlant.fulfilled,
          (state, action) => {
            state.createLoading = false;

            const plant =
              action.payload?.plant ||
              action.payload?.data;

            if (plant) {
              state.myListings.unshift(
                plant,
              );

              if (
                plant.isActive !== false &&
                Number(plant.quantity) > 0
              ) {
                state.plants.unshift(
                  plant,
                );
              }
            }
          },
        )

        .addCase(
          createNurseryPlant.rejected,
          (state, action) => {
            state.createLoading = false;

            state.createError =
              action.payload ||
              'Unable to create listing';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | MY LISTINGS
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchMyNurseryListings.pending,
          state => {
            state.listingsLoading = true;
            state.listingsError = null;
          },
        )

        .addCase(
          fetchMyNurseryListings.fulfilled,
          (state, action) => {
            state.listingsLoading = false;

            state.myListings =
              action.payload?.plants ||
              action.payload?.listings ||
              action.payload?.data ||
              action.payload ||
              [];
          },
        )

        .addCase(
          fetchMyNurseryListings.rejected,
          (state, action) => {
            state.listingsLoading = false;

            state.listingsError =
              action.payload ||
              'Unable to load listings';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          updateNurseryPlant.pending,
          state => {
            state.updateLoading = true;
            state.updateError = null;
          },
        )

        .addCase(
          updateNurseryPlant.fulfilled,
          (state, action) => {
            state.updateLoading = false;

            const plant =
              action.payload?.plant ||
              action.payload?.data;

            if (!plant?._id) {
              return;
            }

            state.myListings =
              state.myListings.map(
                item =>
                  item._id === plant._id
                    ? plant
                    : item,
              );

            state.plants =
              state.plants.map(
                item =>
                  item._id === plant._id
                    ? plant
                    : item,
              );

            if (
              state.selectedPlant?._id ===
              plant._id
            ) {
              state.selectedPlant =
                plant;
            }
          },
        )

        .addCase(
          updateNurseryPlant.rejected,
          (state, action) => {
            state.updateLoading = false;

            state.updateError =
              action.payload ||
              'Unable to update listing';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | DELETE
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          deleteNurseryPlant.pending,
          state => {
            state.deleteLoading = true;
            state.deleteError = null;
          },
        )

        .addCase(
          deleteNurseryPlant.fulfilled,
          (state, action) => {
            state.deleteLoading = false;

            const plantId =
              action.payload?.plantId;

            state.myListings =
              state.myListings.filter(
                item =>
                  item._id !== plantId,
              );

            state.plants =
              state.plants.filter(
                item =>
                  item._id !== plantId,
              );

            if (
              state.selectedPlant?._id ===
              plantId
            ) {
              state.selectedPlant =
                null;
            }
          },
        )

        .addCase(
          deleteNurseryPlant.rejected,
          (state, action) => {
            state.deleteLoading = false;

            state.deleteError =
              action.payload ||
              'Unable to delete listing';
          },
        );
    },
  });

export const {
  clearNurseryErrors,
  clearSelectedPlant,
  clearNurseryPlants,
  clearMyListings,
} = nurserySlice.actions;

export default nurserySlice.reducer;