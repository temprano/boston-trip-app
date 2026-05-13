import { useState } from 'react'
import { useAppStore } from '../store'
import { QrCode, X } from 'lucide-react'
import { WeatherWidget } from '../components/weather'

export function SettingsPage() {
  const [showQR, setShowQR] = useState(false)
  const isOffline = useAppStore((state) => state.isOffline)
  const setIsOffline = useAppStore((state) => state.setIsOffline)

  return (
    <div className="space-y-6 pb-24" style={{ color: '#ffffff', padding: '24px 32px' }}>
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
          Settings
        </h1>
        <p className="font-medium" style={{ color: '#ffffff' }}>
          Configure app preferences and behavior
        </p>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
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
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-4 max-w-xs w-full shadow-xl">
            <div className="flex justify-between items-center mb-3">
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
                https://boston-trip-4lvp9y2xa-tempranos-projects.vercel.app/
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

      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
          Weather
        </h2>
        <WeatherWidget title="Boston Current Weather" />
      </div>
    </div>
  )
}
