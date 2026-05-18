import { useState } from 'react'
import { useAppStore } from '../store'
import { TeamTable } from '../components/TeamTable'
import { Traveler } from '../types'
import { TravelerEditForm } from '../components/TravelerEditForm'
import { firebaseTravelersSyncService } from '../services/firebaseTravelersSync'

export function TravelersPage() {
  const travelers = useAppStore((state) => state.travelers)
  const setTravelers = useAppStore((state) => state.setTravelers)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddTraveler = async (newTraveler: Traveler) => {
    // Add to local state
    const updatedTravelers = [...travelers, newTraveler]
    setTravelers(updatedTravelers)
    
    // Save to localStorage
    localStorage.setItem('boston_travelers_local', JSON.stringify(updatedTravelers))
    
    // Sync new traveler to Firebase
    const currentItinerary = useAppStore.getState().currentItinerary
    if (currentItinerary?.id) {
      try {
        console.log('[TravelersPage.handleAddTraveler] Syncing new traveler to Firebase:', newTraveler.id)
        await firebaseTravelersSyncService.syncTravelerToFirebase(currentItinerary.id, newTraveler)
        console.log('[TravelersPage.handleAddTraveler] ✓ New traveler synced to Firebase:', newTraveler.id)
      } catch (error) {
        console.error('[TravelersPage.handleAddTraveler] Failed to sync new traveler to Firebase:', error)
      }
    }
    
    console.log('[TravelersPage.handleAddTraveler] (Form will call onCancel to close itself)')
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#ffffff', minHeight: '100%', paddingBottom: '160px' }}>
      {/* MEET THE TEAM Header */}
      {/* <h1 style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 'bold', marginBottom: '6px', color: '#ffffff', backgroundColor: '#000000', padding: '6px 10px', borderRadius: '4px', display: 'inline-block', letterSpacing: '-1.68px' }}>
        MEET THE TEAM
      </h1> */}
      <div style={{ height: '2px', backgroundColor: '#ffffff', width: '100%', marginBottom: '16px' }} />

      {travelers.length > 0 ? (
        <>
          <TeamTable travelers={travelers} onAddClick={() => setShowAddForm(true)} />
          {showAddForm && (
            <TravelerEditForm
              onCancel={() => setShowAddForm(false)}
              onSave={handleAddTraveler}
              isAddMode={true}
            />
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p style={{ color: '#666666', marginBottom: '16px' }}>
            No travelers yet
          </p>
        </div>
      )}
    </div>
  )
}
