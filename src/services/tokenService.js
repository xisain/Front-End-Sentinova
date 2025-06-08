import { auth } from '../js/firebase-init';
import { signInWithCustomToken } from 'firebase/auth';

class TokenManager {
  constructor() {
    // Store tokens with their expiry time
    this.tokenStore = new Map();
    // Default token expiry time (55 minutes to be safe, as Firebase tokens expire in 1 hour)
    this.TOKEN_EXPIRY = 55 * 60 * 1000; // 55 minutes in milliseconds
    // Track current active user
    this.currentUserId = null;

    // Initialize Clerk session listener
    this.initClerkListener();
  }

  /**
   * Initialize Clerk session listener
   */
  initClerkListener() {
    if (window.Clerk) {
      window.Clerk.addListener((event) => {
        if (event.type === 'signIn') {
          console.log('User signed in, updating current user');
          this.currentUserId = event.payload.userId;
        } else if (event.type === 'signOut') {
          console.log('User signed out, cleaning up tokens');
          if (this.currentUserId) {
            this.clearToken(this.currentUserId);
            this.currentUserId = null;
          }
          // Sign out from Firebase as well
          auth.signOut();
        } else if (event.type === 'userUpdated') {
          console.log('User updated, refreshing token');
          const userId = event.payload.id;
          // Clear existing token to force refresh
          this.clearToken(userId);
        }
      });
    }
  }

  /**
   * Get stored token data for a user
   * @param {string} userId 
   * @returns {Object|null} Token data or null if not found
   */
  getStoredToken(userId) {
    return this.tokenStore.get(userId);
  }

  /**
   * Check if a stored token is still valid
   * @param {Object} tokenData 
   * @returns {boolean}
   */
  isTokenValid(tokenData) {
    if (!tokenData) return false;
    // Add 5-minute buffer to ensure token doesn't expire during use
    const BUFFER_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() < (tokenData.expiryTime - BUFFER_TIME);
  }

  /**
   * Store a new token with its expiry time
   * @param {string} userId 
   * @param {string} token 
   */
  storeToken(userId, token) {
    this.tokenStore.set(userId, {
      token,
      expiryTime: Date.now() + this.TOKEN_EXPIRY,
      lastUsed: Date.now()
    });
  }

  /**
   * Update last used timestamp for a token
   * @param {string} userId 
   */
  updateLastUsed(userId) {
    const tokenData = this.tokenStore.get(userId);
    if (tokenData) {
      tokenData.lastUsed = Date.now();
      this.tokenStore.set(userId, tokenData);
    }
  }

  /**
   * Clean up old unused tokens
   * Removes tokens that haven't been used in the last 2 hours
   */
  cleanupOldTokens() {
    const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const now = Date.now();

    for (const [userId, tokenData] of this.tokenStore.entries()) {
      if (now - tokenData.lastUsed > TWO_HOURS) {
        console.log(`Cleaning up unused token for user: ${userId}`);
        this.tokenStore.delete(userId);
      }
    }
  }

  /**
   * Get a valid Firebase token for a user
   * @param {Object} clerkUser - The Clerk user object
   * @returns {Promise<string>} Firebase token
   */
  async getValidToken(clerkUser) {
    if (!clerkUser) throw new Error('No user provided');

    const userId = clerkUser.id;
    const storedData = this.getStoredToken(userId);

    // Return stored token if it's still valid
    if (this.isTokenValid(storedData)) {
      console.log('Using cached Firebase token for user:', userId);
      this.updateLastUsed(userId);
      return storedData.token;
    }

    // Get new token if not found or expired
    console.log('Getting new Firebase token for user:', userId);
    try {
      const clerkToken = await window.Clerk.session.getToken();
      const response = await fetch('http://localhost:8000/get-firebase-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clerkToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get Firebase token');
      }

      const { token } = await response.json();
      
      // Store the new token
      this.storeToken(userId, token);
      
      // Clean up old tokens periodically
      this.cleanupOldTokens();
      
      return token;
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      throw error;
    }
  }

  /**
   * Ensure Firebase authentication is ready with a valid token
   * @param {Object} clerkUser - The Clerk user object
   * @returns {Promise<Object>} Firebase user credential
   */
  async ensureAuth(clerkUser) {
    if (!clerkUser) return null;

    try {
      // Check if this is a different user than the current one
      if (this.currentUserId && this.currentUserId !== clerkUser.id) {
        console.log('Switching users, signing out current user');
        await auth.signOut();
      }

      // Update current user
      this.currentUserId = clerkUser.id;

      // Get valid token (either from cache or new)
      const token = await this.getValidToken(clerkUser);

      // Only sign in if we're not already signed in as this user
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== clerkUser.id) {
        console.log('Signing in with Firebase');
        const userCredential = await signInWithCustomToken(auth, token);

        // Verify user ID matches
        if (userCredential.user.uid !== clerkUser.id) {
          throw new Error('Authentication mismatch between Clerk and Firebase');
        }

        return userCredential.user;
      }

      return currentUser;
    } catch (error) {
      console.error('Error ensuring Firebase auth:', error);
      // Clear token on error to force refresh next time
      this.clearToken(clerkUser.id);
      throw error;
    }
  }

  /**
   * Clear stored token for a user
   * @param {string} userId 
   */
  clearToken(userId) {
    console.log('Clearing token for user:', userId);
    this.tokenStore.delete(userId);
  }

  /**
   * Clear all stored tokens
   */
  clearAllTokens() {
    console.log('Clearing all tokens');
    this.tokenStore.clear();
    this.currentUserId = null;
  }
}

// Create a singleton instance
const tokenManager = new TokenManager();

export default tokenManager; 