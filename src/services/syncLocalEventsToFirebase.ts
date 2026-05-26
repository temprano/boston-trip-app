/**
 * DEPRECATED: This function has been removed to prevent deleted events from being resurrected
 * 
 * Previous behavior: On app startup, this would upload the entire localStorage cache to Firestore,
 * which caused deleted events to reappear (devices with old cached copies would re-upload them).
 * 
 * New architecture: Firestore is the single source of truth. Events only enter Firestore when:
 * - User creates event → syncEventToFirebase() called immediately
 * - User edits event → syncEventToFirebase() called immediately
 * - Real-time listener pulls from Firestore and replaces local cache
 * 
 * localStorage is now read-only offline cache, never uploaded back to Firestore.
 * 
 * This file is kept for historical reference but is no longer called from App.tsx
 */

export async function syncLocalEventsToFirebaseOnce(): Promise<void> {
  // NO-OP: Function has been deprecated
  console.log('[syncLocalEventsToFirebase] This function is deprecated and should not be called')
}
