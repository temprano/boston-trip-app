import { useState, useEffect } from 'react'
import { useAppStore } from '../store'
import { QrCode, X, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { locationService } from '../services/locationService'
import { baseAddressSyncService } from '../services/baseAddressSyncService'

export function SettingsPage() {
  const [showQR, setShowQR] = useState(false)
  const [addressInput, setAddressInput] = useState('')
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [requestingLocation, setRequestingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  const isOffline = useAppStore((state) => state.isOffline)
  const setIsOffline = useAppStore((state) => state.setIsOffline)
  const baseAddress = useAppStore((state) => state.baseAddress)
  const setBaseAddress = useAppStore((state) => state.setBaseAddress)
  const userLocation = useAppStore((state) => state.userLocation)
  const setUserLocation = useAppStore((state) => state.setUserLocation)
  const currentItinerary = useAppStore((state) => state.currentItinerary)

  // Check initial location permission status
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' })
          setLocationPermissionStatus(result.state as 'granted' | 'denied' | 'prompt')
        } else {
          // Fallback: assume we can try to request
          setLocationPermissionStatus('prompt')
        }
      } catch (err) {
        console.log('[SettingsPage] Could not check permission status:', err)
        setLocationPermissionStatus('unknown')
      }
    }
    checkPermissionStatus()
  }, [])

  const handleRequestLocation = async () => {
    setRequestingLocation(true)
    setLocationError(null)
    try {
      console.log('[SettingsPage] Requesting location permission...')
      const location = await locationService.getCurrentPosition()
      console.log('[SettingsPage] ✓ Location obtained:', location)
      setUserLocation(location)
      console.log('[SettingsPage] ✓ Location saved to store')
      setLocationPermissionStatus('granted')
      setLocationError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location'
      console.error('[SettingsPage] ✗ Location error:', errorMessage)
      setLocationError(errorMessage)
      
      // Update permission status based on error
      if (errorMessage.includes('User denied')) {
        setLocationPermissionStatus('denied')
      }
    } finally {
      setRequestingLocation(false)
    }
  }

  return (
    <div className="space-y-16 pb-40" style={{ color: '#ffffff', padding: '24px 32px 120px 32px' }}>
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
          Settings
        </h1>
        <p className="font-medium" style={{ color: '#ffffff' }}>
          Configure app preferences and behavior
        </p>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 pb-3" style={{ color: '#ffffff', borderBottom: '2px solid #ffffff', marginTop:'18px', }}>
          Connectivity
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium" style={{ color: '#ffffff' }}>
              Offline Mode
            </span>
            <p className="text-sm mt-1" style={{ color: '#ffffff' }}>
              {isOffline
                ? 'Currently offline - using cached data'
                : 'Currently online - syncing with server'}
            </p>
          </div>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-4 py-2 rounded-lg transition ${
              isOffline
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isOffline ? 'Go Online' : 'Go Offline'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 pb-3" style={{ color: '#ffffff', borderBottom: '2px solid #ffffff', marginTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-5 h-5" />
            Location Services
          </div>
        </h2>

        <div>
          <p className="text-sm mb-3" style={{ color: '#ffffff' }}>
            Allow the app to access your current location for real-time directions
          </p>

          {/* Permission Status */}
          <div
            style={{
              padding: '12px',
              backgroundColor: locationPermissionStatus === 'granted' ? '#1f4620' : locationPermissionStatus === 'denied' ? '#4a1f1f' : '#333',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {locationPermissionStatus === 'granted' ? (
              <>
                <CheckCircle size={20} color="#4caf50" />
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Permission Granted</span>
              </>
            ) : locationPermissionStatus === 'denied' ? (
              <>
                <AlertCircle size={20} color="#ff6b6b" />
                <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Permission Denied</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} color="#ffb74d" />
                <span style={{ color: '#ffb74d', fontWeight: 'bold' }}>Not Requested</span>
              </>
            )}
          </div>

          {/* Current Location */}
          {userLocation && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#222',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#fff',
              }}
            >
              <p style={{ margin: '0 0 4px 0' }}>
                <strong>Current Location:</strong> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
              <p style={{ margin: '0', color: '#999' }}>
                Accuracy: ±{Math.round(userLocation.accuracy)} meters
              </p>
            </div>
          )}

          {/* Error Message */}
          {locationError && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#4a1f1f',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#ff6b6b',
              }}
            >
              <strong>Error:</strong> {locationError}
            </div>
          )}

          {/* Request Button */}
          <button
            onClick={handleRequestLocation}
            disabled={requestingLocation || locationPermissionStatus === 'granted'}
            className="w-full px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: locationPermissionStatus === 'granted' ? '#4caf50' : '#2255cc',
              color: '#ffffff',
            }}
          >
            {requestingLocation ? 'Requesting...' : locationPermissionStatus === 'granted' ? '✓ Location Enabled' : 'Enable Location'}
          </button>

          {/* Clear Cached Location Button */}
          {userLocation && (
            <button
              onClick={() => {
                console.log('[SettingsPage] Clearing cached location')
                localStorage.removeItem('userLocation')
                setUserLocation(null)
                setLocationPermissionStatus('prompt')
                setLocationError(null)
              }}
              className="w-full px-4 py-2 rounded-lg mt-2 transition font-medium"
              style={{
                backgroundColor: '#dc3545',
                color: '#ffffff',
              }}
            >
              🗑️ Clear Cached Location
            </button>
          )}

          {/* Test Location Button */}
          {/* <button
            onClick={() => {
              const testLocation = {
                lat: 42.3601,
                lng: -71.0589,
                accuracy: 50,
                timestamp: Date.now(),
              }
              console.log('[SettingsPage] Setting test location (Boston):', testLocation)
              setUserLocation(testLocation)
              setLocationPermissionStatus('granted')
              setLocationError(null)
            }}
            className="w-full px-4 py-2 rounded-lg mt-2 transition font-medium"
            style={{
              backgroundColor: '#999',
              color: '#ffffff',
              fontSize: '12px',
            }}
          >
            🧪 Demo: Boston (Testing Only)
          </button> */}

          {/* Instructions */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#222',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#ccc',
              lineHeight: '1.6',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#fff' }}>How it works:</p>
            <ul style={{ margin: '0', paddingLeft: '16px' }}>
              <li>Click "Enable Location" to request permission</li>
              <li>Your browser will show a permission prompt</li>
              <li>Choose "Allow" to enable location services</li>
              <li>Once enabled, use "Current Location" for directions</li>
              <li>Your location is only used when you request directions</li>
            </ul>
          </div>

          {locationPermissionStatus === 'denied' && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#4a1f1f',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#ff9999',
                lineHeight: '1.6',
              }}
            >
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#ff6b6b' }}>To re-enable location:</p>
              <ul style={{ margin: '0', paddingLeft: '16px' }}>
                <li><strong>On iPhone/iPad:</strong> Settings → Boston App → Location → Allow</li>
                <li><strong>On Android:</strong> Settings → Apps → Boston App → Permissions → Location</li>
                <li><strong>On Desktop:</strong> Check the address bar - there should be a location icon with an option to allow</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 pb-3" style={{ color: '#ffffff', borderBottom: '2px solid #ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', marginBottom: '18px'}}>
            <MapPin className="w-5 h-5" />
            Base Address (Vrbo Location)
          </div>
        </h2>

        <div>
          <p className="text-sm mb-3" style={{ color: '#ffffff' }}>
            Set your home base address for directions and transit calculations
          </p>
          <input
            type="text"
            placeholder="Enter your Airbnb or home base address"
            value={addressInput || baseAddress}
            onChange={(e) => setAddressInput(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #666',
              backgroundColor: '#555',
              color: '#ffffff',
              fontSize: '14px',
              marginBottom: '18px',
              marginTop: '18px'
            }}
          />
          <button
            onClick={() => {
              const addressToSave = addressInput || baseAddress || ''
              setBaseAddress(addressToSave)
              localStorage.setItem('baseAddress', addressToSave)
              setAddressInput('')
              
              // Sync to Firebase if itinerary is available
              if (currentItinerary?.id) {
                console.log('[SettingsPage] Syncing base address to Firebase...')
                baseAddressSyncService.syncBaseAddressToFirebase(currentItinerary.id, addressToSave).catch((error) => {
                  console.error('[SettingsPage] Failed to sync base address:', error)
                })
              }
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Save Address
          </button>
          {baseAddress && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#444',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#fff',
                marginBottom: '18px',
                marginTop: '18px'
              }}
            >
              <strong>Current address:</strong> {baseAddress}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 pb-3" style={{ color: '#ffffff', borderBottom: '2px solid #ffffff' }}>
          Share with Team
        </h2>

        <div className="flex items-center gap-4">
          <QrCode className="w-6 h-6 text-blue-500" />
          <div className="flex-1">
            <p className="font-medium" style={{ color: '#ffffff' }}>Share QR Code</p>
            <p className="text-sm mt-1" style={{ color: '#ffffff' }}>
              Display the QR code so team members can scan and join
            </p>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Show QR Code
          </button>
        </div>
      </div>

      {showQR && (
        <div 
          className="fixed bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{
            zIndex: 60,
            top: 0,
            left: 0,
            right: 0,
            bottom: '72px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div className="rounded-lg p-4 max-w-xs w-full shadow-xl" style={{ backgroundColor: '#000000' }}>
            <div className="flex justify-between items-center mb-3 pb-2" style={{ borderBottom: '2px solid #ffffff' }}>
              <h2 className="text-lg font-bold" style={{ color: '#ffffff' }}>
                Share with Team
              </h2>
              <button
                onClick={() => setShowQR(false)}
                style={{ color: '#ffffff' }}
                className="hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-3">
              <img
                src="/boston-trip-qr.png"
                alt="Boston Trip App QR Code"
                style={{ width: '200px', height: '200px', margin: '0 auto', backgroundColor: '#ffffff', padding: '4px', borderRadius: '8px' }}
              />
            </div>

            <p className="text-xs text-center mb-3 font-medium" style={{ color: '#ffffff' }}>
              Scan this QR code to access the Boston Trip App
            </p>

            <div className="bg-gray-700 dark:bg-gray-600 p-2 rounded mb-3">
              <p className="text-xs font-mono text-gray-200 break-all">
                https://boston-trip-app.vercel.app/
              </p>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
