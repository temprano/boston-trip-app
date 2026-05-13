import { useNavigate, useLocation } from 'react-router-dom'

interface NavTab {
  id: string
  label: string
  path: string
  image: string
}

const TABS: NavTab[] = [
  { id: 'home', label: 'Home', path: '/', image: 'home' },
  { id: 'team', label: 'Team', path: '/team', image: 'team' },
  { id: 'dayview', label: 'DayView', path: '/dayview', image: 'day-view' },
  { id: 'transit', label: 'Transit', path: '/transit', image: 'transit' },
  { id: 'settings', label: 'Settings', path: '/settings', image: 'settings' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '72px',
        backgroundColor: '#161416',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
        borderTop: '1px solid #2a2a2a',
        boxSizing: 'border-box',
        gap: '0px',
        padding: '0 2px',
      }}
    >
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path
        const imageState = isActive ? 'active' : 'inactive'
        const imageSrc = `/img/bottom-nav-bar/${tab.image}-${imageState}.png`

        // Transit emoji fallback - show emoji instead of image
        const isTransit = tab.id === 'transit'

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0px',
              margin: '0px',
              minWidth: 0,
              flex: 1,
              height: '72px',
              opacity: isActive ? 1 : 0.8,
              transition: 'opacity 0.2s',
            }}
            aria-label={tab.label}
          >
            <img
              src={isTransit ? '/icons/transit.png' : imageSrc}
              alt={`${tab.label} ${imageState}`}
              style={{ 
                height: 'clamp(30px, 10vw, 56px)', 
                width: 'clamp(30px, 10vw, 56px)',
                objectFit: 'contain',
                maxWidth: '100%',
                filter: isTransit && isActive ? 'brightness(1.2)' : isTransit ? 'brightness(0.8)' : 'none',
                opacity: isActive ? 1 : 0.8,
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
