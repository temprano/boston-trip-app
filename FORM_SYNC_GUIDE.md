# Form Edits & Real-time Sync Implementation Guide

## Overview

This document provides step-by-step instructions to implement form editing with real-time synchronization to all users.

### Current State
- ❌ No backend persistence
- ❌ No real-time sync
- ❌ Form edits only saved to localStorage
- ❌ No multi-user collaboration

### Target State  
- ✅ Forms persist to Firebase Firestore
- ✅ All users see changes in real-time
- ✅ Conflicts resolved automatically (Last-Write-Wins)
- ✅ Offline edits queued and synced on reconnect

---

## Step 1: Setup Firebase & Authentication

### 1.1 Initialize Firebase Project

```bash
# Create Firebase project
firebase projects:create boston-trip-app

# Configure Firestore
firebase firestore:create --project boston-trip-app
```

### 1.2 Install & Configure Firebase SDK

```bash
npm install firebase
```

Create `src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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

// Enable emulator in development
if (import.meta.env.DEV) {
  try {
    import('firebase/auth').then(({ connectAuthEmulator }) => {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    })
    import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
      connectFirestoreEmulator(db, 'localhost', 8080)
    })
  } catch (e) {
    // Already initialized
  }
}
```

### 1.3 Create Authentication Service

Create `src/services/authService.ts`:

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
    
    // Create user profile
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

### 1.4 Add Environment Variables

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=boston-trip-app
VITE_FIREBASE_STORAGE_BUCKET=boston-trip-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Step 2: Update Data Services for Firebase

### 2.1 Update Event Data Service

Modify `src/services/eventDataService.ts`:

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

### 2.2 Create Travelers Service

Create `src/services/travelersService.ts`:

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

### 2.3 Create Itinerary Service

Create `src/services/itineraryService.ts`:

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
    
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
      _lastEditedBy: userId,
    })
  },

  subscribeToItinerary(itineraryId: string, callback: (itinerary: Itinerary | null) => void) {
    const ref = doc(db, 'itineraries', itineraryId)
    return onSnapshot(ref, snapshot => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        } as Itinerary)
      }
    })
  },
}
```

---

## Step 3: Update Components for Form Sync

### 3.1 Update EditEventForm

Modify `src/components/EditEventForm.tsx` to call Firebase:

```typescript
import { useState, useEffect } from 'react'
import { Event } from '../types'
import { eventDataService } from '../services/eventDataService'

interface EditEventFormProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  itineraryId: string
}

export function EditEventForm({ event, isOpen, onClose, itineraryId }: EditEventFormProps) {
  const [formData, setFormData] = useState<Event>(event)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData(event)
      setError(null)
    }
  }, [event, isOpen])

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSave = async () => {
    try {
      setError(null)
      setIsSaving(true)
      
      // Validate
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }

      // Call Firebase service
      await eventDataService.updateEvent(itineraryId, event.id, formData)
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div onClick={onClose} style={{ /* modal styles */ }}>
      <div onClick={e => e.stopPropagation()} style={{ /* content styles */ }}>
        {/* Form content */}
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    </div>
  )
}
```

### 3.2 Update TravelerEditForm

Modify `src/components/TravelerEditForm.tsx` to call Firebase:

```typescript
import { useState } from 'react'
import { Traveler } from '../types'
import { travelersService } from '../services/travelersService'
import { X } from 'lucide-react'

interface TravelerEditFormProps {
  traveler: Traveler
  itineraryId: string
  onSave: (traveler: Traveler) => void
  onCancel: () => void
}

