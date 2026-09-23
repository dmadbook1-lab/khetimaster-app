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
};
export default API_ENDPOINTS;
