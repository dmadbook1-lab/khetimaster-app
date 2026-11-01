import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  getCommunityFeedApi,
  getReelCreatorsApi,
  createCommunityPostApi,
  updateCommunityPostApi,
  deleteCommunityPostApi,
  setPostReactionApi,
  setFollowApi,
} from '../../api/communityApi';

const errorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/*
|--------------------------------------------------------------------------
| STATE SHAPE
|--------------------------------------------------------------------------
|
| Posts live once in postsById so a like in the Reels player shows up in
| the feed and on profiles too. Lists only hold ids.
|
| following: {userId: bool} overrides post.author.isFollowing after the
| viewer taps Follow anywhere in the app.
|
*/

const emptyList = () => ({
  ids: [],
  page: 0,
  pages: 1,
  loading: false,
  refreshing: false,
  error: null,
});

const initialState = {
  postsById: {},

  feed: emptyList(),
  followingFeed: emptyList(),
  reels: emptyList(),

  creators: [],

  following: {},

  creating: false,
};

const LIST_FOR = {
  all: 'feed',
  following: 'followingFeed',
  reel: 'reels',
};

/*
|--------------------------------------------------------------------------
| FEED / REELS
|--------------------------------------------------------------------------
|
| {list: 'all' | 'following' | 'reel', refresh}
| refresh loads page 1 and replaces the list, otherwise the next page is
| appended.
|
*/

export const fetchCommunityList = createAsyncThunk(
  'community/fetchList',
  async ({ list = 'all', refresh = false } = {}, { getState, rejectWithValue }) => {
    const current = getState().community[LIST_FOR[list]];
    const page = refresh ? 1 : current.page + 1;

    try {
      const data = await getCommunityFeedApi({
        type: list === 'reel' ? 'reel' : undefined,
        scope: list === 'following' ? 'following' : undefined,
        page,
      });

      return { ...data, page };
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load posts'));
    }
  },
  {
    condition: ({ list = 'all', refresh = false } = {}, { getState }) => {
      const current = getState().community[LIST_FOR[list]];

      if (current.loading) return false;

      return refresh || current.page < current.pages;
    },
  },
);

export const fetchReelCreators = createAsyncThunk(
  'community/fetchReelCreators',
  async (_, { rejectWithValue }) => {
    try {
      return await getReelCreatorsApi();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load reels'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| CREATE / EDIT / DELETE
|--------------------------------------------------------------------------
*/

export const createCommunityPost = createAsyncThunk(
  'community/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      return await createCommunityPostApi(postData);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to share post'));
    }
  },
);

export const updateCommunityPost = createAsyncThunk(
  'community/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      return await updateCommunityPostApi(postId, postData);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update post'));
    }
  },
);

