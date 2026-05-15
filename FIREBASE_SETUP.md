# Firebase Project Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `boston-trip-app`
4. Disable Google Analytics (optional)
5. Click **"Create project"**
6. Wait for project to be created (~1-2 minutes)

## Step 2: Get Firebase Configuration

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Under "Your apps", click **"Web"** or create a new web app
3. Copy your Firebase config (you'll see something like):
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

4. Create `.env.local` file in project root:
   ```
   cp .env.local.example .env.local
   ```

5. Fill in the values from step 3:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=boston-trip-app
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose region (e.g., `us-central1`)
4. Start in **Test Mode** (for development)
5. Click **"Create"**

**Important:** Test Mode allows unrestricted read/write. Replace with production rules before deploying.

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Enable **Email/Password** provider:
   - Click the **Email/Password** option
   - Toggle **Enable**
   - Click **Save**

## Step 5: Test Firebase Connection

After setting up `.env.local`, run:

```bash
npm run dev
```

The app should now:
- Initialize Firebase without errors
- Be ready to sign up users
- Connect to Firestore

Check browser console for any errors.

## Step 6: Setup Firebase Emulator (Local Development)

To test without using real Firebase, use the emulator:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulator in project directory
firebase emulator:start --project demo
```

The emulator UI will be available at: `http://localhost:4000`

Your app will automatically connect to the emulator in development mode.

## Firestore Security Rules (Development)

For development, use these permissive rules in Firebase Console:

**Firestore → Rules → Edit Rules:**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users full access
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish** to deploy.

**Before going to production, update to proper security rules from FIREBASE_IMPLEMENTATION.md**

## Files Created

- `src/services/firebase.ts` - Firebase initialization
- `src/services/authService.ts` - Authentication service
- `src/services/itineraryService.ts` - Itinerary CRUD operations
- `src/services/eventDataService.ts` - Event CRUD operations (Firebase)
- `src/services/travelersService.ts` - Traveler CRUD operations (Firebase)
- `.env.local.example` - Environment variables template

## Troubleshooting

### "apiKey is undefined"
**Solution:** Make sure `.env.local` is created and variables are set correctly. Restart dev server after changing env.

### "Not authenticated"
**Solution:** Services require authenticated user. Make sure user is logged in before making requests.

### "Connection refused" (Emulator)
**Solution:** Run `firebase emulator:start --project demo` in a separate terminal. App will auto-connect in dev mode.

### Missing collections in Firestore
**Solution:** Collections are created automatically when you write the first document. No need to pre-create them.

## Next Steps

1. ✅ Firebase project created
2. ✅ Services initialized
3. ⬜ Create authentication UI (LoginPage, SignupPage)
4. ⬜ Test form saves with real-time sync
5. ⬜ Setup Firestore security rules (production)
