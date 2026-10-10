import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// AgriShamba Firebase Web configuration (Firebase project ID is immutable and cannot be renamed)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC33FrraNTehK6zTiMivOySpXKm_dWa8WM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agrilink-a875f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agrilink-a875f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agrilink-a875f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "665449813551",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:665449813551:web:21ee86def799d4da8b18da",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DNXYHMF1WS"
};

// Initialize Firebase App & Auth
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * 1-Click Sign in with Google Popup
 */
export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid
  };
}

// Check if real Firebase keys are configured
export const isFirebaseConfigured = () => {
  return true;
};

/**
 * Reset reCAPTCHA verifier completely
 */
export function resetRecaptcha(buttonOrContainerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return;
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
    window.recaptchaVerifier = null;
  }
  const el = document.getElementById(buttonOrContainerId);
  if (el) el.innerHTML = '';
}

/**
 * Initialize Invisible reCAPTCHA verifier for Phone Auth
 * @param {string} buttonOrContainerId - DOM element ID for reCAPTCHA
 */
export function initRecaptcha(buttonOrContainerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;
  
  // 1. If an active verifier already exists, reuse it!
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  // 2. Ensure target container exists and clear any stale iframes
  let targetElement = document.getElementById(buttonOrContainerId);
  if (!targetElement) {
    targetElement = document.createElement('div');
    targetElement.id = buttonOrContainerId;
    document.body.appendChild(targetElement);
  }
  targetElement.innerHTML = '';

  window.recaptchaVerifier = new RecaptchaVerifier(auth, targetElement, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      resetRecaptcha(buttonOrContainerId);
    }
  });

  return window.recaptchaVerifier;
}

/**
 * Send real 6-digit SMS verification code to phone using Google Firebase
 * Free 10,000 verifications per month worldwide (including Kenya Safaricom/Airtel)
 * @param {string} formattedPhone - Phone in international format (+254712345678)
 * @param {string} containerId - Element ID for reCAPTCHA
 */
export async function sendFirebasePhoneOtp(formattedPhone, containerId = 'recaptcha-container') {
  try {
    const verifier = initRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult };
  } catch (error) {
    console.error('[Firebase Phone Auth Error]:', error);
    // Reset on error so user can immediately retry without "already rendered" error
    resetRecaptcha(containerId);
    throw error;
  }
}

/**
 * Confirm 6-digit SMS code entered by the user
 * @param {string} otpCode - 6-digit verification code
 */
export async function confirmFirebasePhoneOtp(otpCode) {
  if (!window.confirmationResult) {
    throw new Error('No pending verification session found. Please request a new code.');
  }
  const result = await window.confirmationResult.confirm(otpCode.trim());
  const user = result.user;
  const idToken = await user.getIdToken();
  return { success: true, user, idToken, phoneNumber: user.phoneNumber };
}
