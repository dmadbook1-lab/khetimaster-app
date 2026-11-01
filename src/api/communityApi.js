import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/*
 * Drop empty values so the backend only sees filters that were set.
 */
const cleanParams = params =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

/*
|--------------------------------------------------------------------------
| FEED / DISCOVERY
|--------------------------------------------------------------------------
|
| type (post | reel), scope (all | following), hashtag, page, limit
|
*/

export const getCommunityFeedApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_FEED, {
    params: cleanParams(params),
  });

  return response.data;
};

export const getReelCreatorsApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_REEL_CREATORS);

  return response.data;
};

// {users, posts, hashtags}
export const searchCommunityApi = async q => {
  const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_SEARCH, {
    params: { q },
  });

  return response.data;
};

export const getSavedPostsApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_SAVED, {
    params: cleanParams(params),
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| POSTS
|--------------------------------------------------------------------------
|
| {type, caption, location, media: [{url, type, thumbnailUrl, width, height, duration}]}
|
*/

export const createCommunityPostApi = async postData => {
  const response = await apiClient.post(
    API_ENDPOINTS.COMMUNITY_POSTS,
    postData,
  );

  return response.data;
};

export const getCommunityPostApi = async postId => {
  const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_POST(postId));

  return response.data;
};

export const updateCommunityPostApi = async (postId, postData) => {
  const response = await apiClient.patch(
    API_ENDPOINTS.COMMUNITY_POST(postId),
    postData,
  );

  return response.data;
};

export const deleteCommunityPostApi = async postId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.COMMUNITY_POST(postId),
  );

  return response.data;
};

/*
 * action: like | save. active true adds, false removes.
 */
export const setPostReactionApi = async (postId, action, active) => {
  const url = API_ENDPOINTS.COMMUNITY_POST_ACTION(postId, action);
  const response = active
    ? await apiClient.post(url)
    : await apiClient.delete(url);

  return response.data;
};

// action: view | share
export const bumpPostCounterApi = async (postId, action) => {
  const response = await apiClient.post(
    API_ENDPOINTS.COMMUNITY_POST_ACTION(postId, action),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| COMMENTS
|--------------------------------------------------------------------------
*/

export const getPostCommentsApi = async (postId, page = 1) => {
  const response = await apiClient.get(
    API_ENDPOINTS.COMMUNITY_POST_COMMENTS(postId),
    { params: { page } },
  );

  return response.data;
};

export const addPostCommentApi = async (postId, text) => {
  const response = await apiClient.post(
    API_ENDPOINTS.COMMUNITY_POST_COMMENTS(postId),
    { text },
  );

  return response.data;
};

export const deletePostCommentApi = async commentId => {
  const response = await apiClient.delete(
    API_ENDPOINTS.COMMUNITY_COMMENT(commentId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| PROFILES / FOLLOW
|--------------------------------------------------------------------------
*/

export const getCommunityProfileApi = async userId => {
  const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_USER(userId));

  return response.data;
};

export const getUserCommunityPostsApi = async (userId, params = {}) => {
  const response = await apiClient.get(
    API_ENDPOINTS.COMMUNITY_USER_POSTS(userId),
    { params: cleanParams(params) },
  );

  return response.data;
};

// {bio, avatar}
export const updateCommunityProfileApi = async profileData => {
  const response = await apiClient.put(
    API_ENDPOINTS.COMMUNITY_MY_PROFILE,
    profileData,
  );

  return response.data;
};

// list: followers | following
export const getUserFollowsApi = async (userId, list, page = 1) => {
  const response = await apiClient.get(
    API_ENDPOINTS.COMMUNITY_USER_FOLLOWS(userId, list),
    { params: { page } },
  );

  return response.data;
};

export const setFollowApi = async (userId, follow) => {
  const url = API_ENDPOINTS.COMMUNITY_FOLLOW(userId);
  const response = follow
    ? await apiClient.post(url)
    : await apiClient.delete(url);

  return response.data;
};
