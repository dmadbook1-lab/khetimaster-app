import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  getNurseryCartApi,
  addToNurseryCartApi,
  updateNurseryCartItemApi,
  removeNurseryCartItemApi,
  clearNurseryCartApi,
} from '../../api/nurseryCartApi';

/*
|--------------------------------------------------------------------------
| HELPER — NORMALIZE CART RESPONSE
|--------------------------------------------------------------------------
|
| Backend response:
|
| {
|   success: true,
|   data: {
|     items: [],
|     subtotal: 0,
|     totalItems: 0
|   }
| }
|
*/

const getCartData = response => {
  return (
    response?.data ||
    response?.cart ||
    response ||
    {}
  );
};

/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
*/

export const fetchNurseryCart =
  createAsyncThunk(
    'nurseryCart/fetch',
    async (_, {rejectWithValue}) => {
      try {
        return await getNurseryCartApi();
      } catch (error) {
        console.error(
          'Fetch nursery cart error:',
          error?.response?.data || error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load cart',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| ADD TO CART
|--------------------------------------------------------------------------
*/

export const addToNurseryCart =
  createAsyncThunk(
    'nurseryCart/add',
    async (
      {plantId, quantity = 1},
      {rejectWithValue},
    ) => {
      try {
        return await addToNurseryCartApi({
          plantId,
          quantity,
        });
      } catch (error) {
        console.error(
          'Add nursery cart error:',
          error?.response?.data || error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to add to cart',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/

export const updateNurseryCartItem =
  createAsyncThunk(
    'nurseryCart/update',
    async (
      {itemId, quantity},
      {rejectWithValue},
    ) => {
      try {
        return await updateNurseryCartItemApi(
          itemId,
          quantity,
        );
      } catch (error) {
        console.error(
          'Update nursery cart error:',
          error?.response?.data || error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to update cart',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| REMOVE ITEM
|--------------------------------------------------------------------------
*/

export const removeNurseryCartItem =
  createAsyncThunk(
    'nurseryCart/remove',
    async (
      itemId,
      {rejectWithValue},
    ) => {
      try {
        return await removeNurseryCartItemApi(
          itemId,
        );
      } catch (error) {
        console.error(
          'Remove nursery cart item error:',
          error?.response?.data || error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to remove item',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/

export const clearNurseryCart =
  createAsyncThunk(
    'nurseryCart/clear',
    async (_, {rejectWithValue}) => {
      try {
        return await clearNurseryCartApi();
      } catch (error) {
        console.error(
          'Clear nursery cart error:',
          error?.response?.data || error,
        );

        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to clear cart',
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
  items: [],
  subtotal: 0,
  totalItems: 0,

  loading: false,

  addLoading: false,
  updateLoading: false,
  removeLoading: false,
  clearLoading: false,

  error: null,
};

/*
|--------------------------------------------------------------------------
| APPLY CART RESPONSE
|--------------------------------------------------------------------------
*/

const applyCartResponse = (
  state,
  response,
) => {
  const cartData =
    getCartData(response);

  /*
  |--------------------------------------------------------------------------
  | Items
  |--------------------------------------------------------------------------
  */

  state.items = Array.isArray(
    cartData?.items,
  )
    ? cartData.items
    : [];

  /*
  |--------------------------------------------------------------------------
  | Subtotal
  |--------------------------------------------------------------------------
  */

  state.subtotal =
    Number(cartData?.subtotal) || 0;

  /*
  |--------------------------------------------------------------------------
  | Total Items
  |--------------------------------------------------------------------------
  */

  if (
    cartData?.totalItems !==
    undefined &&
    cartData?.totalItems !== null
  ) {
    state.totalItems =
      Number(cartData.totalItems) || 0;
  } else {
    state.totalItems =
      state.items.reduce(
        (total, item) =>
          total +
          Number(
            item?.quantity || 0,
          ),
        0,
      );
  }
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const nurseryCartSlice =
  createSlice({
    name: 'nurseryCart',

    initialState,

    reducers: {
      clearNurseryCartError: state => {
        state.error = null;
      },
    },

    extraReducers: builder => {
      /*
      |--------------------------------------------------------------------------
      | FETCH CART
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchNurseryCart.pending,
          state => {
            state.loading = true;
            state.error = null;
          },
        )

        .addCase(
          fetchNurseryCart.fulfilled,
          (state, action) => {
            state.loading = false;

            applyCartResponse(
              state,
              action.payload,
            );
          },
        )

        .addCase(
          fetchNurseryCart.rejected,
          (state, action) => {
            state.loading = false;

            state.error =
              action.payload ||
              'Unable to load cart';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | ADD TO CART
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          addToNurseryCart.pending,
          state => {
            state.addLoading = true;
            state.error = null;
          },
        )

        .addCase(
          addToNurseryCart.fulfilled,
          (state, action) => {
            state.addLoading = false;

            applyCartResponse(
              state,
              action.payload,
            );
          },
        )

        .addCase(
          addToNurseryCart.rejected,
          (state, action) => {
            state.addLoading = false;

            state.error =
              action.payload ||
              'Unable to add to cart';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | UPDATE CART
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          updateNurseryCartItem.pending,
          state => {
            state.updateLoading = true;
            state.error = null;
          },
        )

        .addCase(
          updateNurseryCartItem.fulfilled,
          (state, action) => {
            state.updateLoading = false;

            applyCartResponse(
              state,
              action.payload,
            );
          },
        )

        .addCase(
          updateNurseryCartItem.rejected,
          (state, action) => {
            state.updateLoading = false;

            state.error =
              action.payload ||
              'Unable to update cart';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | REMOVE ITEM
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          removeNurseryCartItem.pending,
          state => {
            state.removeLoading = true;
            state.error = null;
          },
        )

        .addCase(
          removeNurseryCartItem.fulfilled,
          (state, action) => {
            state.removeLoading = false;

            applyCartResponse(
              state,
              action.payload,
            );
          },
        )

        .addCase(
          removeNurseryCartItem.rejected,
          (state, action) => {
            state.removeLoading = false;

            state.error =
              action.payload ||
              'Unable to remove item';
          },
        );

      /*
      |--------------------------------------------------------------------------
      | CLEAR CART
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          clearNurseryCart.pending,
          state => {
            state.clearLoading = true;
            state.error = null;
          },
        )

        .addCase(
          clearNurseryCart.fulfilled,
          (state, action) => {
            state.clearLoading = false;

            applyCartResponse(
              state,
              action.payload,
            );

            /*
            | In case backend only returns success
            | without cart data.
            */

            state.items = [];
            state.subtotal = 0;
            state.totalItems = 0;
          },
        )

        .addCase(
          clearNurseryCart.rejected,
          (state, action) => {
            state.clearLoading = false;

            state.error =
              action.payload ||
              'Unable to clear cart';
          },
        );
    },
  });

export const {
  clearNurseryCartError,
} =
  nurseryCartSlice.actions;

export default nurseryCartSlice.reducer;