export function TravelerEditForm({ traveler, itineraryId, onSave, onCancel }: TravelerEditFormProps) {
  const [formData, setFormData] = useState<Traveler>(traveler)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setError(null)
      setIsSaving(true)
      
      // Call Firebase service
      await travelersService.updateTraveler(itineraryId, traveler.id, formData)
      
      onSave(formData)
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save traveler')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Traveler, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div onClick={onCancel} style={{ /* modal styles */ }}>
      <div onClick={e => e.stopPropagation()} style={{ /* content styles */ }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Edit {formData.name}</h2>
          <button onClick={onCancel} style={{ border: 'none', background: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Form fields */}
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
```

---

## Step 4: Setup Real-time Listeners

### 4.1 Update App.tsx to Setup Listeners

Modify `src/App.tsx` to subscribe to real-time updates:

```typescript
import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { eventDataService } from './services/eventDataService'
import { travelersService } from './services/travelersService'

export function App() {
  const currentItinerary = useAppStore(state => state.currentItinerary)
  const setEvents = useAppStore(state => state.setEvents) // Add to store
  const setTravelers = useAppStore(state => state.setTravelers)

  useEffect(() => {
    if (!currentItinerary?.id) return

    // Subscribe to events
    const unsubscribeEvents = eventDataService.subscribeToEvents(
      currentItinerary.id,
      (events) => setEvents(events)
    )

    // Subscribe to travelers
    const unsubscribeTravelers = travelersService.subscribeTravelers(
      currentItinerary.id,
      (travelers) => setTravelers(travelers)
    )

    return () => {
      unsubscribeEvents()
      unsubscribeTravelers()
    }
  }, [currentItinerary?.id])

  // ... rest of component
}
```

### 4.2 Update Zustand Store

Modify `src/store/appStore.ts` to add event storage:

```typescript
import { create } from 'zustand'
import { Event, Traveler, Itinerary } from '../types'

export interface AppStore {
  // ... existing
  events: Event[]
  setEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  removeEvent: (id: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  // ... existing
  events: [],
  
  setEvents: (events) => set({ events }),
  
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
}))
```

---

## Step 5: Deploy Firestore Security Rules

### 5.1 Create Security Rules

Create or update `firestore.rules`:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isItineraryMember(itineraryId) {
      let itinerary = get(/databases/$(database)/documents/itineraries/$(itineraryId));
      return request.auth.uid == itinerary.data.ownerId ||
             request.auth.uid in itinerary.data.members;
    }

    // Allow read/write for users' own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Allow read/write for itinerary members
    match /itineraries/{itineraryId} {
      allow read: if isItineraryMember(itineraryId);
      allow write: if isItineraryMember(itineraryId);

      // Events, travelers, days inherit permissions
      match /events/{eventId} {
        allow read, write: if isItineraryMember(itineraryId);
      }

      match /travelers/{travelerId} {
        allow read, write: if isItineraryMember(itineraryId);
      }

      match /days/{dayId} {
        allow read, write: if isItineraryMember(itineraryId);
        
        match /activities/{activityId} {
          allow read, write: if isItineraryMember(itineraryId);
        }
      }
    }
  }
}
```

### 5.2 Deploy Rules

```bash
firebase deploy --only firestore:rules --project boston-trip-app
```

---

## Step 6: Testing Real-time Sync

### 6.1 Manual Testing

1. Open app in two browser tabs
2. Login with same user account
3. Edit an event in Tab 1
4. Observe change appears in Tab 2 within 1-2 seconds

### 6.2 Test Scenarios

- [ ] Edit event → appears on other users' screens
- [ ] Edit traveler → appears on other users' screens
- [ ] Concurrent edits → Last-Write-Wins
- [ ] Offline edit → syncs when back online
- [ ] Rapid edits → debounced correctly
- [ ] Error editing → user sees error message
- [ ] Unauthorized edit → rejected by security rules

### 6.3 Vitest Tests

Create `src/services/eventDataService.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { eventDataService } from './eventDataService'

describe('eventDataService', () => {
  const itineraryId = 'test-itinerary'
  const testEvent = {
    title: 'Test Event',
    venue: 'Test Venue',
    date: '2024-05-14',
    time: '10:00',
    phone: '555-1234',
    address: { line1: '123 Main St', line2: '' },
    eventImage: '',
  }

  beforeAll(async () => {
    // Setup Firebase emulator if needed
  })

  afterAll(async () => {
    // Cleanup
  })

  it('should create an event', async () => {
    const eventId = await eventDataService.createEvent(itineraryId, testEvent)
    expect(eventId).toBeDefined()
  })

  it('should update an event', async () => {
    const eventId = await eventDataService.createEvent(itineraryId, testEvent)
    await eventDataService.updateEvent(itineraryId, eventId, {
      title: 'Updated Title',
    })
    // Verify update in Firestore
  })

  it('should subscribe to events', (done) => {
    eventDataService.subscribeToEvents(itineraryId, (events) => {
      expect(Array.isArray(events)).toBe(true)
      done()
    })
  })
})
```

---

## Common Issues & Troubleshooting

### Issue: "Not authenticated" Error
**Cause:** User not logged in  
**Solution:** Ensure user is authenticated before making service calls

### Issue: Real-time Updates Not Appearing
**Cause:** Listener not set up or Firestore rules blocking reads  
**Solution:** Check browser console, verify security rules allow reads

### Issue: Form Changes Appear Then Disappear
**Cause:** Version conflict or permission issue  
**Solution:** Check Firestore security rules, verify user has write permission

### Issue: Slow Sync Performance
**Cause:** Large data sets, missing indexes  
**Solution:** Add Firestore indexes, implement pagination, cache data locally

---

## Next Steps

1. **Complete Steps 1-6** above
2. **Test real-time sync** with multiple users
3. **Implement offline queuing** (Phase 11)
4. **Add conflict UI** for rejected edits
5. **Performance testing** with load simulator
6. **Security audit** of Firestore rules

---

## Reference Files

- `BACKEND_ARCHITECTURE.md` - Full architecture overview
- `FIREBASE_IMPLEMENTATION.md` - Complete Firebase integration guide
- `TODO.md` - Updated development checklist