export const deleteCommunityPost = createAsyncThunk(
  'community/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await deleteCommunityPostApi(postId);

      return { postId };
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to delete post'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| LIKE / SAVE / FOLLOW
|--------------------------------------------------------------------------
|
| The UI flips straight away (pending) and rolls back if the request
| fails (rejected).
|
*/

export const togglePostLike = createAsyncThunk(
  'community/toggleLike',
  async ({ postId, like }, { rejectWithValue }) => {
    try {
      return await setPostReactionApi(postId, 'like', like);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to like post'));
    }
  },
);

export const togglePostSave = createAsyncThunk(
  'community/toggleSave',
  async ({ postId, save }, { rejectWithValue }) => {
    try {
      return await setPostReactionApi(postId, 'save', save);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to save post'));
    }
  },
);

export const toggleFollow = createAsyncThunk(
  'community/toggleFollow',
  async ({ userId, follow }, { rejectWithValue }) => {
    try {
      return await setFollowApi(userId, follow);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to update follow'));
    }
  },
);

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const upsert = (state, posts = []) => {
  posts.forEach(post => {
    state.postsById[post._id] = {
      ...state.postsById[post._id],
      ...post,
    };
  });
};

const patchPost = (state, postId, changes) => {
  const post = state.postsById[postId];

  if (post) {
    Object.assign(post, changes);
  }
};

const removeId = (list, postId) => {
  list.ids = list.ids.filter(id => id !== postId);
};

const communitySlice = createSlice({
  name: 'community',

  initialState,

  reducers: {
    // Posts loaded by screens that keep their own lists (profile, search)
    upsertCommunityPosts: (state, action) => {
      upsert(state, action.payload);
    },

    setPostCommentsCount: (state, action) => {
      const { postId, commentsCount } = action.payload;

      patchPost(state, postId, { commentsCount });
    },

    bumpPostViews: (state, action) => {
      const post = state.postsById[action.payload];

      if (post) {
        post.viewsCount = (post.viewsCount || 0) + 1;
      }
    },

    setFollowing: (state, action) => {
      const { userId, isFollowing } = action.payload;

      state.following[userId] = isFollowing;
    },

    // My avatar / bio changed - refresh it on my posts already loaded
    updateMyAuthorInfo: (state, action) => {
      const user = action.payload;

      Object.values(state.postsById).forEach(post => {
        if (post.author?._id === user._id) {
          post.author = { ...post.author, ...user };
        }
      });
    },

    clearCommunity: () => initialState,
  },

  extraReducers: builder => {
    builder

      /* LISTS */

      .addCase(fetchCommunityList.pending, (state, action) => {
        const list = state[LIST_FOR[action.meta.arg?.list || 'all']];

        list.loading = true;
        list.refreshing = Boolean(action.meta.arg?.refresh);
        list.error = null;
      })

      .addCase(fetchCommunityList.fulfilled, (state, action) => {
        const list = state[LIST_FOR[action.meta.arg?.list || 'all']];
        const posts = action.payload.posts || [];

        upsert(state, posts);

        const ids = posts.map(post => post._id);

        list.ids =
          action.payload.page === 1
            ? ids
            : [...list.ids, ...ids.filter(id => !list.ids.includes(id))];

        list.page = action.payload.page;
        list.pages = action.payload.pages || 1;
        list.loading = false;
        list.refreshing = false;
      })

      .addCase(fetchCommunityList.rejected, (state, action) => {
        const list = state[LIST_FOR[action.meta.arg?.list || 'all']];

        list.loading = false;
        list.refreshing = false;
        list.error = action.payload || 'Unable to load posts';
      })

      .addCase(fetchReelCreators.fulfilled, (state, action) => {
        state.creators = action.payload.creators || [];
      })

      /* CREATE */

      .addCase(createCommunityPost.pending, state => {
        state.creating = true;
      })

      .addCase(createCommunityPost.fulfilled, (state, action) => {
        const post = action.payload.post;

        state.creating = false;

        if (!post) return;

        upsert(state, [post]);

        state.feed.ids.unshift(post._id);
        state.followingFeed.ids.unshift(post._id);

        if (post.type === 'reel') {
          state.reels.ids.unshift(post._id);
        }
      })

      .addCase(createCommunityPost.rejected, state => {
        state.creating = false;
      })

      .addCase(updateCommunityPost.fulfilled, (state, action) => {
        if (action.payload.post) {
          upsert(state, [action.payload.post]);
        }
      })

      .addCase(deleteCommunityPost.fulfilled, (state, action) => {
        const { postId } = action.payload;

        delete state.postsById[postId];

        removeId(state.feed, postId);
        removeId(state.followingFeed, postId);
        removeId(state.reels, postId);
      })

      /* LIKE */

      .addCase(togglePostLike.pending, (state, action) => {
        const { postId, like } = action.meta.arg;
        const post = state.postsById[postId];

        if (post && post.isLiked !== like) {
          post.isLiked = like;
          post.likesCount = Math.max((post.likesCount || 0) + (like ? 1 : -1), 0);
        }
      })

      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { postId, likesCount } = action.payload;

        if (likesCount !== undefined) {
          patchPost(state, postId, { likesCount });
        }
      })

      .addCase(togglePostLike.rejected, (state, action) => {
        const { postId, like } = action.meta.arg;
        const post = state.postsById[postId];

        if (post && post.isLiked === like) {
          post.isLiked = !like;
          post.likesCount = Math.max((post.likesCount || 0) + (like ? -1 : 1), 0);
        }
      })

      /* SAVE */

      .addCase(togglePostSave.pending, (state, action) => {
        const { postId, save } = action.meta.arg;

        patchPost(state, postId, { isSaved: save });
      })

      .addCase(togglePostSave.rejected, (state, action) => {
        const { postId, save } = action.meta.arg;

        patchPost(state, postId, { isSaved: !save });
      })

      /* FOLLOW */

      .addCase(toggleFollow.pending, (state, action) => {
        const { userId, follow } = action.meta.arg;

        state.following[userId] = follow;
      })

      .addCase(toggleFollow.rejected, (state, action) => {
        const { userId, follow } = action.meta.arg;

        state.following[userId] = !follow;
      });
  },
});

/*
|--------------------------------------------------------------------------
| SELECTORS
|--------------------------------------------------------------------------
*/

export const selectCommunityPost = (state, postId) =>
  state.community.postsById[postId];

/*
 * Follow state for an author: the viewer's latest tap wins, otherwise
 * whatever the server said when the post / profile was loaded.
 */
export const selectIsFollowing = (state, userId, fallback = false) => {
  const value = state.community.following[userId];

  return value === undefined ? Boolean(fallback) : value;
};

export const selectMyUserId = state =>
  state.auth.user?.id || state.auth.user?._id || null;

export const {
  upsertCommunityPosts,
  setPostCommentsCount,
  bumpPostViews,
  setFollowing,
  updateMyAuthorInfo,
  clearCommunity,
} = communitySlice.actions;

export default communitySlice.reducer;
