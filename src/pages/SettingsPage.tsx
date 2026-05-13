import { useState } from 'react'
import { useAppStore } from '../store'
import { QrCode, X } from 'lucide-react'
import { WeatherWidget } from '../components/weather'

export function SettingsPage() {
  const [showQR, setShowQR] = useState(false)
  const isOffline = useAppStore((state) => state.isOffline)
  const setIsOffline = useAppStore((state) => state.setIsOffline)

  return (
    <div className="space-y-6 px-4 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-white">
          Configure app preferences and behavior
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connectivity
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-white">
              Offline Mode
            </span>
            <p className="text-sm text-white mt-1">
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

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Share with Team
        </h2>

        <div className="flex items-center gap-4">
          <QrCode className="w-6 h-6 text-blue-500" />
          <div className="flex-1">
            <p className="text-white font-medium">Share QR Code</p>
            <p className="text-sm text-white mt-1">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Share with Team
              </h2>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-4">
              <img
                src="/boston-trip-qr.png"
                alt="Boston Trip App QR Code"
                className="w-48 h-48 mx-auto bg-white p-2 rounded-lg"
              />
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-4">
              Scan this QR code to access the Boston Trip App
            </p>

            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                https://boston-trip-4lvp9y2xa-tempranos-projects.vercel.app/
              </p>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weather
        </h2>
        <WeatherWidget title="Boston Current Weather" />
      </div>
    </div>
  )
}
