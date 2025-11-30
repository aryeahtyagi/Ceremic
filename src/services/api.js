import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

// Cache configuration
const COLLECTIONS_CACHE_KEY = 'ceremic_collections_cache'
const CACHE_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Get cached collections data if it exists and is not expired
 * @returns {Object|null} Cached data with timestamp or null
 */
const getCachedCollections = () => {
  try {
    const cached = localStorage.getItem(COLLECTIONS_CACHE_KEY)
    if (!cached) {
      console.log('No cache found in localStorage')
      return null
    }
    
    const cacheObj = JSON.parse(cached)
    const { data, timestamp } = cacheObj
    const now = Date.now()
    const age = now - timestamp
    const ageMinutes = Math.floor(age / 60000)
    
    console.log(`Cache found - Age: ${ageMinutes} minutes (expires in ${30 - ageMinutes} minutes)`)
    
    // Check if cache is expired (30 minutes)
    if (age > CACHE_EXPIRY_MS) {
      // Cache expired, remove it
      console.log('Cache expired, removing...')
      localStorage.removeItem(COLLECTIONS_CACHE_KEY)
      return null
    }
    
    console.log('Cache is valid, returning cached data')
    return data
  } catch (error) {
    console.error('Error reading cache:', error)
    // If cache is corrupted, remove it
    localStorage.removeItem(COLLECTIONS_CACHE_KEY)
    return null
  }
}

/**
 * Store collections data in cache with current timestamp
 * @param {Array} data - Collections data to cache
 */
const setCachedCollections = (data) => {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now()
    }
    localStorage.setItem(COLLECTIONS_CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

/**
 * Fetch collections from the backend API
 * Uses cache if available and not expired (30 minutes)
 * @returns {Promise<Array>} Array of collection items
 */
export const fetchCollections = async () => {
  try {
    // Check cache first
    console.log('Checking cache for collections...')
    const cachedData = getCachedCollections()
    
    if (cachedData !== null && cachedData !== undefined) {
      console.log('✅ Using cached collections data (cache hit)')
      console.log('Cached data length:', Array.isArray(cachedData) ? cachedData.length : 'N/A')
      return Promise.resolve(cachedData)
    }
    
    // Cache miss or expired, fetch from API
    console.log('❌ Cache miss or expired - Fetching collections from API')
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COLLECTIONS}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API response received, data length:', Array.isArray(data) ? data.length : 'N/A')
    
    // Store in cache
    setCachedCollections(data)
    console.log('💾 Collections data cached successfully')
    
    return data
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw error
  }
}

/**
 * Fetch a single product by ID from the backend API
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Single product object
 */
export const fetchProductById = async (productId) => {
  try {
    // Use the specific product endpoint: /collections/{productId}
    const url = `${API_BASE_URL}/collections/${productId}`
    console.log('Fetching product from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Product data received:', data)
    return data
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    throw error
  }
}

/**
 * Transform a single product from API response to frontend format
 * @param {Object} item - Single product from API
 * @returns {Object} Transformed product data
 */
export const transformProductData = (item) => {
  if (!item) return null
  
  // Transform benefits to trust badges format
  const benefits = (item.benefits || []).map(benefit => ({
      id: benefit.id,
      logo: (benefit.logo && benefit.logo.trim() !== '') ? benefit.logo : '',
      value: benefit.value || '',
      description: benefit.description || ''
    }))

  // Transform productLovePoints to features format
  const features = (item.productLovePoints || []).map(point => point.value || '')

  // Transform productDetails to specifications format
  const specifications = (item.productDetails || []).map(detail => {
      const dimension = detail.dimension || {}
      const unit = dimension.unit ? ` ${dimension.unit}` : ''
      const value = detail.value || ''
      return {
        id: detail.id,
        label: dimension.name || '',
        value: `${value}${unit}`.trim()
      }
    })

  // Transform reviews
  const reviews = (item.reviews || []).map(review => ({
    id: review.id,
    userName: review.user?.username || 'Anonymous',
    rating: review.rating || 0,
    date: review.createdOn || review.modifiedOn || new Date().toISOString(),
    comment: review.description || ''
  }))

  // Transform reviewsMetaData
  const reviewsMetaData = item.reviewsMetaData ? {
    averageRating: item.reviewsMetaData.rating || 0,
    totalReviews: item.reviewsMetaData.reviews || 0
  } : null

  // Transform discounts and calculate discounted price
  const originalPrice = item.price || 0
  const discountData = item.discounts
  const hasDiscount = discountData && discountData.enable && discountData.discount > 0
  const discountPercentage = hasDiscount ? discountData.discount : 0
  const discountedPrice = hasDiscount 
    ? Math.round(originalPrice - (originalPrice * discountPercentage / 100))
    : originalPrice

  // Transform images array - extract base64 values and catalogImage flag
  const imagesWithMetadata = (item.images || []).map(img => ({
    base64: img.base64 || '',
    catalogImage: img.catalogImage || false
  })).filter(img => img.base64 !== '')
  
  // Find catalog image (image with catalogImage: true)
  const catalogImageObj = imagesWithMetadata.find(img => img.catalogImage === true)
  
  // Sort images: catalog image first, then others
  const sortedImages = catalogImageObj
    ? [catalogImageObj, ...imagesWithMetadata.filter(img => img !== catalogImageObj)]
    : imagesWithMetadata
  
  // Extract base64 values in sorted order
  const images = sortedImages.map(img => img.base64)
  
  // Handle legacy image field (if it exists as an object with value property)
  let legacyImage = ''
  if (item.image) {
    if (typeof item.image === 'string') {
      legacyImage = item.image
    } else if (item.image.value) {
      legacyImage = item.image.value
    }
  }
  
  // Set catalog image as main image (used in Home and Collections)
  // Priority: catalog image > first image from images array > legacy image field
  const mainImage = catalogImageObj 
    ? catalogImageObj.base64 
    : (images.length > 0 ? images[0] : legacyImage)

  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: originalPrice,
    discountedPrice: discountedPrice,
    hasDiscount: hasDiscount,
    discountPercentage: discountPercentage,
    image: mainImage, // First image from images array for backward compatibility
    images: images, // All images array for product detail page
    category: 'new', // Default category, can be updated if API provides category
    createdOn: item.createdOn,
    modifiedOn: item.modifiedOn,
    // Extended details for product detail page
    benefits: benefits,
    features: features,
    specifications: specifications,
    about: item.about || '',
    reviews: reviews,
    reviewsMetaData: reviewsMetaData
  }
}

