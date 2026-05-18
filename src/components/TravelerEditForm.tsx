import { useState } from 'react'
import { Traveler } from '../types'
import { X } from 'lucide-react'

interface TravelerEditFormProps {
  traveler?: Traveler
  onSave: (traveler: Traveler) => Promise<void> | void
  onDelete?: (travelerId: string) => Promise<void>
  onCancel: () => void
  isAddMode?: boolean
}

const createBlankTraveler = (): Traveler => ({
  id: `traveler-${Date.now()}`,
  name: '',
  role: 'guest',
  avatar: '',
  contact: {
    email: '',
    phone: '',
  },
  flightInfo: {
    arrivalAirline: '',
    arrivalFlightNumber: '',
    arrivalTime: '',
    departureAirline: '',
    departureFlightNumber: '',
    departureTime: '',
  },
})

export function TravelerEditForm({ traveler, onSave, onDelete, onCancel, isAddMode = false }: TravelerEditFormProps) {
  const [formData, setFormData] = useState<Traveler>(traveler || createBlankTraveler())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleInputChange = (field: keyof Traveler, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleContactChange = (field: keyof Traveler['contact'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }))
  }

  const handleFlightInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      flightInfo: {
        ...(prev.flightInfo || {} as any),
        [field]: value,
      },
    })) as any
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate name is required
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }
    
    try {
      setError(null)
      setIsSaving(true)
      await onSave(formData)
      // onCancel will be called by parent when state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save traveler')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!traveler?.id || !onDelete) return

    try {
      setError(null)
      setIsDeleting(true)
      await onDelete(traveler.id)
      setShowDeleteConfirm(false)
      // Close the entire form modal after successful delete
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete traveler')
      setIsDeleting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#000000',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#000000' }}>
            {isAddMode ? 'Add Team Member' : `Edit ${formData.name}`}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666666',
              padding: '0',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '4px',
            marginBottom: '16px',
            color: '#c62828',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                color: '#000000',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
              Role
            </label>
            <select
              value={formData.role || 'guest'}
              onChange={(e) => handleInputChange('role', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                color: '#000000',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            >
              <option value="guest">Guest</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.contact.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                color: '#000000',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.contact.phone || ''}
              onChange={(e) => handleContactChange('phone', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                color: '#000000',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Arrival Info */}
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginTop: 0, marginBottom: '12px' }}>
              Arrival Flight
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
                Airline
              </label>
              <input
                type="text"
                value={formData.flightInfo?.arrivalAirline || ''}
                onChange={(e) => handleFlightInfoChange('arrivalAirline', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
                Flight Number
              </label>
              <input
                type="text"
                value={formData.flightInfo?.arrivalFlightNumber || ''}
                onChange={(e) => handleFlightInfoChange('arrivalFlightNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
                Arrival Time
              </label>
              <input
                type="text"
                value={formData.flightInfo?.arrivalTime || ''}
                onChange={(e) => handleFlightInfoChange('arrivalTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g., 2:00pm"
              />
            </div>
          </div>

          {/* Departure Info */}
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginTop: 0, marginBottom: '12px' }}>
              Departure Flight
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
                Airline
              </label>
              <input
                type="text"
                value={formData.flightInfo?.departureAirline || ''}
                onChange={(e) => handleFlightInfoChange('departureAirline', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
                Flight Number
              </label>
              <input
                type="text"
                value={formData.flightInfo?.departureFlightNumber || ''}
                onChange={(e) => handleFlightInfoChange('departureFlightNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#333333', fontWeight: 'bold' }}>
                Departure Time
              </label>
              <input
                type="text"
                value={formData.flightInfo?.departureTime || ''}
                onChange={(e) => handleFlightInfoChange('departureTime', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #cccccc',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g., 11:00am"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: isSaving ? '#9ca3af' : '#2255cc',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? 'Saving...' : (isAddMode ? 'Add Team Member' : 'Save Changes')}
            </button>
            {!isAddMode && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                style={{
                  padding: '10px 16px',
                  backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#ffffff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              borderRadius: '8px',
            }}
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '300px',
                color: '#000000',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
                Delete {formData.name}?
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666666' }}>
                This action cannot be undone. The traveler will be removed from the team.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#e0e0e0',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#000000',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
