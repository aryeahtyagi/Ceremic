// API Configuration
// Change this base URL to point to your backend service
export const API_BASE_URL = 'http://localhost:9090'

// Generic API URL alias (use this for things like favicon, tracking, etc.)
export const API_URL = API_BASE_URL

export const API_ENDPOINTS = {
  COLLECTIONS: '/collections',
  COLLECTION_BY_ID: '/collections', // Base path, append /{id} when calling
  USER_CREATE: '/user/create',
  USER_LOGIN: '/user/login',
  USER_CART: '/user/cart',
  USER_LOAD_CART: '/user/load/cart',
  USER_ORDER: '/user/order',
  USER_ORDERBOOK: '/user/orderbook',
  LOG: '/log'
}

// Redirect URL after successful purchase
// IMPORTANT: Use only internal (relative) paths to avoid Google Ads flagging
// External URLs (http:// or https://) will be blocked for security
// This should be a relative path like '/Ceremic/thank-you'
export const POST_PURCHASE_REDIRECT_URL = '/Ceremic/thank-you' // Internal path only


