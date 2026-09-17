import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  getLatestArticlesApi,
  getArticleStatsApi,
} from '../../api/articleApi';

/*
|--------------------------------------------------------------------------
| GET LATEST ARTICLES
|--------------------------------------------------------------------------
*/

export const fetchLatestArticles =
  createAsyncThunk(
    'articles/fetchLatestArticles',
    async (
      {
        limit = 20,
        category = null,
      } = {},
      { rejectWithValue },
    ) => {
      try {
        const response =
          await getLatestArticlesApi({
            limit,
            category,
          });

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              'Failed to fetch agriculture articles',
          );
        }

        return {
          articles: response.data || [],
          count: response.count || 0,
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Failed to fetch agriculture articles',
        );
      }
    },
  );

/*
|--------------------------------------------------------------------------
| GET ARTICLE STATS
|--------------------------------------------------------------------------
*/

export const fetchArticleStats =
  createAsyncThunk(
    'articles/fetchArticleStats',
    async (_, { rejectWithValue }) => {
      try {
        const response =
          await getArticleStatsApi();

        if (!response?.success) {
          return rejectWithValue(
            response?.message ||
              'Failed to fetch article statistics',
          );
        }

        return response.data || {};
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            error.message ||
            'Failed to fetch article statistics',
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
  articles: [],
  count: 0,

  stats: {
    total: 0,
    bySource: [],
    byCategory: [],
  },

  loading: false,
  refreshing: false,
  statsLoading: false,

  error: null,
  statsError: null,

  selectedCategory: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const articleSlice = createSlice({
  name: 'articles',

  initialState,

  reducers: {
    clearArticleError: state => {
      state.error = null;
    },

    clearArticles: state => {
      state.articles = [];
      state.count = 0;
    },

    setSelectedCategory: (
      state,
      action,
    ) => {
      state.selectedCategory =
        action.payload || null;
    },

    clearSelectedCategory: state => {
      state.selectedCategory = null;
    },
  },

  extraReducers: builder => {
    builder

      /*
       * ----------------------------------------------------
       * FETCH LATEST ARTICLES
       * ----------------------------------------------------
       */

      .addCase(
        fetchLatestArticles.pending,
        (state, action) => {
          state.error = null;

          const isRefresh =
            action.meta.arg?.isRefresh === true;

          if (isRefresh) {
            state.refreshing = true;
          } else {
            state.loading = true;
          }
        },
      )

      .addCase(
        fetchLatestArticles.fulfilled,
        (state, action) => {
          state.loading = false;
          state.refreshing = false;
          state.error = null;

          state.articles =
            action.payload.articles;

          state.count =
            action.payload.count;
        },
      )

      .addCase(
        fetchLatestArticles.rejected,
        (state, action) => {
          state.loading = false;
          state.refreshing = false;

          state.error =
            action.payload ||
            'Failed to fetch agriculture articles';
        },
      )

      /*
       * ----------------------------------------------------
       * FETCH ARTICLE STATS
       * ----------------------------------------------------
       */

      .addCase(
        fetchArticleStats.pending,
        state => {
          state.statsLoading = true;
          state.statsError = null;
        },
      )

      .addCase(
        fetchArticleStats.fulfilled,
        (state, action) => {
          state.statsLoading = false;
          state.statsError = null;

          state.stats =
            action.payload;
        },
      )

      .addCase(
        fetchArticleStats.rejected,
        (state, action) => {
          state.statsLoading = false;

          state.statsError =
            action.payload ||
            'Failed to fetch article statistics';
        },
      );
  },
});

export const {
  clearArticleError,
  clearArticles,
  setSelectedCategory,
  clearSelectedCategory,
} = articleSlice.actions;

export default articleSlice.reducer;