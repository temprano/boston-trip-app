import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { Itinerary } from '../types'

export const itineraryService = {
  async createItinerary(itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) {
    const ref = doc(collection(db, 'itineraries'))
    const newItinerary = {
      ...itinerary,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const ref = doc(db, 'itineraries', itineraryId)
    
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  async deleteItinerary(itineraryId: string) {
    const ref = doc(db, 'itineraries', itineraryId)
    await deleteDoc(ref)
  },

  async listAllItineraries(): Promise<Itinerary[]> {
    const q = collection(db, 'itineraries')
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

  subscribeToAllItineraries(callback: (itineraries: Itinerary[]) => void) {
    const q = collection(db, 'itineraries')
    return onSnapshot(q, snapshot => {
      const itineraries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Itinerary[]
      callback(itineraries)
    })
  },
}
