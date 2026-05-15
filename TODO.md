# Development Checklist

## Phase 1: Project Setup & Configuration
- [ ] Initialize Vite project with React + TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure Vitest + React Testing Library
- [ ] Install `vite-plugin-pwa` for PWA support
- [ ] Create `.env` structure for API keys
- [ ] Verify basic test runner works (Hello World test)

## Phase 2: Data Models & Mocking
- [ ] Define TypeScript interfaces for:
  - [ ] `Itinerary` (Days, Activities, Location)
  - [ ] `Traveler` (Bio, Contact, FlightInfo)
  - [ ] `WeatherData`
- [ ] Create `src/data/mockData.ts` with rich sample data
- [ ] Create `src/services/mockDataService.ts` to provide data to components

## Phase 3: Core UI Components (Mock Data Only)
*Goal: Build the visual layout without real APIs.*
- [ ] **TravelersSection:** 
  - [ ] Test: Renders traveler list with bios
  - [ ] Test: Accordion expands/collapses
- [ ] **DayView Component:**
  - [ ] Test: Renders correct date header
  - [ ] Test: Shows "No Activities" state
- [ ] **ActivityItem Component:**
  - [ ] Test: Displays time, title, and location
  - [ ] Test: Toggles map preview visibility

## Phase 4: External Integrations (TDD with MSW)
*Goal: Wire up real APIs.*
- [ ] **Weather Service:**
  - [ ] Mock OpenWeatherMap API responses with MSW
  - [ ] Test: Service fetches and parses weather for a lat/lng
  - [ ] Test: Weather widget displays correct icon/temp
- [ ] **Map Service:**
  - [ ] Mock Google Maps Loader
  - [ ] Test: Map initializes with correct center coords
  - [ ] Test: "Nearby Places" search triggers marker creation
  - [ ] Test: Transit info panel populates from Directions API

## Phase 5: PWA & Offline Features
- [ ] Configure `vite-plugin-pwa` manifest (icons, theme colors)
- [ ] Test: App installs to home screen
- [ ] Test: Service Worker caches the App Shell
- [ ] Test: Itinerary loads from cache when offline

## Phase 6: Firebase Setup & Authentication
- [ ] Create Firebase project and Firestore database
- [ ] Install Firebase SDK (`npm install firebase`)
- [ ] Create `src/services/firebase.ts` with Firebase initialization
- [ ] Add Firebase environment variables to `.env.local`
- [ ] Create `src/services/authService.ts` for auth operations
- [ ] Create LoginPage with email/password form
- [ ] Create SignupPage with registration flow
- [ ] Create AuthContext/AuthProvider for auth state management
- [ ] Add auth persistence to localStorage
- [ ] Setup Firebase Emulator for local development
- [ ] Test: User can sign up and log in
- [ ] Test: Auth state persists on page reload

## Phase 7: Firestore Data Services & CRUD Operations
- [ ] Deploy Firestore security rules (development)
- [ ] Create `src/services/itineraryService.ts` with create/read/update/delete
- [ ] Update `src/services/eventDataService.ts` to use Firebase instead of localStorage
- [ ] Create/Update `src/services/travelersService.ts` for traveler CRUD
- [ ] Create `src/services/activityService.ts` for activity CRUD (nested in days)
- [ ] Test: Can create new itinerary
- [ ] Test: Can fetch existing itinerary with all nested data
- [ ] Test: Can update event from form submission
- [ ] Test: Can update traveler from form submission
- [ ] Test: Can delete entities (events, travelers, activities)
- [ ] Implement error handling and user feedback

## Phase 8: Real-time Synchronization
- [ ] Add Firestore listeners to `itineraryService` (`subscribeToItinerary`, `subscribeToItineraries`)
- [ ] Add Firestore listeners to event service (`subscribeToEvents`)
- [ ] Add Firestore listeners to traveler service (`subscribeTravelers`)
- [ ] Update Zustand store to handle real-time updates:
  - [ ] Add `syncStatus: 'syncing' | 'synced' | 'error'` state
  - [ ] Add `lastSyncTime: timestamp` state
  - [ ] Update setters to be async and call Firebase
  - [ ] Setup listeners in useEffect on app load
- [ ] Test: Multiple users see changes in real-time
- [ ] Test: Events update UI immediately when synced
- [ ] Test: Conflict resolution works (Last-Write-Wins)
- [ ] Add version fields to entities for conflict detection
- [ ] Show sync status indicator in UI

## Phase 9: Form Edits with Real-time Sync
- [ ] Update `EditEventForm.tsx` to call `eventDataService.updateEvent()`
- [ ] Update `TravelerEditForm.tsx` to call `travelersService.updateTraveler()`
- [ ] Add loading states during form submission
- [ ] Add error handling and user notifications
- [ ] Handle conflict resolution UI (show conflict message if edit rejected)
- [ ] Test: Editing event syncs to all users
- [ ] Test: Editing traveler syncs to all users
- [ ] Test: Concurrent edits resolve correctly
- [ ] Test: Form disabled while syncing
- [ ] Add optimistic UI updates (show change immediately, revert if error)

## Phase 10: Multi-user Features & Authorization
- [ ] Implement itinerary membership system (owner + members)
- [ ] Create trip invitation system (email invites)
- [ ] Add role-based access control (organizer vs guest)
- [ ] Deploy Firestore security rules (production)
- [ ] Create audit log collection for tracking changes
- [ ] Build activity feed/changelog UI
- [ ] Test: Only authorized users can edit
- [ ] Test: Guests can view but have limited edit access
- [ ] Test: Organizer can remove members
- [ ] Test: Changes are logged with user attribution
- [ ] Setup Firestore performance monitoring
- [ ] Add pagination for large datasets

## Phase 11: Offline Support & Sync Queuing
- [ ] Implement offline detection and state management
- [ ] Queue form edits when offline
- [ ] Sync queued changes when back online
- [ ] Show pending changes UI
- [ ] Handle merge conflicts from offline changes
- [ ] Test: Can edit forms while offline
- [ ] Test: Changes sync when connection restored
- [ ] Test: Merge conflicts resolved correctly
- [ ] Test: No data loss on connection interruption

## Phase 12: Performance Optimization & Cleanup
- [ ] Implement data caching strategy
- [ ] Add indexes to frequently queried fields
- [ ] Implement pagination for large collections
- [ ] Batch multiple updates into transactions
- [ ] Remove localStorage-based data (full migration to Firebase)
- [ ] Optimize database queries (remove unused fields)
- [ ] Monitor Firestore read/write costs
- [ ] Test: Query performance meets targets
- [ ] Test: Real-time sync performs well with 10+ users
- [ ] Load test with simulated concurrent users
