/**
 * User storage utilities for managing user_id in localStorage
 */

const USER_ID_KEY = 'ceremic_user_id'
const USER_DATA_KEY = 'ceremic_user_data'

/**
 * Get user ID from localStorage
 * @returns {number|null} User ID or null if not found
 */
export const getUserId = () => {
  const userId = localStorage.getItem(USER_ID_KEY)
  return userId ? parseInt(userId, 10) : null
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
export const isUserLoggedIn = () => {
  return getUserId() !== null
}

/**
 * Save user ID to localStorage
 * @param {number} userId - User ID to save
 */
export const saveUserId = (userId) => {
  localStorage.setItem(USER_ID_KEY, userId.toString())
}

/**
 * Save user data to localStorage
 * @param {Object} userData - User data object
 */
export const saveUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
  if (userData.id) {
    saveUserId(userData.id)
  }
}

/**
 * Get user data from localStorage
 * @returns {Object|null} User data or null if not found
 */
export const getUserData = () => {
  const userDataStr = localStorage.getItem(USER_DATA_KEY)
  return userDataStr ? JSON.parse(userDataStr) : null
}

/**
 * Clear user data from localStorage (logout)
 */
export const clearUserData = () => {
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USER_DATA_KEY)
}

