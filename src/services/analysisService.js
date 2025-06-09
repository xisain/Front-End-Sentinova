import { db, auth, app } from '../js/firebase-init';
import { doc, setDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import tokenManager from './tokenService';
import { api } from './api';

/**
 * Waits for Firebase authentication to be ready
 * @returns {Promise<void>}
 */
const waitForAuth = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

/**
 * Authenticates with Firebase using a Clerk token
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<void>}
 */
const authenticateWithFirebase = async (clerkUserId) => {
  // Get the current user's session token from Clerk
  const clerkToken = await window.Clerk.session.getToken();
  console.log('Got Clerk token:', clerkToken.substring(0, 20) + '...');

  // Get Firebase token
  const getToken = await api.getWithAuth('/get-firebase-token', clerkToken);

  if (!getToken.ok) {
    throw new Error(`Failed to get Firebase token: ${getToken.status}`);
  }

  const response = await getToken.json();
  if (!response.token) {
    throw new Error('No token received from server');
  }

  // Sign in to Firebase with the custom token
  await auth.signOut(); // Clear any existing auth state
  const userCredential = await signInWithCustomToken(auth, response.token);
  
  if (userCredential.user.uid !== clerkUserId) {
    throw new Error('Authentication mismatch between Clerk and Firebase');
  }

  // Wait for auth state to be ready
  await waitForAuth();
  return userCredential.user;
};

/**
 * Saves analysis data to Firestore using the structure:
 * analysis_result/{userId}/timestamps/{timestampId}
 * @param {string} clerkUserId - The Clerk user ID
 * @param {object} analysisData - The analysis data to be saved
 * @returns {Promise} - A promise that resolves when the data is saved
 */
export const saveAnalysisData = async (clerkUserId, analysisData) => {
  try {
    // Verify Firebase is initialized
    if (!app || !auth) {
      throw new Error('Firebase is not properly initialized');
    }

    // Get the current Clerk user
    const clerkUser = window.Clerk.user;
    if (!clerkUser || clerkUser.id !== clerkUserId) {
      throw new Error('User mismatch or not authenticated with Clerk');
    }

    // Ensure we're authenticated with Firebase
    await tokenManager.ensureAuth(clerkUser);

    // Generate a timestamp-based ID
    const timestamp = new Date().toISOString();
    const timestampId = timestamp.replace(/[:.]/g, '_');
    console.log('Generated timestamp ID:', timestampId);

    // Create a reference to the document using the structure that matches security rules
    console.log('Creating Firestore reference for user:', clerkUserId);
    const docRef = doc(db, 'analysis_result', clerkUserId, 'timestamps', timestampId);

    // Add timestamp and user ID to the data
    const dataToSave = {
      ...analysisData,
      timestamp,
      userId: clerkUserId
    };

    // Save the data to Firestore
    console.log('Attempting to save data to Firestore...');
    await setDoc(docRef, dataToSave);
    console.log('Successfully saved data to Firestore');
    
    return { success: true, timestampId };
  } catch (error) {
    console.error('Error saving analysis data:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Retrieves analysis history for a user from Firestore
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Array>} - A promise that resolves to an array of analysis results
 */
export const getAnalysisHistory = async (clerkUserId) => {
  try {
    // Verify Firebase is initialized
    if (!app || !auth) {
      throw new Error('Firebase is not properly initialized');
    }

    console.log('Getting analysis history for user:', clerkUserId);

    // Get the current Clerk user
    const clerkUser = window.Clerk.user;
    if (!clerkUser || clerkUser.id !== clerkUserId) {
      throw new Error('User mismatch or not authenticated with Clerk');
    }

    // Ensure we're authenticated with Firebase
    await tokenManager.ensureAuth(clerkUser);

    // Create a query to get all timestamps for the user, ordered by timestamp
    const timestampsRef = collection(db, 'analysis_result', clerkUserId, 'timestamps');
    const q = query(timestampsRef, orderBy('timestamp', 'desc'));

    // Get the documents
    console.log('Fetching documents from Firestore...');
    const querySnapshot = await getDocs(q);
    
    // Convert the documents to a more usable format
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: new Date(doc.data().timestamp) // Convert timestamp string to Date object
    }));

    console.log(`Retrieved ${history.length} analysis results for user:`, clerkUserId);
    return history;

  } catch (error) {
    console.error('Error getting analysis history:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}; 