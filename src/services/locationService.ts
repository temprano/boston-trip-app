// Geolocation service for real-time location tracking
export interface UserLocation {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export interface PermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
  error?: string
}

export const locationService = {
  // Check browser geolocation support
  isSupported(): boolean {
    return 'geolocation' in navigator
  },

  // Get current position once
  async getCurrentPosition(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        console.error('[locationService] Geolocation not supported')
        reject(new Error('Geolocation not supported'))
        return
      }

      console.log('[locationService] Requesting current position...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          console.log('[locationService] ✓ Got location:', location)
          resolve(location)
        },
        (error) => {
          console.error('[locationService] ✗ Geolocation error:', error.code, error.message)
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  },

  // Watch position in real-time
  watchPosition(
    onSuccess: (location: UserLocation) => void,
    onError?: (error: Error) => void
  ): number {
    if (!this.isSupported()) {
      onError?.(new Error('Geolocation not supported'))
      return -1
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        onError?.(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  },

  // Stop watching position
  stopWatching(watchId: number): void {
    if (watchId !== -1) {
      navigator.geolocation.clearWatch(watchId)
    }
  },

  // Get permission status
  async getPermissionStatus(): Promise<PermissionStatus> {
    if (!this.isSupported()) {
      return {
        granted: false,
        denied: false,
        prompt: false,
        error: 'Geolocation not supported',
      }
    }

    if (!('permissions' in navigator)) {
      // Permissions API not available, assume prompt
      return { granted: false, denied: false, prompt: true }
    }

    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation',
      })

      return {
        granted: permission.state === 'granted',
        denied: permission.state === 'denied',
        prompt: permission.state === 'prompt',
      }
    } catch (error) {
      return {
        granted: false,
        denied: false,
        prompt: false,
        error: 'Failed to check permissions',
      }
    }
  },

  // Reverse geocoding - convert lat/lng to address (requires external API)
  async getAddress(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      if (!response.ok) throw new Error('Failed to reverse geocode')
      const data = await response.json()
      return data.address?.city || data.address?.county || 'Unknown location'
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  },

  // Calculate bearing between two points (0-360 degrees)
  calculateBearing(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const dLon = ((to.lng - from.lng) * Math.PI) / 180
    const y = Math.sin(dLon) * Math.cos((to.lat * Math.PI) / 180)
    const x =
      Math.cos((from.lat * Math.PI) / 180) *
        Math.sin((to.lat * Math.PI) / 180) -
      Math.sin((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.cos(dLon)
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
  },
}

