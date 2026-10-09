import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  addFarmFieldApi,
  getUserFarmFieldsApi,
  getFarmFieldApi,
  updateFarmFieldApi,
  deleteFarmFieldApi,
} from '../../api/farmFieldApi';

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  farms: [],

  currentFarm: null,

  loading: false,

  adding: false,

  updating: false,

  deleting: false,

  fetchingFarm: false,

  addSuccess: false,

  updateSuccess: false,

  deleteSuccess: false,

  error: null,

  message: null,
};

/*
|--------------------------------------------------------------------------
| ADD FARM FIELD
|--------------------------------------------------------------------------
|
| POST /api/field/add-field/:userId
|
|--------------------------------------------------------------------------
*/

export const addFarmField = createAsyncThunk(
  'farmField/addFarmField',

  async (
    {
      userId,
      latlng,

      cropName,

      // ✅ ADDED
      cropImage,

      variety,

      sowingDate,

      typeOfIrrigation,

      farmName,

      acre,

      typeOfFarming,

      isBarrenLand = false,
    },

    {rejectWithValue},
  ) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | USER
      |--------------------------------------------------------------------------
      */

      if (!userId) {
        return rejectWithValue(
          'User ID is required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | BOUNDARY
      |--------------------------------------------------------------------------
      */

      if (
        !Array.isArray(latlng) ||
        latlng.length < 3
      ) {
        return rejectWithValue(
          'At least 3 field boundary points are required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CROP
      |--------------------------------------------------------------------------
      */

      if (!cropName?.trim()) {
        return rejectWithValue(
          'Crop name is required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CROP IMAGE
      |--------------------------------------------------------------------------
      */

      const normalizedCropImage =
        typeof cropImage === 'string'
          ? cropImage.trim()
          : '';

      /*
      |--------------------------------------------------------------------------
      | VARIETY
      |--------------------------------------------------------------------------
      */

      if (!variety?.trim()) {
        return rejectWithValue(
          'Crop variety is required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SOWING DATE
      |--------------------------------------------------------------------------
      */

      if (!sowingDate) {
        return rejectWithValue(
          'Sowing date is required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IRRIGATION
      |--------------------------------------------------------------------------
      */

      if (!typeOfIrrigation?.trim()) {
        return rejectWithValue(
          'Irrigation type is required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FARM NAME
      |--------------------------------------------------------------------------
      */

      if (!farmName?.trim()) {
        return rejectWithValue(
          'Farm name is required.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | AREA
      |--------------------------------------------------------------------------
      */

      if (
        acre === undefined ||
        acre === null ||
        !Number.isFinite(Number(acre)) ||
        Number(acre) <= 0
      ) {
        return rejectWithValue(
          'Farm area must be greater than 0.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | FARMING TYPE
      |--------------------------------------------------------------------------
      */

      const allowedFarmingTypes = [
        'Organic',
        'Inorganic',
        'Integrated',
      ];

      if (
        !allowedFarmingTypes.includes(
          typeOfFarming,
        )
      ) {
        return rejectWithValue(
          'Invalid farming type.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | COORDINATES
      |--------------------------------------------------------------------------
      */

      const invalidCoordinate =
        latlng.some(point => {
          return (
            !point ||
            typeof point.lat !== 'number' ||
            typeof point.lng !== 'number' ||
            !Number.isFinite(point.lat) ||
            !Number.isFinite(point.lng)
          );
        });

      if (invalidCoordinate) {
        return rejectWithValue(
          'Invalid field boundary coordinates.',
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PAYLOAD
      |--------------------------------------------------------------------------
      */

      const payload = {
        latlng,

        cropName:
          cropName.trim(),

        // ================================================================
        // ✅ THIS WAS MISSING
        // ================================================================

        cropImage:
          normalizedCropImage,

        variety:
          variety.trim(),

        sowingDate,

        typeOfIrrigation:
          typeOfIrrigation.trim(),

        farmName:
          farmName.trim(),

        acre:
          Number(acre),

        typeOfFarming,

        isBarrenLand:
          Boolean(isBarrenLand),
      };

      /*
      |--------------------------------------------------------------------------
      | DEBUG
      |--------------------------------------------------------------------------
      */

      console.log(
        '==============================================',
      );

      console.log(
        'ADD FARM FIELD REDUX PAYLOAD',
      );

      console.log(
        'cropName:',
        payload.cropName,
      );

      console.log(
        'cropImage:',
        payload.cropImage,
      );

      console.log(
        'cropImage type:',
        typeof payload.cropImage,
      );

      console.log(
        'FULL PAYLOAD:',
        JSON.stringify(
          payload,
          null,
          2,
        ),
      );

      console.log(
        '==============================================',
      );

      /*
      |--------------------------------------------------------------------------
      | REQUEST
      |--------------------------------------------------------------------------
      */

      const response =
        await addFarmFieldApi(
          userId,
          payload,
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      if (!response?.success) {
        return rejectWithValue(
          response?.message ||
            'Failed to create farm field.',
        );
      }

      console.log(
        'FARM CREATED RESPONSE:',
        JSON.stringify(
          response,
          null,
          2,
        ),
      );

      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to create farm field.';

      console.error(
        'ADD FARM FIELD ERROR:',
        error,
      );

      return rejectWithValue(
        message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET ALL USER FARMS
|--------------------------------------------------------------------------
*/

export const loadMyFarms =
  createAsyncThunk(
    'farmField/loadMyFarms',

    async (
      userId,
      {rejectWithValue},
    ) => {
      try {
        if (!userId) {
          return rejectWithValue(
            'User ID is required.',
          );
        }

        const response =
          await getUserFarmFieldsApi(
            userId,
          );

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              'Failed to fetch farms.',
          );
        }

        return response;
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to fetch farms.';

        return rejectWithValue(
          message,
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET SINGLE FARM
|--------------------------------------------------------------------------
*/

export const getFarm =
  createAsyncThunk(
    'farmField/getFarm',

    async (
      fieldId,
      {rejectWithValue},
    ) => {
      try {
        if (!fieldId) {
          return rejectWithValue(
            'Farm field ID is required.',
          );
        }

        const response =
          await getFarmFieldApi(
            fieldId,
          );

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              'Failed to fetch farm.',
          );
        }

        return response;
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to fetch farm.';

        return rejectWithValue(
          message,
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| UPDATE FARM
|--------------------------------------------------------------------------
*/

export const updateFarmField =
  createAsyncThunk(
    'farmField/updateFarmField',

    async (
      {
        fieldId,
        farmData,
      },

      {rejectWithValue},
    ) => {
      try {
        if (!fieldId) {
          return rejectWithValue(
            'Farm field ID is required.',
          );
        }

        if (!farmData) {
          return rejectWithValue(
            'Farm field data is required.',
          );
        }

        /*
        |--------------------------------------------------------------------------
        | AREA VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
          farmData.acre !== undefined &&
          farmData.acre !== null
        ) {
          if (
            !Number.isFinite(
              Number(farmData.acre),
            ) ||
            Number(farmData.acre) <= 0
          ) {
            return rejectWithValue(
              'Farm area must be greater than 0.',
            );
          }
        }

        /*
        |--------------------------------------------------------------------------
        | FARMING TYPE
        |--------------------------------------------------------------------------
        */

        if (
          farmData.typeOfFarming &&
          ![
            'Organic',
            'Inorganic',
            'Integrated',
          ].includes(
            farmData.typeOfFarming,
          )
        ) {
          return rejectWithValue(
            'Invalid farming type.',
          );
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZE PAYLOAD
        |--------------------------------------------------------------------------
        */

        const payload = {
          ...farmData,
        };

        /*
        |--------------------------------------------------------------------------
        | CROP NAME
        |--------------------------------------------------------------------------
        */

        if (
          payload.cropName !==
          undefined
        ) {
          payload.cropName =
            String(
              payload.cropName,
            ).trim();
        }

        /*
        |--------------------------------------------------------------------------
        | CROP IMAGE
        |--------------------------------------------------------------------------
        |
        | ✅ Preserve cropImage during update.
        |
        */

        if (
          payload.cropImage !==
          undefined
        ) {
          payload.cropImage =
            typeof payload.cropImage ===
            'string'
              ? payload.cropImage.trim()
              : '';
        }

        /*
        |--------------------------------------------------------------------------
        | VARIETY
        |--------------------------------------------------------------------------
        */

        if (
          payload.variety !==
          undefined
        ) {
          payload.variety =
            String(
              payload.variety,
            ).trim();
        }

        /*
        |--------------------------------------------------------------------------
        | FARM NAME
        |--------------------------------------------------------------------------
        */

        if (
          payload.farmName !==
          undefined
        ) {
          payload.farmName =
            String(
              payload.farmName,
            ).trim();
        }

        /*
        |--------------------------------------------------------------------------
        | IRRIGATION
        |--------------------------------------------------------------------------
        */

        if (
          payload.typeOfIrrigation !==
          undefined
        ) {
          payload.typeOfIrrigation =
            String(
              payload.typeOfIrrigation,
            ).trim();
        }

        /*
        |--------------------------------------------------------------------------
        | AREA
        |--------------------------------------------------------------------------
        */

        if (
          payload.acre !==
          undefined
        ) {
          payload.acre =
            Number(
              payload.acre,
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DEBUG
        |--------------------------------------------------------------------------
        */

        console.log(
          '==============================================',
        );

        console.log(
          'UPDATE FARM FIELD PAYLOAD',
        );

        console.log(
          JSON.stringify(
            payload,
            null,
            2,
          ),
        );

        console.log(
          '==============================================',
        );

        /*
        |--------------------------------------------------------------------------
        | REQUEST
        |--------------------------------------------------------------------------
        */

        const response =
          await updateFarmFieldApi(
            fieldId,
            payload,
          );

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              'Failed to update farm.',
          );
        }

        return response;
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to update farm.';

        return rejectWithValue(
          message,
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| DELETE FARM
|--------------------------------------------------------------------------
*/

export const deleteFarmField =
  createAsyncThunk(
    'farmField/deleteFarmField',

    async (
      fieldId,
      {rejectWithValue},
    ) => {
      try {
        if (!fieldId) {
          return rejectWithValue(
            'Farm field ID is required.',
          );
        }

        const response =
          await deleteFarmFieldApi(
            fieldId,
          );

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              'Failed to delete farm.',
          );
        }

        return {
          ...response,
          deletedFieldId:
            fieldId,
        };
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to delete farm.';

        return rejectWithValue(
          message,
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const farmFieldSlice =
  createSlice({
    name: 'farmField',

    initialState,

    reducers: {
      clearFarmFieldError:
        state => {
          state.error = null;
        },

      clearFarmFieldSuccess:
        state => {
          state.addSuccess = false;
          state.updateSuccess = false;
          state.deleteSuccess = false;
          state.message = null;
        },

      resetFarmFieldAddState:
        state => {
          state.adding = false;
          state.addSuccess = false;
          state.error = null;
          state.message = null;
          state.currentFarm = null;
        },

      setCurrentFarm: (
        state,
        action,
      ) => {
        state.currentFarm =
          action.payload;
      },

      clearCurrentFarm:
        state => {
          state.currentFarm = null;
        },

      clearFarmFields:
        state => {
          state.farms = [];
          state.currentFarm =
            null;
        },

      resetFarmFieldState:
        state => {
          state.loading = false;
          state.adding = false;
          state.updating = false;
          state.deleting = false;
          state.fetchingFarm =
            false;

          state.addSuccess = false;
          state.updateSuccess =
            false;
          state.deleteSuccess =
            false;

          state.error = null;
          state.message = null;
        },
    },

    extraReducers:
      builder => {
        /*
        |--------------------------------------------------------------------------
        | ADD FARM
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            addFarmField.pending,
            state => {
              state.adding = true;
              state.addSuccess = false;
              state.error = null;
              state.message = null;
            },
          )

          .addCase(
            addFarmField.fulfilled,
            (
              state,
              action,
            ) => {
              state.adding = false;
              state.addSuccess = true;
              state.error = null;

              state.message =
                action.payload?.message ||
                'Farm field created successfully.';

              const farmField =
                action.payload
                  ?.farmField;

              if (farmField) {
                state.currentFarm =
                  farmField;

                const farmId =
                  farmField._id ||
                  farmField.id;

                const existingIndex =
                  state.farms.findIndex(
                    farm => {
                      const id =
                        farm._id ||
                        farm.id;

                      return (
                        id === farmId
                      );
                    },
                  );

                if (
                  existingIndex !==
                  -1
                ) {
                  state.farms[
                    existingIndex
                  ] = farmField;
                } else {
                  state.farms.unshift(
                    farmField,
                  );
                }
              }
            },
          )

          .addCase(
            addFarmField.rejected,
            (
              state,
              action,
            ) => {
              state.adding = false;
              state.addSuccess = false;

              state.error =
                action.payload ||
                'Failed to create farm field.';

              state.message = null;
            },
          );

        /*
        |--------------------------------------------------------------------------
        | GET USER FARMS
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            loadMyFarms.pending,
            state => {
              state.loading = true;
              state.error = null;
            },
          )

          .addCase(
            loadMyFarms.fulfilled,
            (
              state,
              action,
            ) => {
              state.loading = false;
              state.error = null;

              state.farms =
                action.payload
                  ?.farms || [];

              if (
                state.currentFarm
              ) {
                const currentId =
                  state.currentFarm
                    ?._id ||
                  state.currentFarm?.id;

                const updatedCurrent =
                  state.farms.find(
                    farm =>
                      (farm._id ||
                        farm.id) ===
                      currentId,
                  );

                if (
                  updatedCurrent
                ) {
                  state.currentFarm =
                    updatedCurrent;
                }
              }
            },
          )

          .addCase(
            loadMyFarms.rejected,
            (
              state,
              action,
            ) => {
              state.loading = false;

              state.error =
                action.payload ||
                'Failed to fetch farms.';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | GET SINGLE FARM
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            getFarm.pending,
            state => {
              state.fetchingFarm =
                true;
              state.error = null;
            },
          )

          .addCase(
            getFarm.fulfilled,
            (
              state,
              action,
            ) => {
              state.fetchingFarm =
                false;
              state.error = null;

              const farm =
                action.payload
                  ?.farmField ||
                action.payload?.farm ||
                null;

              if (farm) {
                state.currentFarm =
                  farm;

                const farmId =
                  farm._id ||
                  farm.id;

                const index =
                  state.farms.findIndex(
                    item =>
                      (item._id ||
                        item.id) ===
                      farmId,
                  );

                if (index !== -1) {
                  state.farms[index] =
                    farm;
                }
              }
            },
          )

          .addCase(
            getFarm.rejected,
            (
              state,
              action,
            ) => {
              state.fetchingFarm =
                false;

              state.error =
                action.payload ||
                'Failed to fetch farm.';
            },
          );

        /*
        |--------------------------------------------------------------------------
        | UPDATE FARM
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            updateFarmField.pending,
            state => {
              state.updating = true;
              state.updateSuccess =
                false;
              state.error = null;
              state.message = null;
            },
          )

          .addCase(
            updateFarmField.fulfilled,
            (
              state,
              action,
            ) => {
              state.updating = false;
              state.updateSuccess =
                true;
              state.error = null;

              state.message =
                action.payload?.message ||
                'Farm updated successfully.';

              const updatedFarm =
                action.payload
                  ?.farmField ||
                action.payload?.farm ||
                null;

              if (
                !updatedFarm
              ) {
                return;
              }

              const farmId =
                updatedFarm._id ||
                updatedFarm.id;

              const index =
                state.farms.findIndex(
                  farm =>
                    (farm._id ||
                      farm.id) ===
                    farmId,
                );

              if (index !== -1) {
                state.farms[index] =
                  updatedFarm;
              } else {
                state.farms.unshift(
                  updatedFarm,
                );
              }

              state.currentFarm =
                updatedFarm;
            },
          )

          .addCase(
            updateFarmField.rejected,
            (
              state,
              action,
            ) => {
              state.updating = false;
              state.updateSuccess =
                false;

              state.error =
                action.payload ||
                'Failed to update farm.';

              state.message = null;
            },
          );

        /*
        |--------------------------------------------------------------------------
        | DELETE FARM
        |--------------------------------------------------------------------------
        */

        builder
          .addCase(
            deleteFarmField.pending,
            state => {
              state.deleting = true;
              state.deleteSuccess =
                false;
              state.error = null;
              state.message = null;
            },
          )

          .addCase(
            deleteFarmField.fulfilled,
            (
              state,
              action,
            ) => {
              state.deleting = false;
              state.deleteSuccess =
                true;
              state.error = null;

              state.message =
                action.payload?.message ||
                'Farm deleted successfully.';

              const deletedId =
                action.payload
                  ?.deletedFieldId;

              state.farms =
                state.farms.filter(
                  farm => {
                    const id =
                      farm._id ||
                      farm.id;

                    return (
                      id !==
                      deletedId
                    );
                  },
                );

              const currentId =
                state.currentFarm
                  ?._id ||
                state.currentFarm?.id;

              if (
                currentId ===
                deletedId
              ) {
                state.currentFarm =
                  null;
              }
            },
          )

          .addCase(
            deleteFarmField.rejected,
            (
              state,
              action,
            ) => {
              state.deleting = false;
              state.deleteSuccess =
                false;

              state.error =
                action.payload ||
                'Failed to delete farm.';

              state.message = null;
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
  clearFarmFieldError,
  clearFarmFieldSuccess,
  resetFarmFieldAddState,
  setCurrentFarm,
  clearCurrentFarm,
  clearFarmFields,
  resetFarmFieldState,
} =
  farmFieldSlice.actions;

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectFarmFields =
  state =>
    state.farmField?.farms ||
    [];

export const selectCurrentFarm =
  state =>
    state.farmField
      ?.currentFarm || null;

export const selectFarmFieldsLoading =
  state =>
    state.farmField?.loading ||
    false;

export const selectFarmFieldAdding =
  state =>
    state.farmField?.adding ||
    false;

export const selectFarmFieldUpdating =
  state =>
    state.farmField?.updating ||
    false;

export const selectFarmFieldDeleting =
  state =>
    state.farmField?.deleting ||
    false;

export const selectFarmFieldFetching =
  state =>
    state.farmField
      ?.fetchingFarm || false;

export const selectFarmFieldError =
  state =>
    state.farmField?.error ||
    null;

export const selectFarmFieldAddSuccess =
  state =>
    state.farmField
      ?.addSuccess || false;

export const selectFarmFieldUpdateSuccess =
  state =>
    state.farmField
      ?.updateSuccess || false;

export const selectFarmFieldDeleteSuccess =
  state =>
    state.farmField
      ?.deleteSuccess || false;

export const selectFarmFieldMessage =
  state =>
    state.farmField
      ?.message || null;

/*
|--------------------------------------------------------------------------
| REDUCER
|--------------------------------------------------------------------------
*/

export default farmFieldSlice.reducer;