/**
 * Transform API response to frontend format
 * @param {Array} apiData - Raw API response
 * @returns {Array} Transformed product data
 */
export const transformCollectionsData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    return []
  }
  return apiData.map(item => transformProductData(item)).filter(item => item !== null)
}

/**
 * Create a new user account
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username
 * @param {string} userData.phoneNumber - Phone number
 * @param {string} userData.email - Email address
 * @param {string} userData.address - Address
 * @param {string} userData.pincode - Pincode
 * @returns {Promise<Object>} Created user object with id
 */
export const createUser = async (userData) => {
  try {
    const params = new URLSearchParams({
      id: '0',
      username: userData.username || '',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      address: userData.address || '',
      pincode: userData.pincode || ''
    })

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_CREATE}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Check if response has content before parsing JSON
    const text = await response.text()
    if (!text || text.trim() === '' || text.trim() === 'null') {
      return null
    }

    try {
      const data = JSON.parse(text)
      return data
    } catch (parseError) {
      // If parsing fails, return null (user already exists)
      return null
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Login user by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} User object with id
 */
export const loginUser = async (phoneNumber) => {
  try {
    const params = new URLSearchParams({
      phoneNumber: phoneNumber.replace(/\D/g, '')
    })

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_LOGIN}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error logging in user:', error)
    throw error
  }
}

/**
 * Add or update cart item
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to set
 * @returns {Promise<Object>} Cart item object with id, userId, productId, quantity
 */
export const updateCartItem = async (userId, productId, quantity) => {
  try {
    const params = new URLSearchParams({
      id: '0',
      userId: userId.toString(),
      productId: productId.toString(),
      quantity: quantity.toString()
    })

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_CART}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating cart item:', error)
    throw error
  }
}

/**
 * Load user's cart with product details
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Cart data with cart items, products, and user info
 */
export const loadUserCart = async (userData) => {
  try {
    const params = new URLSearchParams({
      id: userData.id?.toString() || '0',
      username: userData.username || '',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      address: userData.address || '',
      pincode: userData.pincode || ''
    })

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_LOAD_CART}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading user cart:', error)
    throw error
  }
}

/**
 * Place an order
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Order response
 */
export const placeOrder = async (userData) => {
  try {
    const params = new URLSearchParams({
      id: userData.id?.toString() || '0',
      username: userData.username || '',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      address: userData.address || '',
      pincode: userData.pincode || ''
    })

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_ORDER}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Check if response has content before parsing JSON
    const text = await response.text()
    if (!text || text.trim() === '') {
      // Empty response means success
      return { success: true }
    }

    try {
      const data = JSON.parse(text)
      return data
    } catch (parseError) {
      // If parsing fails but status is 200, consider it success
      return { success: true }
    }
  } catch (error) {
    console.error('Error placing order:', error)
    throw error
  }
}

/**
 * Load user order book (order history)
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Order book data with orderBooks, ceremics, and user
 */
export const loadUserOrderBook = async (userData) => {
  try {
    const params = new URLSearchParams({
      id: userData.id?.toString() || '0',
      username: userData.username || '',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      address: userData.address || '',
      pincode: userData.pincode || ''
    })

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USER_ORDERBOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading user order book:', error)
    throw error
  }
}

