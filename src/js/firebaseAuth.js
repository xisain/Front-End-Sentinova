import { auth } from './firebase-init';
import { onAuthStateChanged } from 'firebase/auth';
import tokenManager from '../services/tokenService';

/**
 * Waits for Firebase authentication to be ready
 * @returns {Promise<void>}
 */
export const waitForAuth = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

/**
 * Authenticates with Firebase using a Clerk user
 * @param {Object} clerkUser - The Clerk user object
 * @returns {Promise<Object>} - A promise that resolves to the Firebase user
 */
export const authenticateWithFirebase = async (clerkUser) => {
  if (!clerkUser) return null;

  try {
    // Use token manager to handle authentication
    const firebaseUser = await tokenManager.ensureAuth(clerkUser);
    
    // Wait for auth state to be ready
    await waitForAuth();
    
    return firebaseUser;
  } catch (error) {
    console.error('Error authenticating with Firebase:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}; 