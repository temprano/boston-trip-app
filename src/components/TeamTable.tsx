import { useState, useEffect } from 'react'
import { Traveler } from '../types'
import { Edit2, Phone, Plane, Plus } from 'lucide-react'
import { TravelerEditForm } from './TravelerEditForm'
import { travelersDataService } from '../services/travelersDataService'
import { localTravelersDataService } from '../services/localTravelersDataService'
import { useAppStore } from '../store/appStore'

interface TeamTableProps {
  travelers: Traveler[]
  onAddClick?: () => void
}

export function TeamTable({ travelers, onAddClick }: TeamTableProps) {
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null)

  // Initialize local datastore
  useEffect(() => {
    if (travelers.length > 0) {
      localTravelersDataService.initializeDefaults(travelers)
    }
  }, [travelers])

  const handleEditClick = (traveler: Traveler) => {
    setEditingTraveler(traveler)
  }

  const handleEditSave = async (updatedData: Partial<Traveler>) => {
    if (!editingTraveler) return

    const currentItinerary = useAppStore.getState().currentItinerary
    if (!currentItinerary?.id) {
      console.error('[TeamTable] No itinerary selected')
      throw new Error('No itinerary selected')
    }

    console.log('[TeamTable.handleEditSave] Calling travelersDataService.updateTraveler for traveler:', editingTraveler.id)
    // Update locally and sync to Firebase asynchronously
    await travelersDataService.updateTraveler(currentItinerary.id, editingTraveler.id, updatedData)
    console.log('[TeamTable.handleEditSave] ✓ Traveler saved')
    console.log('[TeamTable.handleEditSave] (Form will call onCancel to close itself)')
  }

  const handleEditDelete = async (travelerId: string) => {
    const currentItinerary = useAppStore.getState().currentItinerary
    if (!currentItinerary?.id) {
      console.error('[TeamTable] No itinerary selected')
      throw new Error('No itinerary selected')
    }

    console.log('[TeamTable.handleEditDelete] Calling travelersDataService.deleteTraveler for traveler:', travelerId)
    // Delete locally and sync to Firebase asynchronously
    await travelersDataService.deleteTraveler(currentItinerary.id, travelerId)
    console.log('[TeamTable.handleEditDelete] ✓ Traveler deleted')
    // Form will close itself after delete completes
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h1 style={{ fontSize: 'clamp(28px, 8vw, 44px)', fontWeight: 'bold', margin: 0, color: '#000000' }}>
              MEET THE TEAM
            </h1>
            <button
              onClick={onAddClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                opacity: 0.7,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
              aria-label="Add new team member"
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '2px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={20} />
              </div>
            </button>
          </div>
          <div style={{ height: '2px', backgroundColor: '#000000', width: '100%' }} />
        </div>

        <div className="space-y-1">
          {travelers.map((traveler) => (
            <div
              key={traveler.id}
              style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e0e0e0',
                padding: '10px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              {traveler.avatar && (
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={traveler.avatar}
                    alt={traveler.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {/* Info Section */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3
                    style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#000000',
                      margin: 0,
                      letterSpacing: '0.05em',
                      fontFamily: "'American Captain', serif",
                    }}
                  >
                    {traveler.name}
                  </h3>
                  <button
                    onClick={() => handleEditClick(traveler)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Edit traveler"
                  >
                    <Edit2 style={{ width: '20px', height: '20px', color: '#2255cc' }} />
                  </button>
                </div>

                {/* Phone */}
                {traveler.contact?.phone && (
                  <div style={{ fontSize: '13px', color: '#333333', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    {traveler.contact.phone}
                  </div>
                )}

                {/* Flight Info */}
                {traveler.flightInfo && (
                  <div style={{ fontSize: '12px', color: '#333333', lineHeight: '1.4', marginTop: '4px' }}>
                    {/* Airlines Line */}
                    {(traveler.flightInfo.arrivalAirline || traveler.flightInfo.departureAirline) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>{traveler.flightInfo.arrivalAirline || '—'}</span>
                        <span>{traveler.flightInfo.departureAirline || '—'}</span>
                      </div>
                    )}
                    {/* Flight Numbers Line */}
                    {(traveler.flightInfo.arrivalFlightNumber || traveler.flightInfo.departureFlightNumber) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {traveler.flightInfo.arrivalFlightNumber && (
                            <>
                              <Plane style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                              {traveler.flightInfo.arrivalFlightNumber}
                            </>
                          )}
                          {!traveler.flightInfo.arrivalFlightNumber && '—'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {traveler.flightInfo.departureFlightNumber && (
                            <>
                              <Plane style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                              {traveler.flightInfo.departureFlightNumber}
                            </>
                          )}
                          {!traveler.flightInfo.departureFlightNumber && '—'}
                        </div>
                      </div>
                    )}
                    {/* Times Line */}
                    {(traveler.flightInfo.arrivalTime || traveler.flightInfo.departureTime) && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>{traveler.flightInfo.arrivalTime || '—'}</span>
                        <span>{traveler.flightInfo.departureTime || '—'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTraveler && (
        <TravelerEditForm
          traveler={editingTraveler}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
          onCancel={() => setEditingTraveler(null)}
        />
      )}
    </>
  )
}
