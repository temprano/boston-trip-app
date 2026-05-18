import { useState, useEffect } from 'react'
import { Event } from '../types'
import { localEventsDataService } from '../services/localEventsDataService'

// MBTA Quick Stops for nearestStopId selection
const QUICK_STOPS = [
  { id: 'place-DB-2249', name: 'Four Corners/Geneva' },
  { id: 'place-pktrm', name: 'Park Street' },
  { id: 'place-spmnl', name: 'Science Park/West End' },
  { id: 'place-chmnl', name: 'Charles/MGH' },
  { id: 'place-haecl', name: 'Haymarket' },
  { id: 'place-grnst', name: 'Green Street' },
  { id: 'place-fenwy', name: 'Fenway' },
  { id: 'place-sstat', name: 'South Station' },
  { id: 'place-north', name: 'North Station' },
  { id: 'place-bomnl', name: 'Boylston' },
  { id: 'place-dwnxg', name: 'Downtown Crossing' },
  { id: 'place-knncl', name: 'Kendall/MIT' },
]

interface EditEventFormProps {
  event?: Event
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEvent: Event) => Promise<void>
  isAddMode?: boolean
}

const getNextEventId = (): string => {
  const events = localEventsDataService.getEvents()
  if (events.length === 0) return '1'
  
  // Find the max numeric ID
  const numericIds = events
    .map(e => {
      const match = e.id.match(/^(\d+)$/) || e.id.match(/^event[_-](\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter(id => id > 0)
  
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
  return String(maxId + 1)
}

const createBlankEvent = (): Event => ({
  id: getNextEventId(),
  title: '',
  venue: '',
  date: '',
  time: '',
  phone: '',
  nearestStopId: '',
  address: {
    line1: '',
    line2: '',
  },
  eventImage: '',
  category: '',
})

export function EditEventForm({ event, isOpen, onClose, onSave, isAddMode = false }: EditEventFormProps) {
  const [formData, setFormData] = useState<Event>(event ? {
    ...event,
    phone: event.phone || '',
  } : createBlankEvent())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form data when event changes or form opens
  useEffect(() => {
    if (isOpen) {
      if (isAddMode) {
        setFormData(createBlankEvent())
      } else if (event) {
        setFormData({
          ...event,
          phone: event.phone || '',
        })
      }
      setError(null)
    }
  }, [event, isOpen, isAddMode])

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSave = async () => {
    try {
      setError(null)
      setIsSaving(true)
      
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }
      if (!formData.venue.trim()) {
        setError('Venue is required')
        return
      }
      if (!formData.date.trim()) {
        setError('Date is required')
        return
      }
      if (!formData.time.trim()) {
        setError('Time is required')
        return
      }
      if (!formData.address.line1.trim()) {
        setError('Address Line 1 is required')
        return
      }

      // Convert date from MM/DD/YYYY to ISO format (YYYY-MM-DD) for consistency
      const convertDateToISO = (dateStr: string) => {
        // If already ISO format, return as-is
        if (dateStr.includes('-')) {
          return dateStr
        }
        // Convert MM/DD/YYYY to YYYY-MM-DD
        const [month, day, year] = dateStr.split('/')
        return `${year}-${month}-${day}`
      }

      const eventToSave = {
        ...formData,
        date: convertDateToISO(formData.date),
      }

      await onSave(eventToSave)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#000000',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {isAddMode ? 'Add Event' : 'Edit Event'}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px',
              color: '#c00',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Venue */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Venue *
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={e => handleInputChange('venue', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Date *
            </label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={formData.date}
              onChange={e => handleInputChange('date', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Time */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Time *
            </label>
            <input
              type="text"
              placeholder="e.g., 3:00 pm"
              value={formData.time}
              onChange={e => handleInputChange('time', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => handleInputChange('phone', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Nearest Stop ID (for Transit) */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Nearest Transit Stop
            </label>
            <select
              value={formData.nearestStopId || ''}
              onChange={e => handleInputChange('nearestStopId', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select a stop (optional) --</option>
              {QUICK_STOPS.map(stop => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address Line 1 */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Address Line 1 *
            </label>
            <input
              type="text"
              value={formData.address.line1}
              onChange={e => handleInputChange('address.line1', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '6px' }}>
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.address.line2}
              onChange={e => handleInputChange('address.line2', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              color: '#333',
              opacity: isSaving ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: '#2255cc',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              color: '#ffffff',
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
