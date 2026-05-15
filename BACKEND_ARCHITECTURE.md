# Backend Architecture & Firebase Integration

## Current State Assessment

### ✅ Existing Frontend Infrastructure
- **Edit Forms:** `EditEventForm.tsx` & `TravelerEditForm.tsx` with local state management
- **State Management:** Zustand store with actions for `updateTraveler`, `updateItinerary`
- **Data Sync Service:** Currently disabled (localStorage only, CORS issues)
- **Data Models:** Well-defined types for `Event`, `Traveler`, `Activity`, `Itinerary`, `Day`

### ❌ Current Limitations
- **No Backend:** All data persisted to localStorage only
- **No Real-time Sync:** No multi-user synchronization capability
- **No Conflict Resolution:** No handling of concurrent edits
- **No Audit Trail:** No change history or user attribution
- **No Authentication:** No user identification or access control

---

## Backend Requirements

### 1. **Data Persistence Layer**
- Store Itineraries, Events, Travelers, Activities, and Days
- Support versioning/timestamps for conflict detection
- Soft deletes for data recovery
- Audit logs for tracking changes

### 2. **Real-time Synchronization**
- Publish changes to connected users in real-time
- Handle offline edits and sync on reconnect
- Conflict resolution strategy (Last-Write-Wins, CRDT, or Operational Transform)
- Debounce/batch updates to prevent spam

### 3. **Authentication & Authorization**
- User registration/login with email/password or OAuth
- Role-based access (organizer can edit, guests may have read-only or limited edit)
- Trip membership/invitation system
- Ownership verification before allowing updates

### 4. **API Endpoints**

#### Itinerary Management
```
POST   /api/itineraries              # Create new itinerary
GET    /api/itineraries/:id          # Get single itinerary with all data
PUT    /api/itineraries/:id          # Update itinerary metadata
DELETE /api/itineraries/:id          # Archive/delete itinerary
GET    /api/itineraries              # List user's itineraries
```

#### Event Management
```
POST   /api/itineraries/:id/events          # Create event
PUT    /api/itineraries/:id/events/:eventId # Update event (form save)
DELETE /api/itineraries/:id/events/:eventId # Delete event
GET    /api/itineraries/:id/events          # List all events for itinerary
```

#### Traveler Management
```
POST   /api/itineraries/:id/travelers          # Add traveler to trip
PUT    /api/itineraries/:id/travelers/:travelerId # Update traveler (form save)
DELETE /api/itineraries/:id/travelers/:travelerId # Remove traveler
GET    /api/itineraries/:id/travelers            # List all travelers
```

#### Activity Management
```
POST   /api/itineraries/:id/days/:dayId/activities        # Create activity
PUT    /api/itineraries/:id/days/:dayId/activities/:actId # Update activity
DELETE /api/itineraries/:id/days/:dayId/activities/:actId # Delete activity
```

#### Real-time Events (WebSocket)
```
WS /api/sync/:itineraryId
  - on:connect      → Send initial state
  - on:change       → Receive remote updates
  - on:error        → Handle sync failures
  - emit:update     → Send local changes
```

---

## Implementation Architecture with Firebase

### Option A: Firebase Realtime Database + Cloud Functions ✅ **RECOMMENDED**
- **Pros:** Real-time sync built-in, scales automatically, minimal backend code
- **Cons:** Less control over business logic, vendor lock-in
- **Best For:** MVP with rapid scaling needs

**Services:**
- Firebase Realtime Database (or Firestore) for data storage
- Firebase Authentication for user management
- Cloud Functions for API endpoints and business logic
- Firebase Hosting for backend functions

### Option B: Firebase + Custom Backend (Node.js + Express)
- **Pros:** Full control, can add complex logic, flexible auth
- **Cons:** More maintenance, hosting costs
- **Best For:** Enterprise features, custom workflows

**Services:**
- Firebase for authentication only
- Node.js/Express for API
- PostgreSQL/MongoDB for persistence
- Socket.io for real-time sync

### Option C: Firestore with Real-time Listeners (Hybrid)
- **Pros:** Firestore handles sync, minimal code, real-time out of box
- **Cons:** Requires client-side Firestore SDK, limited offline support
- **Best For:** Lean teams, cloud-first approach

