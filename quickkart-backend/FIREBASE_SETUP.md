# 🔥 Firebase Storage Setup Guide

## **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `quickkart-demo` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## **Step 2: Enable Storage**

1. In your Firebase project, click "Storage" in the left sidebar
2. Click "Get started"
3. Choose security rules (start with "Start in test mode")
4. Choose location (select closest to your users)
5. Click "Done"

## **Step 3: Get Configuration**

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register app with nickname: `quickkart-backend`
6. Copy the config object

## **Step 4: Set Environment Variables**

Create a `.env` file in the `quickkart-backend` directory:

```env
# Firebase Configuration
FIREBASE_API_KEY="AIzaSyA0U--lUCnTHm3YysulbMp7fjQ92EYwHc8"
FIREBASE_AUTH_DOMAIN="skin-797ea.firebaseapp.com"
FIREBASE_PROJECT_ID=s"skin-797ea"
FIREBASE_STORAGE_BUCKET="skin-797ea.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="144004712892"
FIREBASE_APP_ID="1:144004712892:web:f15f4c9a7ca3ee287e83b9"

apiKey: "AIzaSyA0U--lUCnTHm3YysulbMp7fjQ92EYwHc8",
  authDomain: "skin-797ea.firebaseapp.com",
  databaseURL: "https://skin-797ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skin-797ea",
  storageBucket: "skin-797ea.appspot.com",
  messagingSenderId: "144004712892",
  appId: "1:144004712892:web:f15f4c9a7ca3ee287e83b9",
  measurementId: "G-6567QEGZTS"

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/quickkart

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Server Port
PORT=3000
```

## **Step 5: Update Storage Rules**

In Firebase Console > Storage > Rules, update the rules to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Anyone can read images
      allow write: if request.auth != null;  // Only authenticated users can upload
    }
  }
}
```

## **Step 6: Test the Setup**

1. Start your backend: `npm start`
2. Try uploading a product image
3. Check Firebase Console > Storage to see uploaded files

## **Benefits of Firebase Storage**

✅ **Reliable**: Google's infrastructure  
✅ **Fast**: Global CDN delivery  
✅ **Secure**: Built-in authentication  
✅ **Scalable**: Handles growth automatically  
✅ **Free Tier**: 5GB storage, 1GB/day bandwidth  

## **Troubleshooting**

- **"Failed to upload image"**: Check Firebase credentials in `.env`
- **"Permission denied"**: Update Storage rules in Firebase Console
- **"Project not found"**: Verify project ID in `.env`

## **Next Steps**

After setup, your images will be:
1. Uploaded to Firebase Storage
2. Stored with unique filenames
3. Accessible via secure URLs
4. Automatically optimized for delivery
