interface EventCTABarProps {
  onMapClick?: () => void
  onTransitClick?: () => void
  onDirectionsClick?: () => void
}

export function EventCTABar({ onMapClick, onTransitClick, onDirectionsClick }: EventCTABarProps) {
  return (
    <div
      style={{
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '16px 0',
        width: '100%',
      }}
    >
      {/* Map Button */}
      <button
        onClick={onMapClick}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
        }}
        title="View on Map"
      >
        <img src="/icons/map.png" alt="Map" style={{ width: '48px', height: '48px' }} />
      </button>

      {/* Transit Button */}
      <button
        onClick={onTransitClick}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
        }}
        title="Get Transit Info"
      >
        <img src="/icons/transit.png" alt="Transit" style={{ width: '48px', height: '48px' }} />
      </button>

      {/* Directions Button */}
      <button
        onClick={onDirectionsClick}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ffffff',
        }}
        title="Get Directions"
      >
        <img src="/img/bottom-nav-bar/direction-active.png" alt="Directions" style={{ width: '48px', height: '48px' }} />
      </button>
    </div>
  )
}
