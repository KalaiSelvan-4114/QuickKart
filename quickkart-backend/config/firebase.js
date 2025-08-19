const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Firebase configuration - Updated to match frontend
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyA0U--lUCnTHm3YysulbMp7fjQ92EYwHc8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "skin-797ea.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://skin-797ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.FIREBASE_PROJECT_ID || "skin-797ea",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "skin-797ea.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "144004712892",
  appId: process.env.FIREBASE_APP_ID || "1:144004712892:web:f15f4c9a7ca3ee287e83b9",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-6567QEGZTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Function to upload image to Firebase Storage
const uploadImage = async (file, folder = 'products') => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const safeName = file.originalname?.replace(/[^a-zA-Z0-9.\-_]/g, "_") || "image";
    const fileName = `${folder}/${timestamp}-${safeName}`;

    // Create storage reference
    const storageRef = ref(storage, fileName);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file.buffer);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    throw new Error(`Firebase upload failed: ${error.message}`);
  }
};

module.exports = { uploadImage };
