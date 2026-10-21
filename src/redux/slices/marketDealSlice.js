import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  createMarketDealApi,
  getMyMarketDealsApi,
  getMarketDealByIdApi,
  updateMarketDealApi,
  reviewMarketDealApi,
} from '../../api/marketApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

/*
|--------------------------------------------------------------------------
| CREATE DEAL (BUYER OFFER)
|--------------------------------------------------------------------------
|
| Rejects with {message, dealId}. dealId is set when the buyer already
| has an open offer on the listing (409), so the UI can open it.
|
*/

export const createMarketDeal = createAsyncThunk(
  'marketDeal/create',
  async (dealData, {rejectWithValue}) => {
    try {
      return await createMarketDealApi(dealData);
    } catch (error) {
      return rejectWithValue({
        message: errorMessage(error, 'Unable to send offer'),
        dealId: error.response?.data?.dealId || null,
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| MY DEALS
|--------------------------------------------------------------------------
|
| {params: {role, status, listingId, page, limit}, append}
|
*/

export const fetchMyMarketDeals = createAsyncThunk(
  'marketDeal/fetchMine',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getMyMarketDealsApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load deals'),
      );
    }
  },
);

export const fetchMarketDealById = createAsyncThunk(
  'marketDeal/fetchById',
  async (dealId, {rejectWithValue}) => {
    try {
      return await getMarketDealByIdApi(dealId);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load deal'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| NEGOTIATION
|--------------------------------------------------------------------------
|
| {dealId, action: counter | accept | reject | cancel | complete, body}
|
*/

export const updateMarketDeal = createAsyncThunk(
  'marketDeal/update',
  async ({dealId, action, body}, {rejectWithValue}) => {
    try {
      return await updateMarketDealApi(dealId, action, body);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to update deal'),
      );
    }
  },
);

export const reviewMarketDeal = createAsyncThunk(
  'marketDeal/review',
  async ({dealId, rating, comment}, {rejectWithValue}) => {
    try {
      return await reviewMarketDealApi(dealId, {rating, comment});
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to submit review'),
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
  deals: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
  dealsLoading: false,
  dealsLoadingMore: false,
  dealsError: null,

  selectedDeal: null,
  dealLoading: false,
  dealError: null,

  creating: false,

  // name of the negotiation action in flight, e.g. 'accept'
  actionInProgress: null,
};

const storeDeal = (state, deal) => {
  if (!deal?._id) {
    return;
  }

  state.selectedDeal = deal;
  state.deals = state.deals.map(item =>
    item._id === deal._id ? deal : item,
  );
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const marketDealSlice = createSlice({
  name: 'marketDeal',

  initialState,

  reducers: {
    clearSelectedMarketDeal: state => {
      state.selectedDeal = null;
      state.dealError = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(createMarketDeal.pending, state => {
        state.creating = true;
      })
      .addCase(createMarketDeal.fulfilled, (state, action) => {
        state.creating = false;

        const deal = action.payload?.deal;

        if (deal) {
          state.selectedDeal = deal;
          state.deals.unshift(deal);
        }
      })
      .addCase(createMarketDeal.rejected, state => {
        state.creating = false;
      });

    builder
      .addCase(fetchMyMarketDeals.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.dealsLoadingMore = true;
        } else {
          state.dealsLoading = true;
        }

        state.dealsError = null;
      })
      .addCase(fetchMyMarketDeals.fulfilled, (state, action) => {
        state.dealsLoading = false;
        state.dealsLoadingMore = false;

        const deals = action.payload?.deals || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.deals.map(item => item._id));

          state.deals = [
            ...state.deals,
            ...deals.filter(item => !known.has(item._id)),
          ];
        } else {
          state.deals = deals;
        }

        state.pagination = {
          page: action.payload?.page || 1,
          pages: action.payload?.pages || 1,
          total: action.payload?.total || 0,
        };
      })
      .addCase(fetchMyMarketDeals.rejected, (state, action) => {
        state.dealsLoading = false;
        state.dealsLoadingMore = false;
        state.dealsError = action.payload;
      });

    builder
      .addCase(fetchMarketDealById.pending, (state, action) => {
        state.dealLoading = true;
        state.dealError = null;

        if (state.selectedDeal?._id !== action.meta.arg) {
          state.selectedDeal = null;
        }
      })
      .addCase(fetchMarketDealById.fulfilled, (state, action) => {
        state.dealLoading = false;
        storeDeal(state, action.payload?.deal);
      })
      .addCase(fetchMarketDealById.rejected, (state, action) => {
        state.dealLoading = false;
        state.dealError = action.payload;
      });

    builder
      .addCase(updateMarketDeal.pending, (state, action) => {
        state.actionInProgress = action.meta.arg.action;
      })
      .addCase(updateMarketDeal.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeDeal(state, action.payload?.deal);
      })
      .addCase(updateMarketDeal.rejected, state => {
        state.actionInProgress = null;
      })

      .addCase(reviewMarketDeal.pending, state => {
        state.actionInProgress = 'review';
      })
      .addCase(reviewMarketDeal.fulfilled, (state, action) => {
        state.actionInProgress = null;
        storeDeal(state, action.payload?.deal);
      })
      .addCase(reviewMarketDeal.rejected, state => {
        state.actionInProgress = null;
      });
  },
});

export const {clearSelectedMarketDeal} = marketDealSlice.actions;

export default marketDealSlice.reducer;
