import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  createNurseryOrderApi,
  getMyNurseryOrdersApi,
  getNurseryOrderByIdApi,
  cancelNurseryOrderApi,
} from '../../api/nurseryOrderApi';

/*
|--------------------------------------------------------------------------
| CREATE COD ORDER
|--------------------------------------------------------------------------
*/

export const createNurseryOrder =
  createAsyncThunk(
    'nurseryOrder/create',
    async (
      deliveryAddress,
      {rejectWithValue},
    ) => {
      try {
        return await createNurseryOrderApi(
          deliveryAddress,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to place order',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/

export const fetchMyNurseryOrders =
  createAsyncThunk(
    'nurseryOrder/fetch',
    async (_, {rejectWithValue}) => {
      try {
        return await getMyNurseryOrdersApi();
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load orders',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET ORDER
|--------------------------------------------------------------------------
*/

export const fetchNurseryOrderById =
  createAsyncThunk(
    'nurseryOrder/fetchById',
    async (
      orderId,
      {rejectWithValue},
    ) => {
      try {
        return await getNurseryOrderByIdApi(
          orderId,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to load order',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| CANCEL
|--------------------------------------------------------------------------
*/

export const cancelNurseryOrder =
  createAsyncThunk(
    'nurseryOrder/cancel',
    async (
      orderId,
      {rejectWithValue},
    ) => {
      try {
        return await cancelNurseryOrderApi(
          orderId,
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Unable to cancel order',
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
  orders: [],
  selectedOrder: null,

  loading: false,
  orderLoading: false,
  createLoading: false,
  cancelLoading: false,

  error: null,
  orderError: null,
  createError: null,
  cancelError: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const nurseryOrderSlice =
  createSlice({
    name: 'nurseryOrder',

    initialState,

    reducers: {
      clearNurseryOrderErrors:
        state => {
          state.error = null;
          state.orderError = null;
          state.createError = null;
          state.cancelError = null;
        },

      clearSelectedNurseryOrder:
        state => {
          state.selectedOrder = null;
        },
    },

    extraReducers: builder => {
      /*
      |--------------------------------------------------------------------------
      | CREATE ORDER
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          createNurseryOrder.pending,
          state => {
            state.createLoading = true;
            state.createError = null;
          },
        )

        .addCase(
          createNurseryOrder.fulfilled,
          (state, action) => {
            state.createLoading = false;

            const order =
              action.payload?.order ||
              action.payload?.data;

            if (order) {
              state.orders.unshift(
                order,
              );

              state.selectedOrder =
                order;
            }
          },
        )

        .addCase(
          createNurseryOrder.rejected,
          (state, action) => {
            state.createLoading = false;

            state.createError =
              action.payload;
          },
        );

      /*
      |--------------------------------------------------------------------------
      | FETCH ORDERS
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchMyNurseryOrders.pending,
          state => {
            state.loading = true;
            state.error = null;
          },
        )

        .addCase(
          fetchMyNurseryOrders.fulfilled,
          (state, action) => {
            state.loading = false;

            state.orders =
              action.payload?.orders ||
              action.payload?.data ||
              action.payload ||
              [];
          },
        )

        .addCase(
          fetchMyNurseryOrders.rejected,
          (state, action) => {
            state.loading = false;

            state.error =
              action.payload;
          },
        );

      /*
      |--------------------------------------------------------------------------
      | FETCH ORDER
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          fetchNurseryOrderById.pending,
          state => {
            state.orderLoading = true;
            state.orderError = null;
          },
        )

        .addCase(
          fetchNurseryOrderById.fulfilled,
          (state, action) => {
            state.orderLoading = false;

            state.selectedOrder =
              action.payload?.order ||
              action.payload?.data ||
              action.payload;
          },
        )

        .addCase(
          fetchNurseryOrderById.rejected,
          (state, action) => {
            state.orderLoading = false;

            state.orderError =
              action.payload;
          },
        );

      /*
      |--------------------------------------------------------------------------
      | CANCEL ORDER
      |--------------------------------------------------------------------------
      */

      builder
        .addCase(
          cancelNurseryOrder.pending,
          state => {
            state.cancelLoading = true;
            state.cancelError = null;
          },
        )

        .addCase(
          cancelNurseryOrder.fulfilled,
          (state, action) => {
            state.cancelLoading = false;

            const order =
              action.payload?.order ||
              action.payload?.data;

            if (!order?._id) {
              return;
            }

            state.orders =
              state.orders.map(
                item =>
                  item._id === order._id
                    ? order
                    : item,
              );

            if (
              state.selectedOrder?._id ===
              order._id
            ) {
              state.selectedOrder =
                order;
            }
          },
        )

        .addCase(
          cancelNurseryOrder.rejected,
          (state, action) => {
            state.cancelLoading = false;

            state.cancelError =
              action.payload;
          },
        );
    },
  });

export const {
  clearNurseryOrderErrors,
  clearSelectedNurseryOrder,
} = nurseryOrderSlice.actions;

export default nurseryOrderSlice.reducer;