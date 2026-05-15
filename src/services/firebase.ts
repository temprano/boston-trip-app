import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// import { getAuth } from 'firebase/auth'  // Not used in app

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

console.log('[Firebase] Config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId,
})

// Check if Firebase is configured
const isFirebaseConfigured = Object.values(firebaseConfig).some(value => value !== '')

console.log('[Firebase] Is configured:', isFirebaseConfigured)

if (!isFirebaseConfigured) {
  console.warn('⚠️  Firebase not configured. App will work offline without cloud sync.')
  console.warn('📝 To enable cloud sync, create .env.local with Firebase credentials.')
}

let app: any
let db: any
let storage: any
let auth: any = null  // Not initialized - not used in app
let emulatorInitialized = false

try {
  console.log('[Firebase] Starting initialization...')
  if (isFirebaseConfigured) {
    console.log('[Firebase] Initializing app...')
    app = initializeApp(firebaseConfig)
    console.log('[Firebase] App initialized:', app.name)
    
    console.log('[Firebase] Getting Firestore...')
    db = getFirestore(app)
    console.log('[Firebase] Firestore initialized:', !!db)
    
    console.log('[Firebase] Getting Storage...')
    storage = getStorage(app)
    console.log('[Firebase] Storage initialized:', !!storage)

    // Enable Firestore emulator in development (only once, safely)
    if (import.meta.env.DEV && !emulatorInitialized) {
      try {
        console.log('[Firebase] DEV mode detected, checking emulator...')
        emulatorInitialized = true
        // Check if already connected before attempting
        const settings = (db as any)._firestoreClient?.settings
        if (settings && !settings.host?.includes('localhost')) {
          console.log('[Firebase] Connecting to emulator...')
          connectFirestoreEmulator(db, 'localhost', 8080)
          console.log('[Firebase] ✓ Firestore emulator connected')
        } else {
          console.log('[Firebase] Emulator already connected or not available')
        }
      } catch (error: any) {
        // Ignore errors - already initialized or emulator not running
        console.log('[Firebase] Emulator connection note:', error?.message || 'not available')
      }
    } else {
      console.log('[Firebase] Production mode or already initialized')
    }
    console.log('[Firebase] ✓ Firebase initialization complete')
  } else {
    console.log('[Firebase] Not configured, using offline mode')
    // Create dummy objects so imports don't break
    app = { name: 'offline' }
    db = null
    storage = null
    auth = null
  }
} catch (error) {
  console.error('[Firebase] Failed to initialize Firebase:', error)
  app = { name: 'offline' }
  db = null
  storage = null
  auth = null
}

export { app, db, storage, auth }
