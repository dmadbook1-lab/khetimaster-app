import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';

import {
  getMarketMetaApi,
  getMarketListingsApi,
  getMyMarketListingsApi,
  getMarketListingByIdApi,
  createMarketListingApi,
  updateMarketListingApi,
  updateMarketListingStatusApi,
  deleteMarketListingApi,
  getSavedMarketListingsApi,
  saveMarketListingApi,
  unsaveMarketListingApi,
  getMarketSellerProfileApi,
} from '../../api/marketApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.message ||
  fallback;

/*
|--------------------------------------------------------------------------
| META
|--------------------------------------------------------------------------
*/

export const fetchMarketMeta = createAsyncThunk(
  'market/fetchMeta',
  async (_, {rejectWithValue}) => {
    try {
      return await getMarketMetaApi();
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load categories'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| BROWSE LISTINGS
|--------------------------------------------------------------------------
|
| {params, append} - append adds the next page to the current list.
|
*/

export const fetchMarketListings = createAsyncThunk(
  'market/fetchListings',
  async ({params = {}} = {}, {rejectWithValue}) => {
    try {
      return await getMarketListingsApi(params);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load listings'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| LISTING BY ID
|--------------------------------------------------------------------------
*/

export const fetchMarketListingById = createAsyncThunk(
  'market/fetchListingById',
  async (listingId, {rejectWithValue}) => {
    try {
      return await getMarketListingByIdApi(listingId);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load listing'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| CREATE / UPDATE LISTING
|--------------------------------------------------------------------------
*/

export const createMarketListing = createAsyncThunk(
  'market/createListing',
  async (listingData, {rejectWithValue}) => {
    try {
      return await createMarketListingApi(listingData);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to create listing'),
      );
    }
  },
);

export const updateMarketListing = createAsyncThunk(
  'market/updateListing',
  async ({listingId, listingData}, {rejectWithValue}) => {
    try {
      return await updateMarketListingApi(
        listingId,
        listingData,
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to update listing'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| PAUSE / RESUME / DELETE
|--------------------------------------------------------------------------
*/

export const updateMarketListingStatus = createAsyncThunk(
  'market/updateListingStatus',
  async ({listingId, status}, {rejectWithValue}) => {
    try {
      return await updateMarketListingStatusApi(
        listingId,
        status,
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to update listing'),
      );
    }
  },
);

export const deleteMarketListing = createAsyncThunk(
  'market/deleteListing',
  async (listingId, {rejectWithValue}) => {
    try {
      const data = await deleteMarketListingApi(listingId);

      return {listingId, data};
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to delete listing'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| MY LISTINGS
|--------------------------------------------------------------------------
*/

export const fetchMyMarketListings = createAsyncThunk(
  'market/fetchMyListings',
  async (status = 'all', {rejectWithValue}) => {
    try {
      return await getMyMarketListingsApi(status);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load your listings'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| SAVED LISTINGS
|--------------------------------------------------------------------------
*/

export const fetchSavedMarketListings = createAsyncThunk(
  'market/fetchSaved',
  async (_, {rejectWithValue}) => {
    try {
      return await getSavedMarketListingsApi();
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load saved listings'),
      );
    }
  },
);

/*
 * {listingId, save} - the UI flips isSaved straight away and rolls back
 * if the request fails.
 */
export const toggleSaveMarketListing = createAsyncThunk(
  'market/toggleSave',
  async ({listingId, save}, {rejectWithValue}) => {
    try {
      return save
        ? await saveMarketListingApi(listingId)
        : await unsaveMarketListingApi(listingId);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to update saved listings'),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| SELLER PROFILE
|--------------------------------------------------------------------------
*/

export const fetchMarketSellerProfile = createAsyncThunk(
  'market/fetchSellerProfile',
  async (userId, {rejectWithValue}) => {
    try {
      return await getMarketSellerProfileApi(userId);
    } catch (error) {
      return rejectWithValue(
        errorMessage(error, 'Unable to load seller'),
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
  meta: {
    categories: [],
    units: [],
    equipmentConditions: [],
    produceGrades: [],
  },
  metaLoading: false,
  metaError: null,

  listings: [],
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
  listingsLoading: false,
  listingsLoadingMore: false,
  listingsError: null,

  selectedListing: null,
  listingLoading: false,
  listingError: null,

  myListings: [],
  myListingsLoading: false,
  myListingsError: null,

  saved: [],
  savedLoading: false,
  savedError: null,

  sellerProfile: null,
  sellerLoading: false,
  sellerError: null,

  saving: false,
  statusUpdating: false,
  deleting: false,
};

/*
 * Apply a change to every copy of a listing held in the store.
 */
const patchListing = (state, listingId, patch) => {
  const apply = item =>
    item._id === listingId ? {...item, ...patch} : item;

  state.listings = state.listings.map(apply);
  state.myListings = state.myListings.map(apply);
  state.saved = state.saved.map(apply);

  if (state.selectedListing?._id === listingId) {
    state.selectedListing = {
      ...state.selectedListing,
      ...patch,
    };
  }
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const marketSlice = createSlice({
  name: 'market',

  initialState,

  reducers: {
    clearSelectedMarketListing: state => {
      state.selectedListing = null;
      state.listingError = null;
    },

    clearMarketSellerProfile: state => {
      state.sellerProfile = null;
      state.sellerError = null;
    },
  },

  extraReducers: builder => {
    /*
    |--------------------------------------------------------------------------
    | META
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchMarketMeta.pending, state => {
        state.metaLoading = true;
        state.metaError = null;
      })
      .addCase(fetchMarketMeta.fulfilled, (state, action) => {
        state.metaLoading = false;

        state.meta = {
          categories: action.payload?.categories || [],
          units: action.payload?.units || [],
          equipmentConditions:
            action.payload?.equipmentConditions || [],
          produceGrades: action.payload?.produceGrades || [],
        };
      })
      .addCase(fetchMarketMeta.rejected, (state, action) => {
        state.metaLoading = false;
        state.metaError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | BROWSE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchMarketListings.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.listingsLoadingMore = true;
        } else {
          state.listingsLoading = true;
        }

        state.listingsError = null;
      })
      .addCase(fetchMarketListings.fulfilled, (state, action) => {
        state.listingsLoading = false;
        state.listingsLoadingMore = false;

        const listings = action.payload?.listings || [];

        if (action.meta.arg?.append) {
          const known = new Set(state.listings.map(item => item._id));

          state.listings = [
            ...state.listings,
            ...listings.filter(item => !known.has(item._id)),
          ];
        } else {
          state.listings = listings;
        }

        state.pagination = {
          page: action.payload?.page || 1,
          pages: action.payload?.pages || 1,
          total: action.payload?.total || 0,
        };
      })
      .addCase(fetchMarketListings.rejected, (state, action) => {
        state.listingsLoading = false;
        state.listingsLoadingMore = false;
        state.listingsError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | LISTING BY ID
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchMarketListingById.pending, (state, action) => {
        state.listingLoading = true;
        state.listingError = null;

        if (state.selectedListing?._id !== action.meta.arg) {
          state.selectedListing = null;
        }
      })
      .addCase(fetchMarketListingById.fulfilled, (state, action) => {
        state.listingLoading = false;
        state.selectedListing = action.payload?.listing || null;
      })
      .addCase(fetchMarketListingById.rejected, (state, action) => {
        state.listingLoading = false;
        state.listingError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(createMarketListing.pending, state => {
        state.saving = true;
      })
      .addCase(createMarketListing.fulfilled, (state, action) => {
        state.saving = false;

        const listing = action.payload?.listing;

        if (listing) {
          state.myListings.unshift({...listing, pendingOffers: 0});
        }
      })
      .addCase(createMarketListing.rejected, state => {
        state.saving = false;
      })

      .addCase(updateMarketListing.pending, state => {
        state.saving = true;
      })
      .addCase(updateMarketListing.fulfilled, (state, action) => {
        state.saving = false;

        const listing = action.payload?.listing;

        // merge so fields only the details / my listings endpoints add
        // (isOwner, sellerStats, pendingOffers...) are kept
        if (listing?._id) {
          patchListing(state, listing._id, listing);
        }
      })
      .addCase(updateMarketListing.rejected, state => {
        state.saving = false;
      });

    /*
    |--------------------------------------------------------------------------
    | STATUS / DELETE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(updateMarketListingStatus.pending, state => {
        state.statusUpdating = true;
      })
      .addCase(updateMarketListingStatus.fulfilled, (state, action) => {
        state.statusUpdating = false;

        const listing = action.payload?.listing;

        if (listing?._id) {
          patchListing(state, listing._id, {status: listing.status});

          if (listing.status !== 'ACTIVE') {
            state.listings = state.listings.filter(
              item => item._id !== listing._id,
            );
          }
        }
      })
      .addCase(updateMarketListingStatus.rejected, state => {
        state.statusUpdating = false;
      })

      .addCase(deleteMarketListing.pending, state => {
        state.deleting = true;
      })
      .addCase(deleteMarketListing.fulfilled, (state, action) => {
        state.deleting = false;

        const {listingId} = action.payload;
        const keep = item => item._id !== listingId;

        state.listings = state.listings.filter(keep);
        state.myListings = state.myListings.filter(keep);
        state.saved = state.saved.filter(keep);

        if (state.selectedListing?._id === listingId) {
          state.selectedListing = null;
        }
      })
      .addCase(deleteMarketListing.rejected, state => {
        state.deleting = false;
      });

    /*
    |--------------------------------------------------------------------------
    | MY LISTINGS
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchMyMarketListings.pending, state => {
        state.myListingsLoading = true;
        state.myListingsError = null;
      })
      .addCase(fetchMyMarketListings.fulfilled, (state, action) => {
        state.myListingsLoading = false;
        state.myListings = action.payload?.listings || [];
      })
      .addCase(fetchMyMarketListings.rejected, (state, action) => {
        state.myListingsLoading = false;
        state.myListingsError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | SAVED
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchSavedMarketListings.pending, state => {
        state.savedLoading = true;
        state.savedError = null;
      })
      .addCase(fetchSavedMarketListings.fulfilled, (state, action) => {
        state.savedLoading = false;
        state.saved = action.payload?.listings || [];
      })
      .addCase(fetchSavedMarketListings.rejected, (state, action) => {
        state.savedLoading = false;
        state.savedError = action.payload;
      })

      .addCase(toggleSaveMarketListing.pending, (state, action) => {
        const {listingId, save} = action.meta.arg;

        patchListing(state, listingId, {isSaved: save});

        if (!save) {
          state.saved = state.saved.filter(item => item._id !== listingId);
        }
      })
      .addCase(toggleSaveMarketListing.rejected, (state, action) => {
        const {listingId, save} = action.meta.arg;

        patchListing(state, listingId, {isSaved: !save});
      });

    /*
    |--------------------------------------------------------------------------
    | SELLER PROFILE
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(fetchMarketSellerProfile.pending, state => {
        state.sellerLoading = true;
        state.sellerError = null;
      })
      .addCase(fetchMarketSellerProfile.fulfilled, (state, action) => {
        state.sellerLoading = false;
        state.sellerProfile = action.payload || null;
      })
      .addCase(fetchMarketSellerProfile.rejected, (state, action) => {
        state.sellerLoading = false;
        state.sellerError = action.payload;
      });
  },
});

export const {
  clearSelectedMarketListing,
  clearMarketSellerProfile,
} = marketSlice.actions;

export default marketSlice.reducer;