---

## Data Model: Firebase Structure

### Firestore Collections

```
/users/:userId
  ├── email: string
  ├── name: string
  ├── avatar: string
  ├── createdAt: timestamp
  └── lastActive: timestamp

/itineraries/:itineraryId
  ├── title: string
  ├── description: string
  ├── startDate: string
  ├── endDate: string
  ├── ownerId: string (userId)
  ├── members: array<userId>
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  ├── _version: number (for conflict resolution)
  └── _lastEditedBy: string (userId)

/itineraries/:itineraryId/days/:dayId
  ├── date: string
  ├── dayOfWeek: string
  ├── notes: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── _version: number

/itineraries/:itineraryId/days/:dayId/activities/:activityId
  ├── title: string
  ├── description: string
  ├── time: string
  ├── duration: number
  ├── location: { lat, lng, name, address }
  ├── category: enum
  ├── notes: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── _version: number

/itineraries/:itineraryId/events/:eventId
  ├── title: string
  ├── venue: string
  ├── date: string
  ├── time: string
  ├── phone: string
  ├── address: { line1, line2 }
  ├── eventImage: string
  ├── category: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── _version: number

/itineraries/:itineraryId/travelers/:travelerId
  ├── name: string
  ├── avatar: string
  ├── contact: { email, phone, address }
  ├── flightInfo: { arrivalAirline, ... }
  ├── bio: string
  ├── role: enum (organizer | guest)
  ├── dietaryRestrictions: array<string>
  ├── notes: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── _version: number

/changes/:changeId (audit log)
  ├── itineraryId: string
  ├── entityType: enum (event | traveler | activity | day | itinerary)
  ├── entityId: string
  ├── operation: enum (create | update | delete)
  ├── userId: string
  ├── oldValue: object
  ├── newValue: object
  ├── timestamp: timestamp
  └── syncStatus: enum (pending | synced)
```

---

## Frontend Changes Required

### 1. **Service Layer Updates**
```typescript
// src/services/firebaseService.ts (NEW)
- initializeFirebase()
- signUp(email, password)
- login(email, password)
- logout()

// src/services/itineraryService.ts (NEW)
- fetchItinerary(itineraryId): Promise<Itinerary>
- createItinerary(data): Promise<string>
- updateItinerary(id, updates): Promise<void>
- subscribeToItinerary(id, callback): unsubscribe

// src/services/eventDataService.ts (UPDATE)
- createEvent(itineraryId, event): Promise<string>
- updateEvent(itineraryId, eventId, updates): Promise<void>
  - Remove localStorage, call Firebase
- deleteEvent(itineraryId, eventId): Promise<void>
- subscribeToEvents(itineraryId, callback): unsubscribe

// src/services/localTravelersDataService.ts (RENAME → travelersService.ts)
- updateTraveler(itineraryId, travelerId, updates): Promise<void>
- createTraveler(itineraryId, traveler): Promise<string>
- deleteTraveler(itineraryId, travelerId): Promise<void>
- subscribeTravelers(itineraryId, callback): unsubscribe
```

### 2. **Store Updates**
```typescript
// src/store/appStore.ts (UPDATE)
- Add loading/error states for async operations
- Add syncStatus: 'syncing' | 'synced' | 'error'
- Add lastSyncTime: timestamp
- Update setters to be async with Firebase calls
- Add listeners for real-time updates
```

### 3. **Component Updates**
```typescript
// EditEventForm.tsx - UPDATE onSave callback
- Call firebaseEventService.updateEvent() instead of local
- Show loading state during sync
- Display conflict resolution UI if needed

// TravelerEditForm.tsx - UPDATE onSave callback
- Call firebaseTravelersService.updateTraveler()
- Show loading state during sync

// EventCard.tsx, ActivityItem.tsx - ADD real-time listeners
- Subscribe to document changes
- Auto-update when remote changes detected
```

### 4. **Authentication Flow (NEW)**
```typescript
// src/pages/LoginPage.tsx
// src/pages/SignupPage.tsx
// src/contexts/AuthContext.tsx
- Manage current user auth state
- Handle login/logout
- Persist auth token to localStorage
```

---

