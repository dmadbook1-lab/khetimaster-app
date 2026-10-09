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
  | NURSERY - PLANTS
  |--------------------------------------------------------------------------
  */

  NURSERY_PLANTS: '/api/nursery/plants',

  NURSERY_PLANT_BY_ID: plantId =>
    `/api/nursery/plants/${plantId}`,

  NURSERY_CATEGORIES: '/api/nursery/categories',

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
};
export default API_ENDPOINTS;
