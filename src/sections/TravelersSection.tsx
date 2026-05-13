import React, { useState } from 'react'
import { Traveler } from '../types'
import { GlassCard, GlassPanel } from '../components/glass'
import { ChevronDown, Plane, Mail, Phone, Users, Edit2 } from 'lucide-react'
import { TravelerEditForm } from '../components/TravelerEditForm'
import { localTravelersDataService } from '../services/localTravelersDataService'

interface TravelerCardProps {
  traveler: Traveler
  isExpanded: boolean
  onToggle: () => void
  onEdit: (traveler: Traveler) => void
}

const TravelerCard: React.FC<TravelerCardProps> = ({ traveler, isExpanded, onToggle, onEdit }) => {
  return (
    <GlassCard
      className="mb-4 transition-all overflow-hidden"
      displacementScale={40}
      elasticity={0.2}
    >
      <div className="p-0">
        {/* Avatar Section */}
        {traveler.avatar && (
          <div className="w-full h-40 bg-gradient-to-b from-purple-400 to-blue-400 flex items-center justify-center overflow-hidden">
            <img
              src={traveler.avatar}
              alt={traveler.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>
        )}

        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 cursor-pointer" onClick={onToggle}>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {traveler.name}
              </h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded inline-block mt-1">
                {traveler.role === 'organizer' ? '👑 Organizer' : '👤 Guest'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(traveler)
                }}
                className="p-2 hover:bg-gray-700 rounded transition"
                title="Edit traveler"
              >
                <Edit2 className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <ChevronDown
                className={`w-5 h-5 transition-transform flex-shrink-0 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                onClick={onToggle}
              />
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* Bio */}
              {traveler.bio && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">{traveler.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                {traveler.contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <a
                      href={`mailto:${traveler.contact.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {traveler.contact.email}
                    </a>
                  </div>
                )}
                {traveler.contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-green-500" />
                    <a
                      href={`tel:${traveler.contact.phone}`}
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {traveler.contact.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Flight Info */}
              {traveler.flightInfo && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-sm">Flight Details</span>
                  </div>
                  <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                    <div>
                      <span className="font-medium">Departure:</span>
                      <span className="ml-2">{traveler.flightInfo.departureAirline} {traveler.flightInfo.departureFlightNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium">Departs:</span>
                      <span className="ml-2">{traveler.flightInfo.departureTime}</span>
                    </div>
                    <div>
                      <span className="font-medium">Arrival:</span>
                      <span className="ml-2">{traveler.flightInfo.arrivalAirline} {traveler.flightInfo.arrivalFlightNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium">Arrives:</span>
                      <span className="ml-2">{traveler.flightInfo.arrivalTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dietary Restrictions */}
              {traveler.dietaryRestrictions && traveler.dietaryRestrictions.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm">Dietary Info</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {traveler.dietaryRestrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {traveler.notes && (
                <div className="text-xs text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                  {traveler.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

interface TravelersSectionProps {
  travelers: Traveler[]
  title?: string
  onTravelerUpdate?: (traveler: Traveler) => void
}

export const TravelersSection: React.FC<TravelersSectionProps> = ({
  travelers,
  title = 'Travelers',
  onTravelerUpdate,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(travelers[0]?.id || null)
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null)
  const [localTravelers, setLocalTravelers] = useState<Traveler[]>(travelers)

  const handleEditSave = (updatedTraveler: Traveler) => {
    // Save to local storage
    const saved = localTravelersDataService.updateTraveler(updatedTraveler.id, updatedTraveler)
    
    if (saved) {
      // Update local state
      setLocalTravelers((prev) =>
        prev.map((t) => (t.id === saved.id ? saved : t))
      )
      
      // Call callback if provided
      if (onTravelerUpdate) {
        onTravelerUpdate(saved)
      }
    }
    
    setEditingTraveler(null)
  }

  const displayTravelers = localTravelers.length > 0 ? localTravelers : travelers
  const organizers = displayTravelers.filter((t) => t.role === 'organizer')
  const guests = displayTravelers.filter((t) => t.role === 'guest')

  return (
    <>
      <GlassPanel
        title={`${title} (${displayTravelers.length})`}
        className="w-full"
        displacementScale={60}
        elasticity={0.25}
      >
        <div className="space-y-4">
          {/* Organizers */}
          {organizers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                👑 Organizers
              </h4>
              <div className="space-y-2">
                {organizers.map((traveler) => (
                  <TravelerCard
                    key={traveler.id}
                    traveler={traveler}
                    isExpanded={expandedId === traveler.id}
                    onToggle={() =>
                      setExpandedId(expandedId === traveler.id ? null : traveler.id)
                    }
                    onEdit={setEditingTraveler}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Guests */}
          {guests.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                👤 Guests
              </h4>
              <div className="space-y-2">
                {guests.map((traveler) => (
                  <TravelerCard
                    key={traveler.id}
                    traveler={traveler}
                    isExpanded={expandedId === traveler.id}
                    onToggle={() =>
                      setExpandedId(expandedId === traveler.id ? null : traveler.id)
                    }
                    onEdit={setEditingTraveler}
                  />
                ))}
              </div>
            </div>
          )}

          {displayTravelers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No travelers yet</p>
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Edit Form Modal */}
      {editingTraveler && (
        <TravelerEditForm
          traveler={editingTraveler}
          onSave={handleEditSave}
          onCancel={() => setEditingTraveler(null)}
        />
      )}
    </>
  )
}
