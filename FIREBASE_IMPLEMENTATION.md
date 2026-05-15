# Firebase Integration Guide

## Setup Instructions

### 1. Create Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project (or use existing)
firebase projects:create boston-trip-app --region=us-central1
```

### 2. Install Firebase Dependencies

```bash
npm install firebase
npm install -D @react-query/firebase  # Optional: for query caching
```

### 3. Initialize Firebase in Project

Create `src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### 4. Environment Variables

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=boston-trip-app
VITE_FIREBASE_STORAGE_BUCKET=boston-trip-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Configure Firestore Database

```bash
# Create Firestore database (use native mode, US region)
firebase firestore:create
```

---

## Firestore Security Rules

### development.rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads/writes for development
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

### production.rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isItineraryMember(itineraryId) {
      let itinerary = get(/databases/$(database)/documents/itineraries/$(itineraryId));
      return request.auth.uid == itinerary.data.ownerId ||
             request.auth.uid in itinerary.data.members;
    }

    function isItineraryOrganizer(itineraryId) {
      let itinerary = get(/databases/$(database)/documents/itineraries/$(itineraryId));
      return request.auth.uid == itinerary.data.ownerId;
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Itineraries
    match /itineraries/{itineraryId} {
      allow read: if isItineraryMember(itineraryId);
      allow create: if isAuthenticated() && 
                       request.resource.data.ownerId == request.auth.uid;
      allow update: if isItineraryOrganizer(itineraryId);
      allow delete: if isItineraryOrganizer(itineraryId);

      // Sub-collections inherit parent security
      match /days/{dayId} {
        allow read, write: if isItineraryMember(itineraryId);
        
        match /activities/{activityId} {
          allow read, write: if isItineraryMember(itineraryId);
        }
      }

      match /events/{eventId} {
        allow read, write: if isItineraryMember(itineraryId);
      }

      match /travelers/{travelerId} {
        allow read, write: if isItineraryMember(itineraryId);
      }
    }

    // Audit logs (read-only for members)
    match /changes/{changeId} {
      allow read: if isItineraryMember(resource.data.itineraryId);
      allow write: if false;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules --project boston-trip-app
```

---

## Service Layer Implementation

### `src/services/authService.ts`

```typescript
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, setDoc } from 'firebase/firestore'

export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', credential.user.uid), {
      email,
      displayName,
      createdAt: new Date(),
      lastActive: new Date(),
    })
    
    return credential.user
  },

  async signIn(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  },

  async logout() {
    await signOut(auth)
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  getCurrentUser() {
    return auth.currentUser
  },
}
```

### `src/services/itineraryService.ts`

```typescript
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { Itinerary } from '../types'

export const itineraryService = {
  async createItinerary(itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const ref = doc(collection(db, 'itineraries'))
    const newItinerary = {
      ...itinerary,
      ownerId: userId,
      members: [userId],
      createdAt: new Date(),
      updatedAt: new Date(),
      _version: 1,
      _lastEditedBy: userId,
    }
    
    await setDoc(ref, newItinerary)
    return ref.id
  },

  async getItinerary(itineraryId: string): Promise<Itinerary | null> {
    const ref = doc(db, 'itineraries', itineraryId)
    const snapshot = await getDoc(ref)
    
    if (!snapshot.exists()) return null
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Itinerary
  },

  async updateItinerary(itineraryId: string, updates: Partial<Itinerary>) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const ref = doc(db, 'itineraries', itineraryId)
    
    // Include version for optimistic concurrency control
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
      _lastEditedBy: userId,
      _version: (await getDoc(ref)).data()?._version + 1 || 1,
    })
  },

  async deleteItinerary(itineraryId: string) {
    const ref = doc(db, 'itineraries', itineraryId)
    await deleteDoc(ref)
  },

  async listUserItineraries(): Promise<Itinerary[]> {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const constraints: QueryConstraint[] = [
      where('ownerId', '==', userId),
    ]
    
    const q = query(collection(db, 'itineraries'), ...constraints)
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Itinerary[]
  },

  subscribeToItinerary(itineraryId: string, callback: (itinerary: Itinerary | null) => void) {
    const ref = doc(db, 'itineraries', itineraryId)
    return onSnapshot(ref, snapshot => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        } as Itinerary)
      } else {
        callback(null)
      }
    })
  },

  subscribeToItineraries(callback: (itineraries: Itinerary[]) => void) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const q = query(collection(db, 'itineraries'), where('ownerId', '==', userId))
    return onSnapshot(q, snapshot => {
      const itineraries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Itinerary[]
      callback(itineraries)
    })
  },
}
```

### `src/services/eventDataService.ts` (Updated)

```typescript
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { Event } from '../types'

export const eventDataService = {
  async createEvent(itineraryId: string, event: Omit<Event, 'id'>) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const eventsRef = collection(db, `itineraries/${itineraryId}/events`)
    const ref = await addDoc(eventsRef, {
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
      _version: 1,
      _lastEditedBy: userId,
    })
    
    return ref.id
  },

  async updateEvent(itineraryId: string, eventId: string, updates: Partial<Event>) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const ref = doc(db, `itineraries/${itineraryId}/events`, eventId)
    
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
      _lastEditedBy: userId,
    })
  },

  async deleteEvent(itineraryId: string, eventId: string) {
    const ref = doc(db, `itineraries/${itineraryId}/events`, eventId)
    await deleteDoc(ref)
  },

  async getEvents(itineraryId: string): Promise<Event[]> {
    const eventsRef = collection(db, `itineraries/${itineraryId}/events`)
    const snapshot = await getDocs(eventsRef)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[]
  },

  subscribeToEvents(itineraryId: string, callback: (events: Event[]) => void) {
    const eventsRef = collection(db, `itineraries/${itineraryId}/events`)
    return onSnapshot(eventsRef, snapshot => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[]
      callback(events)
    })
  },
}
```

### `src/services/travelersService.ts` (Updated)

```typescript
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { Traveler } from '../types'

