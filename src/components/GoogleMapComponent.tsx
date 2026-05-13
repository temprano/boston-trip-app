import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { Event, GooglePlace, MapFilters, MapMarkerColors } from '../types'
import { googlePlacesService } from '../services/googlePlacesService'

interface GoogleMapComponentProps {
  event: Event
}

// Marker colors for different place types
const MARKER_COLORS: MapMarkerColors = {
  restaurant: '#FF6B6B',
  bar: '#4ECDC4',
  museum: '#FFE66D',
  tourist_attraction: '#95E1D3',
  event: '#2255CC',
}

export function GoogleMapComponent({ event }: GoogleMapComponentProps) {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [places, setPlaces] = useState<GooglePlace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<GooglePlace | null>(null)
  const [filters, setFilters] = useState<MapFilters>({
    restaurants: true,
    bars: false,
    museums: false,
    touristAttractions: false,
  })

  // Combine address parts for geocoding
  const fullAddress = `${event.address.line1}, ${event.address.line2}`

  // Initialize map and fetch places
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Geocode the address
        const coordinates = await googlePlacesService.geocodeAddress(fullAddress)
        setMapCenter(coordinates)

        // Fetch nearby places for selected filters
        const selectedTypes = Object.entries(filters)
          .filter(([, isSelected]) => isSelected)
          .map(([type]) => {
            const typeMap: Record<string, 'restaurant' | 'bar' | 'museum' | 'tourist_attraction'> = {
              restaurants: 'restaurant',
              bars: 'bar',
              museums: 'museum',
              touristAttractions: 'tourist_attraction',
            }
            return typeMap[type]
          })

        if (selectedTypes.length > 0) {
          const placesByType = await googlePlacesService.getNearbyPlacesByTypes(
            coordinates.lat,
            coordinates.lng,
            selectedTypes,
            800 // 800m walking distance
          )

          // Flatten results from all types
          const allPlaces = Object.values(placesByType).flat()
          setPlaces(allPlaces)
        } else {
          setPlaces([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map')
        console.error('Map initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeMap()
  }, [fullAddress, filters])

  // Handle filter changes
  const handleFilterChange = (filterType: keyof MapFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#d32f2f', textAlign: 'center' }}>
        <p>Error loading map: {error}</p>
      </div>
    )
  }

  if (isLoading || !mapCenter) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#666666' }}>
        <p>Loading map and nearby places...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Map Container */}
      <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
        <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={mapCenter} zoom={15}>
          {/* Event Location Marker */}
          <Marker
            position={mapCenter}
            title={event.venue}
            icon={{
              path: 'M 0,0 C -2,-2 -2,-6 0,-8 C 2,-6 2,-2 0,0 Z',
              fillColor: MARKER_COLORS.event,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 2,
            }}
            onClick={() => {
              setSelectedMarker({
                id: 'event-' + event.id,
                name: event.venue,
                type: 'restaurant',
                lat: mapCenter.lat,
                lng: mapCenter.lng,
                address: fullAddress,
              })
            }}
          />

          {/* Place Markers */}
          {places.map((place) => (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.name}
              icon={{
                path: 'M 0,0 C -2,-2 -2,-6 0,-8 C 2,-6 2,-2 0,0 Z',
                fillColor: MARKER_COLORS[place.type],
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 1.5,
                scale: 1.5,
              }}
              onClick={() => setSelectedMarker(place)}
            />
          ))}

          {/* Info Window */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div style={{ color: '#000000', maxWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                  {selectedMarker.name}
                </h3>
                {selectedMarker.rating && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>⭐ {selectedMarker.rating.toFixed(1)}</p>
                )}
                {selectedMarker.address && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#666666' }}>
                    {selectedMarker.address}
                  </p>
                )}
                {selectedMarker.phone && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px' }}>📞 {selectedMarker.phone}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>
          Nearby Places
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={filters.restaurants}
              onChange={() => handleFilterChange('restaurants')}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: MARKER_COLORS.restaurant,
                borderRadius: '2px',
                marginRight: '4px',
              }}
            />
            <span style={{ fontSize: '13px', color: '#333333' }}>
              Restaurants ({places.filter((p) => p.type === 'restaurant').length})
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={filters.bars}
              onChange={() => handleFilterChange('bars')}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: MARKER_COLORS.bar,
                borderRadius: '2px',
                marginRight: '4px',
              }}
            />
            <span style={{ fontSize: '13px', color: '#333333' }}>
              Bars ({places.filter((p) => p.type === 'bar').length})
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={filters.museums}
              onChange={() => handleFilterChange('museums')}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: MARKER_COLORS.museum,
                borderRadius: '2px',
                marginRight: '4px',
              }}
            />
            <span style={{ fontSize: '13px', color: '#333333' }}>
              Museums ({places.filter((p) => p.type === 'museum').length})
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={filters.touristAttractions}
              onChange={() => handleFilterChange('touristAttractions')}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: MARKER_COLORS.tourist_attraction,
                borderRadius: '2px',
                marginRight: '4px',
              }}
            />
            <span style={{ fontSize: '13px', color: '#333333' }}>
              Tourist Attractions ({places.filter((p) => p.type === 'tourist_attraction').length})
            </span>
          </label>
        </div>
      </div>

      {/* Event Location Info */}
      <div style={{ padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#000000' }}>
          📍 {event.venue}
        </h4>
        <p style={{ margin: '0', fontSize: '12px', color: '#666666', lineHeight: '1.4' }}>
          {event.address.line1}
          <br />
          {event.address.line2}
        </p>
      </div>
    </div>
  )
}
