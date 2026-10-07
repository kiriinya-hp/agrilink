import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

// Firebase configuration using Vite environment variables
// Replace with your real Firebase Project keys from console.firebase.google.com
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyReplaceWithYourOwn",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agrilink-ke.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agrilink-ke",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agrilink-ke.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456"
};

// Initialize Firebase App & Auth
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Check if real Firebase keys are configured
export const isFirebaseConfigured = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
  return apiKey && !apiKey.includes("DummyKey");
};

/**
 * Initialize Invisible reCAPTCHA verifier for Phone Auth
 * @param {string} buttonOrContainerId - DOM element ID for reCAPTCHA
 */
export function initRecaptcha(buttonOrContainerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;
  
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonOrContainerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - will proceed with submit
      },
      'expired-callback': () => {
        // Reset reCAPTCHA on expiration
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    });
  }
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
    // Reset reCAPTCHA on error so user can retry
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      window.recaptchaVerifier = null;
    }
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
