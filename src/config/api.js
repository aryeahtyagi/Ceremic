// API Configuration
// Change this base URL to point to your backend service
export const API_BASE_URL = 'https://newsletters-constitutional-evanescence-cheap.trycloudflare.com'

export const API_ENDPOINTS = {
  COLLECTIONS: '/collections',
  USER_CREATE: '/user/create',
  USER_LOGIN: '/user/login',
  USER_CART: '/user/cart',
  USER_LOAD_CART: '/user/load/cart',
  USER_ORDER: '/user/order',
  USER_ORDERBOOK: '/user/orderbook'
}

// Redirect URL after successful purchase
// Change this to your desired thank you page or tracking URL
// For tracking purchases, you can use:
// - Google Analytics conversion tracking: 'https://www.google-analytics.com/collect?...'
// - Facebook Pixel conversion: 'https://www.facebook.com/tr?...'
// - Your custom thank you page: 'https://yoursite.com/thank-you'
// - Or any tracking URL you need
export const POST_PURCHASE_REDIRECT_URL = '/Ceremic/thank-you' // Set your tracking URL here


