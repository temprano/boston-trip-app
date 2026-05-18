/**
 * One-time data migration utility
 * Seeds Firestore 'events' collection with local events
 * 
 * Usage: Call once from browser console to migrate all local events to Firestore
 * await window.__migrateLocalEventsToFirebase()
 */

import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Event } from '../types'
import { localEventsDataService } from './localEventsDataService'

export async function migrateLocalEventsToFirebase(): Promise<void> {
  if (!db) {
    console.log('[firebaseMigration] Firebase not initialized, cannot migrate')
    return
  }

  console.log('[firebaseMigration] Starting migration of local events to Firestore...')
  const localEvents = localEventsDataService.getEvents()

  if (localEvents.length === 0) {
    console.log('[firebaseMigration] No local events to migrate')
    return
  }

  try {
    const eventsRef = collection(db, 'events')
    console.log('[firebaseMigration] Uploading', localEvents.length, 'events to Firestore...')

    const promises = localEvents.map((event: Event) =>
      setDoc(doc(eventsRef, event.id), event, { merge: true })
    )

    await Promise.all(promises)
    console.log('[firebaseMigration] ✓ Migration complete:', localEvents.length, 'events uploaded to Firestore')
  } catch (error) {
    console.error('[firebaseMigration] Migration failed:', error)
    throw error
  }
}

// Expose to window for manual console calls
if (typeof window !== 'undefined') {
  (window as any).__migrateLocalEventsToFirebase = migrateLocalEventsToFirebase
}
