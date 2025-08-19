import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

// Provided Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA0U--lUCnTHm3YysulbMp7fjQ92EYwHc8",
  authDomain: "skin-797ea.firebaseapp.com",
  databaseURL: "https://skin-797ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skin-797ea",
  storageBucket: "skin-797ea.appspot.com",
  messagingSenderId: "144004712892",
  appId: "1:144004712892:web:f15f4c9a7ca3ee287e83b9",
  measurementId: "G-6567QEGZTS"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (e) {
    // If rules allow public writes in dev, this can be ignored
    console.warn("Firebase anonymous sign-in failed:", e?.message);
  }
}

export async function uploadImageToFirebase(file, folder = "products") {
  try {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    await ensureAuth();

    const timestamp = Date.now();
    const safeName = file.name?.replace(/[^a-zA-Z0-9.\-_]/g, "_") || "image";
    const filePath = `${folder}/${timestamp}-${safeName}`;

    const storageRef = ref(storage, filePath);

    const snapshot = await uploadBytes(storageRef, file);

    const url = await getDownloadURL(snapshot.ref);

    return url;
  } catch (error) {
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error("Upload unauthorized. Please check Firebase Storage rules.");
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error("Storage quota exceeded. Please try again later.");
    } else if (error.code === 'storage/network-request-failed') {
      throw new Error("Network error. Please check your internet connection.");
    } else if (error.message.includes('File size too large')) {
      throw error; // Re-throw our custom error
    } else if (error.message.includes('Invalid file type')) {
      throw error; // Re-throw our custom error
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}
