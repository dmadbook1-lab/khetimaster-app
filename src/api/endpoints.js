const API_ENDPOINTS = {
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  COMPLETE_PROFILE: '/api/auth/complete-profile',
  UPDATE_PROFILE: 'api/auth/update-profile',
  REFRESH_TOKEN: '/api/auth/refresh',
  ME: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
    // Agriculture Articles
  LATEST_ARTICLES: '/api/articles/latest',
  ARTICLE_STATS: '/api/articles/stats',
  REFRESH_ARTICLES: '/api/articles/refresh',

    MANDI_CROPS: '/api/mandi/crops',

  MANDI_STATES: '/api/mandi/states',

  MANDI_DISTRICTS: '/api/mandi/districts',

  MANDI_RATES: '/api/mandi/rates',


  /*
  |--------------------------------------------------------------------------
  | FARM FIELD
  |--------------------------------------------------------------------------
  */

  // Add new farm
  FARM_FIELD_ADD: userId =>
    `/api/field/add-field/${userId}`,

  // Get all farms belonging to a user
  FARM_FIELDS_BY_USER: userId =>
    `/api/field/user/${userId}`,

  // Get one farm
  FARM_FIELD_BY_ID: fieldId =>
    `/api/field/${fieldId}`,

  // Update farm
  FARM_FIELD_UPDATE: fieldId =>
    `/api/field/${fieldId}`,

  // Delete farm
  FARM_FIELD_DELETE: fieldId =>
    `/api/field/${fieldId}`,

  /*
  |--------------------------------------------------------------------------
  | SMART FARM ADVISORY
  |--------------------------------------------------------------------------
  */

  // Latest advisory (starts generation when missing / stale)
  ADVISORY_BY_FIELD: fieldId =>
    `/api/advisory/${fieldId}`,

  // Force a fresh advisory
  ADVISORY_GENERATE: fieldId =>
    `/api/advisory/${fieldId}/generate`,

  // Live soil moisture / temperature + 7-day forecast
  ADVISORY_CONDITIONS: fieldId =>
    `/api/advisory/${fieldId}/conditions`,

  // Farmer progress on an activity
  ADVISORY_ACTIVITY_PROGRESS: (advisoryId, activityType) =>
    `/api/advisory/activity/${advisoryId}/${activityType}`,




   /*
  |--------------------------------------------------------------------------
  | NURSERY - PLANTS
  |--------------------------------------------------------------------------
  */

  NURSERY_PLANTS: '/api/nursery/plants',

  NURSERY_PLANT_BY_ID: plantId =>
    `/api/nursery/plants/${plantId}`,

  NURSERY_CATEGORIES: '/api/nursery/categories',

  NURSERY_META: '/api/nursery/meta',

  /*
  |--------------------------------------------------------------------------
  | NURSERY - SELLER
  |--------------------------------------------------------------------------
  */

  NURSERY_CREATE_PLANT:
    '/api/nursery/plants',

  NURSERY_MY_LISTINGS:
    '/api/nursery/my-listings',

  NURSERY_UPDATE_PLANT: plantId =>
    `/api/nursery/plants/${plantId}`,

  NURSERY_DELETE_PLANT: plantId =>
    `/api/nursery/plants/${plantId}`,

  /*
  |--------------------------------------------------------------------------
  | NURSERY - CART
  |--------------------------------------------------------------------------
  */

  NURSERY_CART:
    '/api/nursery/cart',

  NURSERY_ADD_TO_CART:
    '/api/nursery/cart',

  NURSERY_UPDATE_CART_ITEM: itemId =>
    `/api/nursery/cart/${itemId}`,

  NURSERY_REMOVE_CART_ITEM: itemId =>
    `/api/nursery/cart/${itemId}`,

  NURSERY_CLEAR_CART:
    '/api/nursery/cart',

  /*
  |--------------------------------------------------------------------------
  | NURSERY - ORDERS
  |--------------------------------------------------------------------------
  */

  NURSERY_ORDERS:
    '/api/nursery/orders',

  NURSERY_CREATE_ORDER:
    '/api/nursery/orders',

  NURSERY_ORDER_BY_ID: orderId =>
    `/api/nursery/orders/${orderId}`,

  NURSERY_CANCEL_ORDER: orderId =>
    `/api/nursery/orders/${orderId}/cancel`,

  NURSERY_REVIEW_ORDER_ITEM: (orderId, itemId) =>
    `/api/nursery/orders/${orderId}/items/${itemId}/review`,

  /*
  |--------------------------------------------------------------------------
  | NURSERY - SELLER ORDERS
  |--------------------------------------------------------------------------
  */

  NURSERY_SELLER_ORDERS:
    '/api/nursery/orders/seller',

  NURSERY_SELLER_STATUS: orderId =>
    `/api/nursery/orders/${orderId}/seller-status`,

  /*
  |--------------------------------------------------------------------------
  | MARKET - LISTINGS
  |--------------------------------------------------------------------------
  */

  MARKET_META: '/api/market/meta',

  MARKET_LISTINGS: '/api/market/listings',

  MARKET_MY_LISTINGS: '/api/market/listings/mine',

  MARKET_LISTING_BY_ID: listingId =>
    `/api/market/listings/${listingId}`,

  MARKET_LISTING_STATUS: listingId =>
    `/api/market/listings/${listingId}/status`,

  MARKET_LISTING_SAVE: listingId =>
    `/api/market/listings/${listingId}/save`,

  MARKET_SAVED: '/api/market/saved',

  MARKET_SELLER: userId =>
    `/api/market/sellers/${userId}`,

  /*
  |--------------------------------------------------------------------------
  | MARKET - DEALS
  |--------------------------------------------------------------------------
  */

  MARKET_DEALS: '/api/market/deals',

  MARKET_DEAL_BY_ID: dealId =>
    `/api/market/deals/${dealId}`,

  // action: counter | accept | reject | cancel | complete
  MARKET_DEAL_ACTION: (dealId, action) =>
    `/api/market/deals/${dealId}/${action}`,

  MARKET_DEAL_REVIEW: dealId =>
    `/api/market/deals/${dealId}/review`,

  /*
  |--------------------------------------------------------------------------
  | AI GURU
  |--------------------------------------------------------------------------
  */

  AI_GURU_CHAT: '/api/ai-guru/chat',

  AI_GURU_USAGE: '/api/ai-guru/usage',

  // GET list, DELETE clears all
  AI_GURU_SESSIONS: '/api/ai-guru/sessions',

  // GET with messages, PATCH, DELETE
  AI_GURU_SESSION: sessionId => `/api/ai-guru/sessions/${sessionId}`,

  AI_GURU_FEEDBACK: messageId =>
    `/api/ai-guru/messages/${messageId}/feedback`,
  /*
  |--------------------------------------------------------------------------
  | COMMUNITY (posts, reels, comments, follows, profiles)
  |--------------------------------------------------------------------------
  */

  // type: post | reel, scope: all | following, hashtag, page, limit
  COMMUNITY_FEED: '/api/community/feed',

  COMMUNITY_REEL_CREATORS: '/api/community/reel-creators',

  COMMUNITY_SEARCH: '/api/community/search',

  COMMUNITY_SAVED: '/api/community/saved',

  COMMUNITY_POSTS: '/api/community/posts',

  // GET, PATCH, DELETE
  COMMUNITY_POST: postId => `/api/community/posts/${postId}`,

  // action: like | save | view | share (POST adds, DELETE removes like / save)
  COMMUNITY_POST_ACTION: (postId, action) =>
    `/api/community/posts/${postId}/${action}`,

  COMMUNITY_POST_COMMENTS: postId =>
    `/api/community/posts/${postId}/comments`,

  COMMUNITY_COMMENT: commentId => `/api/community/comments/${commentId}`,

  COMMUNITY_MY_PROFILE: '/api/community/profile',

  COMMUNITY_USER: userId => `/api/community/users/${userId}`,

  COMMUNITY_USER_POSTS: userId => `/api/community/users/${userId}/posts`,

  // list: followers | following
  COMMUNITY_USER_FOLLOWS: (userId, list) =>
    `/api/community/users/${userId}/${list}`,

  COMMUNITY_FOLLOW: userId => `/api/community/users/${userId}/follow`,
};
export default API_ENDPOINTS;
