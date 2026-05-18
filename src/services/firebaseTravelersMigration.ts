/**
 * One-time data migration utility for travelers
 * Seeds Firestore 'travelers' collection with local travelers
 * 
 * Usage: Call once from browser console to migrate all local travelers to Firestore
 * await window.__migrateLocalTravelersToFirebase()
 */

import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { Traveler } from '../types'
import { localTravelersDataService } from './localTravelersDataService'

export async function migrateLocalTravelersToFirebase(): Promise<void> {
  if (!db) {
    console.log('[firebaseTravelersMigration] Firebase not initialized, cannot migrate')
    return
  }

  console.log('[firebaseTravelersMigration] Starting migration of local travelers to Firestore...')
  const localTravelers = localTravelersDataService.getTravelers()

  if (localTravelers.length === 0) {
    console.log('[firebaseTravelersMigration] No local travelers to migrate')
    return
  }

  try {
    const travelersRef = collection(db, 'travelers')
    console.log('[firebaseTravelersMigration] Uploading', localTravelers.length, 'travelers to Firestore...')

    const promises = localTravelers.map((traveler: Traveler) =>
      setDoc(doc(travelersRef, traveler.id), traveler, { merge: true })
    )

    await Promise.all(promises)
    console.log('[firebaseTravelersMigration] ✓ Migration complete:', localTravelers.length, 'travelers uploaded to Firestore')
  } catch (error) {
    console.error('[firebaseTravelersMigration] Migration failed:', error)
    throw error
  }
}

// Expose to window for manual console calls
if (typeof window !== 'undefined') {
  (window as any).__migrateLocalTravelersToFirebase = migrateLocalTravelersToFirebase
}
