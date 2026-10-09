// =============================================================================
// GOOGLE FIREBASE CONFIGURATION FOR REAL-TIME WISHES
// Project: marriage-wishes-03
// =============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDhVv7MuJl_-3W3ZdSKZY1QKIgqjMTVF04",
  authDomain: "marriage-wishes-03.firebaseapp.com",
  databaseURL: "https://marriage-wishes-03-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "marriage-wishes-03",
  storageBucket: "marriage-wishes-03.firebasestorage.app",
  messagingSenderId: "1066370818387",
  appId: "1:1066370818387:web:bf714b027adcf7fd1bc1a6"
};

// Initialize Firebase Realtime Database
let firebaseApp = null;
let realtimeDB = null;

try {
  if (typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    realtimeDB = firebase.database();
    console.log("🔥 Google Firebase Realtime Database connected successfully for marriage-wishes-03!");
  } else {
    console.warn("⚠️ Firebase SDK not found on page.");
  }
} catch (error) {
  console.warn("⚠️ Firebase initialization notice:", error);
}

// Global accessor for application
window.weddingFirebase = {
  app: firebaseApp,
  db: realtimeDB,
  isLive: !!realtimeDB,
  config: firebaseConfig
};
