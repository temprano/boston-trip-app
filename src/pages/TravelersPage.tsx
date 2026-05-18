import { useState } from 'react'
import { useAppStore } from '../store'
import { TeamTable } from '../components/TeamTable'
import { Traveler } from '../types'
import { TravelerEditForm } from '../components/TravelerEditForm'
import { travelersDataService } from '../services/travelersDataService'

export function TravelersPage() {
  const travelers = useAppStore((state) => state.travelers)
  const currentItinerary = useAppStore((state) => state.currentItinerary)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddTraveler = async (newTraveler: Traveler) => {
    if (!currentItinerary?.id) {
      console.error('[TravelersPage] No itinerary selected')
      throw new Error('No itinerary selected')
    }

    console.log('[TravelersPage.handleAddTraveler] Calling travelersDataService.addTraveler for new traveler:', newTraveler.id)
    // Add locally and sync to Firebase asynchronously
    await travelersDataService.addTraveler(currentItinerary.id, newTraveler)
    console.log('[TravelersPage.handleAddTraveler] ✓ Traveler added')
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
