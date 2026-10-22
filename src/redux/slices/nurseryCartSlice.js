import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getNurseryCartApi,
  addToNurseryCartApi,
  updateNurseryCartItemApi,
  removeNurseryCartItemApi,
  clearNurseryCartApi,
} from '../../api/nurseryCartApi';
import { placeNurseryOrder } from './nurseryOrderSlice';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| THUNKS
|--------------------------------------------------------------------------
|
| Each one resolves with the whole cart from the server.
|
*/

export const fetchNurseryCart = createAsyncThunk(
  'nurseryCart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getNurseryCartApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load cart'));
    }
  },
);

export const addToNurseryCart = createAsyncThunk(
  'nurseryCart/add',
  async ({ plantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await addToNurseryCartApi({ plantId, quantity });
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to add to cart'));
    }
  },
);

export const updateNurseryCartItem = createAsyncThunk(
  'nurseryCart/update',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await updateNurseryCartItemApi(itemId, quantity);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update cart'));
    }
  },
);

export const removeNurseryCartItem = createAsyncThunk(
  'nurseryCart/remove',
  async (itemId, { rejectWithValue }) => {
    try {
      return await removeNurseryCartItemApi(itemId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to remove item'));
    }
  },
);

/*
 * The cart view caps items at the stock left (quantityAdjusted), but
 * checkout uses the saved quantity. Save the capped quantities first so
 * the order doesn't fail with "Only N left".
 */
export const syncAdjustedCartItems = createAsyncThunk(
  'nurseryCart/syncAdjusted',
  async (_, { getState, rejectWithValue }) => {
    try {
      const adjusted = getState().nurseryCart.cart.items.filter(
        item => item.quantityAdjusted,
      );

      let latest = null;
      for (const item of adjusted) {
        latest = await updateNurseryCartItemApi(item._id, item.quantity);
      }

      return latest;
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update cart'));
    }
  },
);

export const clearNurseryCart = createAsyncThunk(
  'nurseryCart/clear',
  async (_, { rejectWithValue }) => {
    try {
      return await clearNurseryCartApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to clear cart'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const emptyCart = {
  items: [],
  unavailableItems: [],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
  totalItems: 0,
};

const initialState = {
  cart: emptyCart,
  loaded: false,
  loading: false,
  error: null,

  adding: false,
  // cart item id being changed or removed, or 'all' while clearing
  busyItemId: null,
};

const storeCart = (state, action) => {
  state.cart = { ...emptyCart, ...(action.payload?.data || {}) };
  state.loaded = true;
};

const nurseryCartSlice = createSlice({
  name: 'nurseryCart',

  initialState,

  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(fetchNurseryCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNurseryCart.fulfilled, (state, action) => {
        state.loading = false;
        storeCart(state, action);
      })
      .addCase(fetchNurseryCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToNurseryCart.pending, state => {
        state.adding = true;
      })
      .addCase(addToNurseryCart.fulfilled, (state, action) => {
        state.adding = false;
        storeCart(state, action);
      })
      .addCase(addToNurseryCart.rejected, state => {
        state.adding = false;
      })

      .addCase(updateNurseryCartItem.pending, (state, action) => {
        state.busyItemId = action.meta.arg.itemId;
      })
      .addCase(updateNurseryCartItem.fulfilled, (state, action) => {
        state.busyItemId = null;
        storeCart(state, action);
      })
      .addCase(updateNurseryCartItem.rejected, state => {
        state.busyItemId = null;
      })

      .addCase(removeNurseryCartItem.pending, (state, action) => {
        state.busyItemId = action.meta.arg;
      })
      .addCase(removeNurseryCartItem.fulfilled, (state, action) => {
        state.busyItemId = null;
        storeCart(state, action);
      })
      .addCase(removeNurseryCartItem.rejected, state => {
        state.busyItemId = null;
      })

      .addCase(syncAdjustedCartItems.fulfilled, (state, action) => {
        if (action.payload) storeCart(state, action);
      })

      .addCase(clearNurseryCart.pending, state => {
        state.busyItemId = 'all';
      })
      .addCase(clearNurseryCart.fulfilled, (state, action) => {
        state.busyItemId = null;
        storeCart(state, action);
      })
      .addCase(clearNurseryCart.rejected, state => {
        state.busyItemId = null;
      })

      // the server empties the cart when an order is placed
      .addCase(placeNurseryOrder.fulfilled, state => {
        state.cart = emptyCart;
      });
  },
});

export default nurseryCartSlice.reducer;
