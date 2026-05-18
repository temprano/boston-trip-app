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
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        email,
        displayName,
        createdAt: new Date(),
        lastActive: new Date(),
      })
      
      return credential.user
    } catch (error) {
      throw new Error(`Sign up failed: ${(error as Error).message}`, { cause: error })
    }
  },

  async signIn(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      return credential.user
    } catch (error) {
      throw new Error(`Sign in failed: ${(error as Error).message}`, { cause: error })
    }
  },

  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(`Logout failed: ${(error as Error).message}`, { cause: error })
    }
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  getCurrentUser() {
    return auth.currentUser
  },

  getCurrentUserId() {
    return auth.currentUser?.uid || null
  },
}
