import { useState } from 'react'
import { Traveler } from '../types'
import { X } from 'lucide-react'

interface TravelerEditFormProps {
  traveler: Traveler
  onSave: (traveler: Traveler) => void
  onCancel: () => void
}

export function TravelerEditForm({ traveler, onSave, onCancel }: TravelerEditFormProps) {
  const [formData, setFormData] = useState<Traveler>(traveler)

  const handleInputChange = (field: keyof Traveler, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleContactChange = (field: keyof typeof traveler.contact, value: string) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
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
          <h2 style={{ margin: 0, fontSize: '20px', color: '#000000' }}>Edit {formData.name}</h2>
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
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#2255cc',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