export const travelersService = {
  async createTraveler(itineraryId: string, traveler: Omit<Traveler, 'id'>) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const travelersRef = collection(db, `itineraries/${itineraryId}/travelers`)
    const ref = await addDoc(travelersRef, {
      ...traveler,
      createdAt: new Date(),
      updatedAt: new Date(),
      _version: 1,
      _lastEditedBy: userId,
    })
    
    return ref.id
  },

  async updateTraveler(itineraryId: string, travelerId: string, updates: Partial<Traveler>) {
    const userId = auth.currentUser?.uid
    if (!userId) throw new Error('Not authenticated')

    const ref = doc(db, `itineraries/${itineraryId}/travelers`, travelerId)
    
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
      _lastEditedBy: userId,
    })
  },

  async deleteTraveler(itineraryId: string, travelerId: string) {
    const ref = doc(db, `itineraries/${itineraryId}/travelers`, travelerId)
    await deleteDoc(ref)
  },

  async getTravelers(itineraryId: string): Promise<Traveler[]> {
    const travelersRef = collection(db, `itineraries/${itineraryId}/travelers`)
    const snapshot = await getDocs(travelersRef)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Traveler[]
  },

  subscribeTravelers(itineraryId: string, callback: (travelers: Traveler[]) => void) {
    const travelersRef = collection(db, `itineraries/${itineraryId}/travelers`)
    return onSnapshot(travelersRef, snapshot => {
      const travelers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Traveler[]
      callback(travelers)
    })
  },
}
```

---

## Firebase Emulator for Local Development

### Setup

```bash
# Install emulator
firebase emulator:start --project demo

# In another terminal, run your React app
npm run dev
```

### Configuration for Development

Update `src/services/firebase.ts`:

```typescript
import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'

if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
  } catch (e) {
    // Already initialized
  }
}
```

### Emulator UI

Access at `http://localhost:4000` to view and manage emulator data.

---

## Testing with Firebase Emulator

### Vitest Setup

Create `src/test/firebaseSetup.ts`:

```typescript
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

let testEnv: any

export async function setupFirebaseEmulator() {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: fs.readFileSync('./firestore.rules', 'utf-8'),
    },
  })
  return testEnv
}

export async function cleanupFirebaseEmulator() {
  await testEnv?.cleanup()
}

export function getTestDb() {
  return testEnv.unauthenticatedContext().firestore()
}

export function getAuthenticatedTestDb(uid: string) {
  return testEnv.authenticatedContext(uid).firestore()
}
```

### Example Test

```typescript
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { setupFirebaseEmulator, cleanupFirebaseEmulator, getAuthenticatedTestDb } from './firebaseSetup'
import { itineraryService } from '../services/itineraryService'

describe('itineraryService', () => {
  beforeAll(async () => {
    await setupFirebaseEmulator()
  })

  afterAll(async () => {
    await cleanupFirebaseEmulator()
  })

  it('should create an itinerary', async () => {
    const db = getAuthenticatedTestDb('test-user')
    // ... test logic
  })
})
```

---

## Deployment

### Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting --project boston-trip-app
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: boston-trip-app
          channelId: live
```

### Generate Service Account Key

```bash
firebase projects:list
# Select project
firebase init
# Choose Authentication and Hosting
# Download service account key from Firebase Console
# Add to GitHub Secrets as FIREBASE_SERVICE_ACCOUNT
```

---

## Monitoring & Debugging

### Firebase Console

- **Authentication:** View user signups, login analytics
- **Firestore:** Monitor database usage, query performance
- **Cloud Functions:** View logs and error rates
- **Performance:** Track app startup time, network latency
- **Crashlytics:** Aggregate crash reports (requires SDK)

### Local Logging

```typescript
// In services, log important operations
console.log('[FirebaseService]', 'Updating event:', eventId, updates)

// Use Firebase Emulator UI for inspection
// http://localhost:4000
```

---

## Common Issues & Solutions

### Issue: CORS Error on localhost
**Solution:** Use Firebase Emulator for local development

### Issue: Auth State Not Persisting
**Solution:** Add to `src/App.tsx`:
```typescript
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { useAppStore } from './store/appStore'

export function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      useAppStore.setState({ currentUser: user })
    })
    return unsubscribe
  }, [])
  // ...
}
```

### Issue: Real-time Updates Not Firing
**Solution:** Check Firestore rules allow reads, verify query filters match data

### Issue: Slow Queries on Large Collections
**Solution:** Create composite indexes in Firestore Console or use collection partitioning

---

## Performance Tips

1. **Batch Writes:** Combine multiple updates
2. **Query Optimization:** Add indexes for frequently queried fields
3. **Caching:** Use local state for frequently accessed data
4. **Pagination:** Fetch data in chunks for large collections
5. **Denormalization:** Duplicate data for query efficiency (when acceptable)

---

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase React Guide](https://firebase.google.com/docs/web/setup)
