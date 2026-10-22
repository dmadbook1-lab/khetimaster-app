import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  createNurseryOrderApi,
  getMyNurseryOrdersApi,
  getNurseryOrderByIdApi,
  cancelNurseryOrderApi,
  reviewNurseryOrderItemApi,
  getSellerNurseryOrdersApi,
  updateSellerNurseryOrderApi,
} from '../../api/nurseryOrderApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| BUYER
|--------------------------------------------------------------------------
*/

export const placeNurseryOrder = createAsyncThunk(
  'nurseryOrder/place',
  async (deliveryAddress, { rejectWithValue }) => {
    try {
      return await createNurseryOrderApi(deliveryAddress);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to place order'));
    }
  },
);

/*
 * {params: {status, page, limit}, append}
 */
export const fetchMyNurseryOrders = createAsyncThunk(
  'nurseryOrder/fetchMine',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getMyNurseryOrdersApi(params);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load your orders'));
    }
  },
);

export const fetchNurseryOrderById = createAsyncThunk(
  'nurseryOrder/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      return await getNurseryOrderByIdApi(orderId);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load order'));
    }
  },
);

export const cancelNurseryOrder = createAsyncThunk(
  'nurseryOrder/cancel',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      return await cancelNurseryOrderApi(orderId, reason);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to cancel order'));
    }
  },
);

export const reviewNurseryOrderItem = createAsyncThunk(
  'nurseryOrder/review',
  async ({ orderId, itemId, rating, comment }, { rejectWithValue }) => {
    try {
      return await reviewNurseryOrderItemApi(orderId, itemId, {
        rating,
        comment,
      });
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to submit review'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| SELLER
|--------------------------------------------------------------------------
*/

/*
 * {params: {status, page, limit}, append}
 */
export const fetchSellerNurseryOrders = createAsyncThunk(
  'nurseryOrder/fetchSeller',
  async ({ params = {} } = {}, { rejectWithValue }) => {
    try {
      return await getSellerNurseryOrdersApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load orders received'),
      );
    }
  },
);

/*
 * {orderId, status, reason}
 */
export const updateSellerNurseryOrder = createAsyncThunk(
  'nurseryOrder/updateSeller',
  async ({ orderId, status, reason }, { rejectWithValue }) => {
    try {
      return await updateSellerNurseryOrderApi(orderId, status, reason);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update order'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const emptyList = {
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
  loading: false,
  loadingMore: false,
  error: null,
};

const initialState = {
  myOrders: emptyList,
  sellerOrders: emptyList,

  selectedOrder: null,
  orderLoading: false,
  orderError: null,

  // seller views by order id, kept for the seller order screen
  sellerOrderById: {},

  placing: false,
  // 'cancel' | 'review' | a seller status while it is being saved
  actionInProgress: null,
};

const storeBuyerOrder = (state, order) => {
  if (!order?._id) return;

  state.selectedOrder = order;
  state.myOrders.items = state.myOrders.items.map(item =>
    item._id === order._id ? order : item,
  );
};

const storeSellerOrder = (state, order) => {
  if (!order?._id) return;

  state.sellerOrderById[order._id] = order;
  state.sellerOrders.items = state.sellerOrders.items.map(item =>
    item._id === order._id ? order : item,
  );
};

const addListCases = (builder, thunk, key, onLoaded) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      const list = state[key];

      if (action.meta.arg?.append) {
        list.loadingMore = true;
      } else {
        list.loading = true;
      }

      list.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const list = state[key];
      const orders = action.payload?.data || [];

      list.loading = false;
      list.loadingMore = false;

      if (action.meta.arg?.append) {
        const known = new Set(list.items.map(item => item._id));
        list.items = [
          ...list.items,
          ...orders.filter(item => !known.has(item._id)),
        ];
      } else {
        list.items = orders;
      }

      const pagination = action.payload?.pagination || {};
      list.page = pagination.page || 1;
      list.totalPages = pagination.totalPages || 1;
      list.total = pagination.total || 0;

      onLoaded?.(state, orders);
    })
    .addCase(thunk.rejected, (state, action) => {
      const list = state[key];

      list.loading = false;
      list.loadingMore = false;
      list.error = action.payload;
    });
};

const nurseryOrderSlice = createSlice({
  name: 'nurseryOrder',

  initialState,

  reducers: {
    clearSelectedNurseryOrder: state => {
      state.selectedOrder = null;
      state.orderError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(placeNurseryOrder.pending, state => {
        state.placing = true;
      })
      .addCase(placeNurseryOrder.fulfilled, (state, action) => {
        state.placing = false;

        const order = action.payload?.data;

        if (order?._id) {
          state.selectedOrder = order;
          state.myOrders.items.unshift(order);
        }
      })
      .addCase(placeNurseryOrder.rejected, state => {
        state.placing = false;
      });

    addListCases(builder, fetchMyNurseryOrders, 'myOrders');
    addListCases(
      builder,
      fetchSellerNurseryOrders,
      'sellerOrders',
      (state, orders) => {
        for (const order of orders) {
          state.sellerOrderById[order._id] = order;
        }
      },
    );

    builder
      .addCase(fetchNurseryOrderById.pending, (state, action) => {
        state.orderLoading = true;
        state.orderError = null;

        if (state.selectedOrder?._id !== action.meta.arg) {
          state.selectedOrder = null;
        }
      })
      .addCase(fetchNurseryOrderById.fulfilled, (state, action) => {
        state.orderLoading = false;
        storeBuyerOrder(state, action.payload?.data);
      })
      .addCase(fetchNurseryOrderById.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload;
      });

    builder
      .addCase(cancelNurseryOrder.pending, state => {
        state.actionInProgress = 'cancel';
      })
      .addCase(cancelNurseryOrder.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeBuyerOrder(state, action.payload?.data);
      })
      .addCase(cancelNurseryOrder.rejected, state => {
        state.actionInProgress = null;
      })

      .addCase(reviewNurseryOrderItem.pending, state => {
        state.actionInProgress = 'review';
      })
      .addCase(reviewNurseryOrderItem.fulfilled, (state, action) => {
        state.actionInProgress = null;

        // the review response has no seller phone numbers; keep them
        const order = action.payload?.data;
        const previous = state.selectedOrder;

        if (order?._id && previous?._id === order._id) {
          storeBuyerOrder(state, {
            ...order,
            items: order.items.map(item => {
              const old = previous.items.find(entry => entry._id === item._id);
              return old?.seller?.phoneNumber
                ? { ...item, seller: old.seller }
                : item;
            }),
          });
        } else {
          storeBuyerOrder(state, order);
        }
      })
      .addCase(reviewNurseryOrderItem.rejected, state => {
        state.actionInProgress = null;
      })

      .addCase(updateSellerNurseryOrder.pending, (state, action) => {
        state.actionInProgress = action.meta.arg.status;
      })
      .addCase(updateSellerNurseryOrder.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeSellerOrder(state, action.payload?.data);
      })
      .addCase(updateSellerNurseryOrder.rejected, state => {
        state.actionInProgress = null;
      });
  },
});

export const { clearSelectedNurseryOrder } = nurseryOrderSlice.actions;

export default nurseryOrderSlice.reducer;
