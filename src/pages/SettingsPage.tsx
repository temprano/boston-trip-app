import { useAppStore } from '../store'
import { Sun, Moon } from 'lucide-react'
import { WeatherWidget } from '../components/weather'

export function SettingsPage() {
  const theme = useAppStore((state) => state.theme)
  const isOffline = useAppStore((state) => state.isOffline)
  const setTheme = useAppStore((state) => state.setTheme)
  const setIsOffline = useAppStore((state) => state.setIsOffline)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure app preferences and behavior
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <span className="text-gray-700 dark:text-gray-300">Theme</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-lg transition ${
                theme === 'light'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connectivity
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-700 dark:text-gray-300">
              Offline Mode
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weather
        </h2>
        <WeatherWidget title="Boston Current Weather" />
      </div>
      </div>
    </div>
  )
}
