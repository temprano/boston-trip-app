import { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { WifiOff, Wifi } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const setIsOffline = useAppStore((state) => state.setIsOffline)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsOffline(false)
      console.log('✓ App is online')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsOffline(true)
      console.log('✗ App is offline - using cached data')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOffline])

  if (isOnline) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ff6b6b',
        color: '#ffffff',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 9999,
        fontSize: '14px',
        fontWeight: '500',
      }}
    >
      <WifiOff size={18} />
      <span>You're offline - Using cached data</span>
    </div>
  )
}

export function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: isOnline ? '#4CAF50' : '#ff6b6b',
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={14} />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>Offline</span>
        </>
      )}
    </div>
  )
}