## Conflict Resolution Strategy

### Recommended: **Last-Write-Wins (LWW) + Versioning**
1. Each document has `_version` and `_lastEditedBy` fields
2. When updating, include current version
3. If versions don't match: reject update, fetch latest, re-apply changes
4. UI shows notification if local change was rejected

```typescript
// Example update flow
async updateEvent(itineraryId: string, eventId: string, updates: Partial<Event>) {
  const current = await fetchEvent(itineraryId, eventId)
  
  try {
    await firestore.update({
      ...updates,
      _version: current._version + 1,
      _lastEditedBy: currentUserId,
      updatedAt: now()
    })
  } catch (e) {
    if (e.code === 'CONFLICT') {
      // Show user the conflict, ask to overwrite or discard
      showConflictUI(current, updates)
    }
  }
}
```

---

## Implementation Phases

### Phase 1: Firebase Setup & Auth (Week 1)
- [ ] Create Firebase project
- [ ] Configure Firestore database rules
- [ ] Implement Firebase Authentication
- [ ] Create LoginPage & SignupPage
- [ ] Setup auth persistence in Zustand

### Phase 2: Core Data Services (Week 2)
- [ ] Build firebaseService wrapper
- [ ] Implement itineraryService with read/write
- [ ] Implement eventDataService with Firebase
- [ ] Implement travelersService with Firebase
- [ ] Add offline detection & queuing

### Phase 3: Real-time Sync (Week 3)
- [ ] Setup Firestore listeners in services
- [ ] Update store to accept real-time updates
- [ ] Handle version conflicts with UI
- [ ] Add sync status indicators to components
- [ ] Test concurrent editing scenarios

### Phase 4: Multi-user Features (Week 4)
- [ ] Implement trip invitations/membership
- [ ] Add role-based permissions
- [ ] Build audit log viewer
- [ ] Setup Firestore security rules
- [ ] Add activity feed/changelog

### Phase 5: Optimization & Polish (Week 5)
- [ ] Implement data caching strategy
- [ ] Add offline-first queuing
- [ ] Performance monitoring
- [ ] Error handling & retry logic
- [ ] User notifications for sync events

---

## Security Considerations

### Firestore Security Rules
```
// Only authenticated users can read/write their trips
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Itineraries: owner + members can read/write
    match /itineraries/{itineraryId} {
      allow read: if isOwnerOrMember(resource.data);
      allow write: if isOwnerOrMember(resource.data) && 
                      isOrganizerRole(resource.data);
      
      // All sub-collections inherit parent permissions
      match /{document=**} {
        allow read, write: if isOwnerOrMember(
          get(/databases/$(database)/documents/itineraries/$(itineraryId)).data
        );
      }
    }
  }
}
```

### Data Validation
- Client-side: React Hook Form or similar
- Server-side: Firestore validation + Cloud Functions
- Rate limiting: Prevent spam updates
- Input sanitization: No XSS/injection attacks

---

## Testing Strategy

### Unit Tests
- Service layer: Mock Firebase calls
- Store: Test state updates with sync operations
- Components: Test form submissions with mocked async

### Integration Tests
- Firebase Emulator for local testing
- Multi-user scenarios: Simulate concurrent edits
- Offline/online transitions
- Conflict resolution flows

### E2E Tests
- Login → Create trip → Edit event → Real-time sync
- Multi-user editing flow
- Offline edits sync on reconnect

---

## Performance Considerations

1. **Lazy Loading:** Only fetch trip data on demand
2. **Pagination:** Limit results for large lists
3. **Caching:** Local cache of frequently accessed data
4. **Debouncing:** Form changes debounced before save
5. **Selective Sync:** Only listen to relevant documents
6. **Batch Writes:** Group multiple updates into single transaction

---

## Deployment

### Backend (Cloud Functions / Hosting)
```
firebase deploy --only functions,hosting
```

### Frontend
```
npm run build
firebase deploy --only hosting
```

### Environment Variables
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

---

## Next Steps

1. **Review this plan** with team
2. **Choose implementation option** (Firebase recommended)
3. **Start Phase 1:** Firebase setup & authentication
4. **Create detailed specs** for each service layer
5. **Setup Firebase Emulator** for local development
