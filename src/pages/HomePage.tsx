import { useAppStore } from '../store/appStore'
import { WeatherBug } from '../components/WeatherBug'
import { MapPin, Home } from 'lucide-react'

export function HomePage() {
  const itinerary = useAppStore((state) => state.currentItinerary)
  const userLocation = useAppStore((state) => state.userLocation)
  const directionsOrigin = useAppStore((state) => state.directionsOrigin)
  const setDirectionsOrigin = useAppStore((state) => state.setDirectionsOrigin)

  if (!itinerary) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#999999',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>No Itinerary Loaded</h2>
          <p>Loading itinerary data...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header Section */}
      <div style={{ padding: '16px', borderBottom: '1px solid #333333' }}>
        <h1 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '20px' }}>
          {itinerary.title}
        </h1>
        <p
          style={{
            margin: '0',
            color: '#999999',
            fontSize: '13px',
            lineHeight: '1.4',
          }}
        >
          {itinerary.description}
        </p>
      </div>

      {/* Main Section */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Weather Display - Above Directions Card */}
        <div style={{ marginBottom: '16px' }}>
          <WeatherBug />
        </div>

        {/* Location Toggle Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Card Header */}
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 12px 0',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Directions From
          </h2>

          {/* Status Section */}
          <div style={{ flex: 1, marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              {directionsOrigin === 'current' ? (
                <>
                  <MapPin size={20} color="#2255cc" />
                  <span style={{ color: '#2255cc', fontWeight: 'bold', fontSize: '15px' }}>
                    Current Location
                  </span>
                  {userLocation ? (
                    <span style={{ color: '#4caf50', fontSize: '12px', marginLeft: 'auto' }}>
                      ✓ Available
                    </span>
                  ) : (
                    <span style={{ color: '#ff9800', fontSize: '12px', marginLeft: 'auto' }}>
                      ⚠ Not Available
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Home size={20} color="#2255cc" />
                  <span style={{ color: '#2255cc', fontWeight: 'bold', fontSize: '15px' }}>
                    Base Address (Airbnb)
                  </span>
                  <span style={{ color: '#4caf50', fontSize: '12px', marginLeft: 'auto' }}>
                    ✓ Default
                  </span>
                </>
              )}
            </div>

            {directionsOrigin === 'current' && !userLocation && (
              <p style={{ fontSize: '12px', color: '#ff9800', margin: '0' }}>
                Enable location in Settings to use current location for directions
              </p>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => {
              const newOrigin = directionsOrigin === 'current' ? 'base' : 'current'
              setDirectionsOrigin(newOrigin)
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: directionsOrigin === 'current' ? '#2255cc' : '#666666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                directionsOrigin === 'current' ? '#1a3fa0' : '#555555'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                directionsOrigin === 'current' ? '#2255cc' : '#666666'
            }}
          >
            Use {directionsOrigin === 'current' ? 'Base Address' : 'Current Location'}
          </button>
        </div>

        {/* House Details Placeholder */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px',
          }}
        >
          <span style={{ color: '#000000', fontSize: '17px', fontWeight: 'bold' }}>
            House details
          </span>
        </div>
      </div>
    </div>
  )
}
