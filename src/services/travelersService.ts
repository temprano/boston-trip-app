import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { Traveler } from '../types'

export const travelersService = {
  async createTraveler(itineraryId: string, traveler: Omit<Traveler, 'id'>) {
    const travelersRef = collection(db, `itineraries/${itineraryId}/travelers`)
    const ref = await addDoc(travelersRef, {
      ...traveler,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    return ref.id
  },

  async updateTraveler(itineraryId: string, travelerId: string, updates: Partial<Traveler>) {
    const ref = doc(db, `itineraries/${itineraryId}/travelers`, travelerId)
    
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date(),
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
