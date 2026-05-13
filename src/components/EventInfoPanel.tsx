import { Event } from '../types'
import { X } from 'lucide-react'
import { GoogleMapComponent } from './GoogleMapComponent'
import { TransitComponent } from './TransitComponent'

interface EventInfoPanelProps {
  event: Event | null
  infoType: 'map' | 'transit' | 'tickets' | null
  onClose: () => void
}

export function EventInfoPanel({ event, infoType, onClose }: EventInfoPanelProps) {
  if (!event || !infoType) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxHeight: '80vh',
          borderRadius: '16px 16px 0 0',
          padding: '20px',
          boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>
            {infoType === 'map' && '📍 ' + event.title}
            {infoType === 'transit' && '🚌 ' + event.title}
            {infoType === 'tickets' && '🎫 ' + event.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '24px', height: '24px', color: '#666666' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ color: '#333333', fontSize: '14px', lineHeight: '1.6' }}>
          {infoType === 'map' && (
            <GoogleMapComponent event={event} />
          )}

          {infoType === 'transit' && (
            <TransitComponent event={event} />
          )}

          {infoType === 'tickets' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '8px', fontWeight: 'bold' }}>Event Details</h3>
                <p style={{ margin: '0 0 12px 0' }}>
                  Event: <strong>{event.title}</strong>
                </p>
                <p style={{ margin: '0 0 12px 0' }}>
                  Venue: <strong>{event.venue}</strong>
                </p>
                <p style={{ margin: '0 0 12px 0' }}>
                  Date: <strong>{event.date}</strong>
                </p>
                <p style={{ margin: 0 }}>
                  Time: <strong>{event.time}</strong>
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#2255cc',
                  fontWeight: '600',
                }}
              >
                🎫 Ticket purchase coming soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
