/**
 * MBTATransit.tsx
 * Comprehensive MBTA V3 API transit tracker for Boston Trip App
 *
 * Features:
 *  - Real-time predictions with streaming support
 *  - Route + stop search
 *  - Live vehicle positions
 *  - Service alerts
 *  - Arrival countdown with auto-refresh (every 12s per MBTA best practices)
 *  - Caching via If-Modified-Since headers
 *  - Matches app design: Black Han Sans / Barlow Condensed / dark theme
 *
 * ENV: VITE_API_V3_KEY in your .env
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stop {
  id: string
  attributes: {
    name: string
    municipality: string
    platform_code: string | null
    wheelchair_boarding: number
  }
}

interface Route {
  id: string
  attributes: {
    long_name: string
    short_name: string
    color: string
    text_color: string
    type: number
    description: string
  }
}

interface Prediction {
  id: string
  attributes: {
    arrival_time: string | null
    departure_time: string | null
    direction_id: number
    status: string | null
    schedule_relationship: string | null
  }
  relationships: {
    route: { data: { id: string } }
    stop: { data: { id: string } }
    trip: { data: { id: string } }
    vehicle?: { data: { id: string } | null }
  }
}

interface Vehicle {
  id: string
  attributes: {
    bearing: number
    current_status: string
    direction_id: number
    label: string
    latitude: number
    longitude: number
    speed: number | null
    updated_at: string
  }
  relationships: {
    route: { data: { id: string } }
    stop: { data: { id: string } | null }
  }
}

interface Alert {
  id: string
  attributes: {
    header: string
    description: string | null
    effect: string
    severity: number
    active_period: Array<{ start: string; end: string | null }>
    informed_entity: Array<{
      route?: string
      stop?: string
      activities: string[]
    }>
  }
}

interface IncludedStop {
  id: string
  type: string
  attributes: { name: string; platform_code: string | null }
}

interface IncludedTrip {
  id: string
  type: string
  attributes: { headsign: string; name: string }
}

type IncludedItem = IncludedStop | IncludedTrip

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = 'https://api-v3.mbta.com'
const API_KEY = import.meta.env?.VITE_API_V3_KEY || ''

const QUICK_STOPS: Array<{ id: string; name: string; hint: string }> = [
  { id: 'place-DB-2249', name: 'Four Corners/Geneva', hint: 'Airbnb · Fairmount CR' },
  { id: 'place-pktrm',   name: 'Park Street',         hint: 'Freedom Trail · Red / Green' },
  { id: 'place-spmnl',   name: 'Science Park/West End', hint: 'Museum of Science · Green D/E' },
  { id: 'place-chmnl',   name: 'Charles/MGH',         hint: '84 Beacon St · Red Line' },
  { id: 'place-haecl',   name: 'Haymarket',            hint: 'North End · Orange / Green' },
  { id: 'place-grnst',   name: 'Green Street',         hint: 'Germania St · Orange Line' },
  { id: 'place-fenwy',   name: 'Fenway',               hint: 'Fenway Park · Green-D' },
  { id: 'place-sstat',   name: 'South Station',        hint: 'Hub · Red / CR / SL' },
  { id: 'place-north', name: 'North Station', hint: 'Orange / Green / CR' },
  { id: 'place-bomnl', name: 'Boylston', hint: 'Green' },
  { id: 'place-dwnxg', name: 'Downtown Crossing', hint: 'Red / Orange' },
  { id: 'place-knncl', name: 'Kendall/MIT', hint: 'Red' },
]

const MBTA_LINES = [
  { color: '#DA291C', textColor: '#fff', name: 'Red Line',    hint: 'Alewife ↔ Braintree/Ashmont' },
  { color: '#003DA5', textColor: '#fff', name: 'Blue Line',   hint: 'Wonderland ↔ Bowdoin' },
  { color: '#ED8B00', textColor: '#fff', name: 'Orange Line', hint: 'Oak Grove ↔ Forest Hills' },
  { color: '#00843D', textColor: '#fff', name: 'Green-B',     hint: 'Government Center ↔ Boston College' },
  { color: '#00843D', textColor: '#fff', name: 'Green-C',     hint: 'Government Center ↔ Cleveland Circle' },
  { color: '#00843D', textColor: '#fff', name: 'Green-D',     hint: 'Government Center ↔ Riverside · Fenway' },
  { color: '#00843D', textColor: '#fff', name: 'Green-E',     hint: 'Medford/Tufts ↔ Heath Street' },
  { color: '#80276C', textColor: '#fff', name: 'Commuter Rail', hint: 'Regional lines · South/North Station' },
  { color: '#7C878E', textColor: '#fff', name: 'Silver Line',  hint: 'SL1/SL2/SL3/SL4/SL5 · Bus Rapid Transit' },
  { color: '#008EAA', textColor: '#fff', name: 'Ferry',        hint: 'Harbor routes · Long Wharf / Hingham' },
];




// ─── API Helpers ──────────────────────────────────────────────────────────────

function mbtaHeaders(lastModified?: string): HeadersInit {
  const h: HeadersInit = {
    'Accept-Encoding': 'gzip',
  }
  if (API_KEY) h['x-api-key'] = API_KEY
  if (lastModified) h['If-Modified-Since'] = lastModified
  return h
}

async function mbtaFetch<T>(
  path: string,
  lastModified?: string
): Promise<{ data: T; lastModified: string | null; notModified: boolean }> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, { headers: mbtaHeaders(lastModified) })

  if (res.status === 304) {
    return { data: null as unknown as T, lastModified: lastModified ?? null, notModified: true }
  }

  if (!res.ok) throw new Error(`MBTA API error: ${res.status} ${res.statusText}`)

  const data: T = await res.json()
  const lm = res.headers.get('Last-Modified')
  return { data, lastModified: lm, notModified: false }
}

// ─── Utility Helpers ──────────────────────────────────────────────────────────

function countdownLabel(isoTime: string | null): string {
  if (!isoTime) return '—'
  const diff = Math.round((new Date(isoTime).getTime() - Date.now()) / 1000)
  if (diff < 0) return 'Now'
  if (diff < 60) return `${diff}s`
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function routeColor(route: Route | undefined): string {
  if (!route) return '#888'
  return `#${route.attributes.color || '888888'}`
}

function alertSeverityLabel(severity: number): string {
  if (severity >= 9) return 'SEVERE'
  if (severity >= 7) return 'HIGH'
  if (severity >= 4) return 'MODERATE'
  return 'INFO'
}

function alertSeverityColor(severity: number): string {
  if (severity >= 9) return '#cc2222'
  if (severity >= 7) return '#e67e00'
  if (severity >= 4) return '#2255cc'
  return '#555'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PredictionRowProps {
  prediction: Prediction
  headsign: string
  stopName: string
  route: Route | undefined
}

function PredictionRow({ prediction, headsign, stopName, route }: PredictionRowProps) {
  const { arrival_time, departure_time, schedule_relationship } = prediction.attributes
  const displayTime = departure_time || arrival_time
  const countdown = countdownLabel(displayTime)
  const isCancelled = schedule_relationship === 'CANCELLED' || schedule_relationship === 'SKIPPED'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #2a2a2a',
        gap: 12,
        opacity: isCancelled ? 0.5 : 1,
      }}
    >
      {/* Route pill */}
      <div
        style={{
          background: routeColor(route),
          color: route ? `#${route.attributes.text_color || 'ffffff'}` : '#fff',
          borderRadius: 6,
          padding: '3px 8px',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 600,
          fontSize: 13,
          minWidth: 40,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {route?.attributes.short_name || route?.id?.replace('line-', '') || '?'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Black Han Sans', Impact, sans-serif",
            fontSize: 14,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {headsign}
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          {isCancelled ? 'Cancelled' : stopName}
        </div>
      </div>

      {/* Countdown */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
          {countdown}
        </div>
      </div>
    </div>
  )
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: Alert }) {
  const [expanded, setExpanded] = useState(false)
  const sevColor = alertSeverityColor(alert.attributes.severity)
  const sevLabel = alertSeverityLabel(alert.attributes.severity)

  return (
    <div
      style={{
        background: '#1a1a1a',
        borderLeft: `3px solid ${sevColor}`,
        borderRadius: 6,
        padding: '10px 12px',
        marginBottom: 8,
        cursor: alert.attributes.description ? 'pointer' : 'default',
      }}
      onClick={() => alert.attributes.description && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ color: sevColor, fontWeight: 'bold', fontSize: 12 }}>
          {sevLabel}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {alert.attributes.header}
          </div>
          {expanded && alert.attributes.description && (
            <div style={{ color: '#ccc', fontSize: 12, marginTop: 6 }}>
              {alert.attributes.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabType = 'predictions' | 'alerts' | 'vehicles'

interface MBTATransitProps {
  defaultStopId?: string
}

export function MBTATransit({ defaultStopId }: MBTATransitProps) {
  const [searchParams] = useSearchParams()
  const stopIdParam = searchParams.get('stop') || defaultStopId

  // State
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null)
  const [showLegend, setShowLegend] = useState(false);
  const [stopSearch, setStopSearch] = useState('')
  const [stopResults, setStopResults] = useState<Stop[]>([])
  const [searching, setSearching] = useState(false)

  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [includedStops, setIncludedStops] = useState<IncludedStop[]>([])
  const [includedTrips, setIncludedTrips] = useState<IncludedTrip[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  const [loading, setLoading] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('predictions')

  // Caching refs
  const predLastMod = useRef<string | null>(null)
  const alertLastMod = useRef<string | null>(null)
  const vehicleLastMod = useRef<string | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch predictions ──────────────────────────────────────────────────────

  const fetchPredictions = useCallback(
    async (stop: Stop, silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const path =
          `/predictions?filter[stop]=${stop.id}` +
          `&include=route,trip,vehicle,stop` +
          `&fields[prediction]=arrival_time,departure_time,direction_id,status,schedule_relationship` +
          `&fields[route]=long_name,short_name,color,text_color,type,description` +
          `&fields[trip]=headsign,name` +
          `&fields[vehicle]=bearing,current_status,direction_id,label,latitude,longitude,speed,updated_at` +
          `&fields[stop]=name,platform_code` +
          `&sort=departure_time`

        const result = await mbtaFetch<{
          data: Prediction[]
          included: Array<{
            type: string
            id: string
            attributes: Record<string, unknown>
            relationships?: Record<string, unknown>
          }>
        }>(path, predLastMod.current ?? undefined)

        if (!result.notModified) {
          predLastMod.current = result.lastModified
          setPredictions(result.data?.data || [])
          if (result.data?.included) {
            setIncludedStops(result.data.included.filter((i) => i.type === 'stop') as unknown as IncludedStop[])
            setIncludedTrips(result.data.included.filter((i) => i.type === 'trip') as unknown as IncludedTrip[])
            setRoutes(result.data.included.filter((i) => i.type === 'route') as unknown as Route[])
          }
          setLastUpdated(new Date())
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load predictions')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // ── Fetch alerts ───────────────────────────────────────────────────────────

  const fetchAlerts = useCallback(
    async (stop: Stop) => {
      setLoadingAlerts(true)
      try {
        const routeIds = routes.map(r => r.id).join(',')
        const path =
          `/alerts?filter[stop]=${stop.id}` +
          (routeIds ? `&filter[route]=${routeIds}` : '') +
          `&filter[activity]=BOARD,EXIT,RIDE` +
          `&fields[alert]=header,description,effect,severity,active_period,informed_entity` +
          `&sort=-severity`

        const result = await mbtaFetch<{ data: Alert[] }>(path, alertLastMod.current ?? undefined)
        if (!result.notModified && result.data?.data) {
          alertLastMod.current = result.lastModified
          setAlerts(result.data.data)
        }
      } catch {
        // Alerts failing silently is acceptable
      } finally {
        setLoadingAlerts(false)
      }
    },
    [routes]
  )

  // ── Fetch live vehicles on this stop's routes ──────────────────────────────

  const fetchVehicles = useCallback(async () => {
    if (!routes.length) return
    setLoadingVehicles(true)
    try {
      const routeIds = routes.map(r => r.id).join(',')
      const path =
        `/vehicles?filter[route]=${routeIds}` +
        `&fields[vehicle]=bearing,current_status,direction_id,label,latitude,longitude,speed,updated_at` +
        `&include=route,stop`

      const result = await mbtaFetch<{
        data: Vehicle[]
        included: IncludedItem[]
      }>(path, vehicleLastMod.current ?? undefined)

      if (!result.notModified && result.data?.data) {
        vehicleLastMod.current = result.lastModified
        setVehicles(result.data.data)
      }
    } catch {
      // non-critical
    } finally {
      setLoadingVehicles(false)
    }
  }, [routes])

  // ── Stop search ────────────────────────────────────────────────────────────

  const searchStops = useCallback(async (query: string) => {
    if (query.length < 2) {
      setStopResults([])
      return
    }
    setSearching(true)
    try {
   const path = `/stops?filter[route_type]=1&fields[stop]=name,municipality,platform_code,wheelchair_boarding`;
   const result = await mbtaFetch<{ data: Stop[] }>(path);
    if (!result.notModified && result.data?.data) {
       const q = query.toLowerCase();
       const filtered = result.data.data.filter(
    s =>
      s.attributes.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
  );
  setStopResults(filtered.slice(0, 8));
}
    } catch {
      setStopResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  // ── Select a stop ──────────────────────────────────────────────────────────

  const selectStop = useCallback(
    async (stop: Stop) => {
      predLastMod.current = null
      alertLastMod.current = null
      vehicleLastMod.current = null
      setSelectedStop(stop)
      setStopResults([])
      setStopSearch('')
      setPredictions([])
      setAlerts([])
      setVehicles([])
      setRoutes([])
      await fetchPredictions(stop)
    },
    [fetchPredictions]
  )

  // ── Quick stop select ──────────────────────────────────────────────────────

  const selectQuickStop = useCallback(
    async (qs: { id: string; name: string }) => {
      const stop: Stop = {
        id: qs.id,
        attributes: {
          name: qs.name,
          municipality: 'Boston',
          platform_code: null,
          wheelchair_boarding: 1,
        },
      }
      await selectStop(stop)
    },
    [selectStop]
  )

  // ── Auto-select stop from URL param on mount ───────────────────────────────

  useEffect(() => {
    if (stopIdParam && !selectedStop) {
      const quickStop = QUICK_STOPS.find(qs => qs.id === stopIdParam)
      if (quickStop) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        selectQuickStop(quickStop)
      }
    }
  }, [stopIdParam, selectedStop, selectQuickStop])

  // ── Auto-refresh every 12s (MBTA best practice) ───────────────────────────

  useEffect(() => {
    if (!selectedStop) return
    if (refreshTimer.current) clearInterval(refreshTimer.current)
    refreshTimer.current = setInterval(() => {
      fetchPredictions(selectedStop, true)
    }, 12_000)
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current)
    }
  }, [selectedStop, fetchPredictions])

  // ── Fetch alerts when routes are loaded ───────────────────────────────────

  useEffect(() => {
    if (selectedStop && routes.length > 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchAlerts(selectedStop)
    }
  }, [selectedStop, routes, fetchAlerts])

  // ── Fetch vehicles when tab switches ─────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'vehicles' && routes.length > 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchVehicles()
    }
  }, [activeTab, routes, fetchVehicles])

  // ── Debounced stop search ─────────────────────────────────────────────────

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchStops(stopSearch), 350)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [stopSearch, searchStops])

  // ── Lookup helpers ────────────────────────────────────────────────────────

  function getTrip(id: string): IncludedTrip | undefined {
    return includedTrips.find(t => t.id === id)
  }

  function getRoute(id: string): Route | undefined {
    return routes.find(r => r.id === id)
  }

  function getStop(id: string): IncludedStop | undefined {
    return includedStops.find(s => s.id === id)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const navigate = useNavigate()
  const hasStopIdParam = !!stopIdParam

  return (
    <div
      style={{
        background: '#0d0d0d',
        height: '100%',
        fontFamily: "'Barlow Condensed', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Page Header */}
      <div style={{ background: '#0d0d0d', padding: '20px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        {/* Return Button (shown when navigated from event card) */}
        {hasStopIdParam && (
          <button
            onClick={() => navigate('/dayview')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
            }}
            aria-label="Return to events"
          >
            <img
              src="/icons/return-wht.png"
              alt="Return"
              style={{
                height: '24px',
                width: '24px',
                objectFit: 'contain',
              }}
            />
          </button>
        )}
        <h1
          style={{
            fontFamily: "'Black Han Sans', Impact, sans-serif",
            fontSize: 'clamp(28px, 8vw, 44px)',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            margin: 0,
            lineHeight: '1',
            flex: 1,
          }}
        >
          TRANSIT
        </h1>
      </div>

      {/* Stop Search */}
      <div style={{ padding: '14px 14px 0', position: 'relative', flex: 1, overflowY: 'auto' }}>
        {/* <input
          type="text"
          placeholder="Search stops or stations..."
          value={stopSearch}
          onChange={e => setStopSearch(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#fff',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            outline: 'none',
          }}
        /> */}

        {/* Stop Suggestions Dropdown */}
        {stopSearch.length >= 2 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 14,
              right: 14,
              background: '#1a1a1a',
              border: '1px solid #333',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              maxHeight: 200,
              overflowY: 'auto',
              zIndex: 10,
            }}
          >
            {searching ? (
              <div style={{ padding: '12px', color: '#999', textAlign: 'center' }}>
                Searching...
              </div>
            ) : stopResults.length > 0 ? (
              stopResults.map(stop => (
                <button
                  key={stop.id}
                  onClick={() => selectStop(stop)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #2a2a2a',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  {stop.attributes.name}
                  {stop.attributes.municipality && <span style={{ color: '#999' }}> · {stop.attributes.municipality}</span>}
                </button>
              ))
            ) : (
              <div style={{ padding: '12px', color: '#999', textAlign: 'center' }}>
                No results found
              </div>
            )}
          </div>
        )}

        {/* Quick Stops */}
        {!selectedStop && (
          <div style={{ padding: '14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase' }}>
                Popular Stops
              </div>
              <button
                onClick={() => setShowLegend(true)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 6,
                  padding: '6px 12px',
                  color: '#888',
                  cursor: 'pointer',
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>🗺</span> Line Legend
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_STOPS.map(qs => (
                <button
                  key={qs.id}
                  onClick={() => selectQuickStop(qs)}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: 6,
                    padding: '6px 10px',
                    color: '#fff',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    ;(e.target as HTMLButtonElement).style.borderColor = '#2255cc'
                    ;(e.target as HTMLButtonElement).style.color = '#2255cc'
                  }}
                  onMouseLeave={e => {
                    ;(e.target as HTMLButtonElement).style.borderColor = '#333'
                    ;(e.target as HTMLButtonElement).style.color = '#fff'
                  }}
                >
                  {qs.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected stop content */}
        {selectedStop && (
          <div style={{ padding: '14px 0' }}>
            {/* Stop name and info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
                paddingBottom: 12,
                borderBottom: '1px solid #2a2a2a',
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Black Han Sans', Impact, sans-serif",
                    fontSize: 18,
                    color: '#fff',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedStop.attributes.name}
                </h2>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {selectedStop.attributes.municipality}
                  {selectedStop.attributes.platform_code && ` · Platform ${selectedStop.attributes.platform_code}`}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStop(null)
                  setStopSearch('')
                }}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 4,
                  padding: '6px 10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Change
              </button>
            </div>

            {/* Legend button for selected stop */}
            <div style={{ padding: '12px 0 0 0', display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                onClick={() => setShowLegend(true)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: 6,
                  padding: '6px 12px',
                  color: '#888',
                  cursor: 'pointer',
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 13,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>🗺</span> Line Legend
              </button>
            </div>

            {/* Tabs */}
            {routes.length > 0 && (
              <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderBottom: '1px solid #2a2a2a' }}>
                {(['predictions', 'alerts', 'vehicles'] as TabType[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: activeTab === tab ? '#2255cc' : '#999',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: activeTab === tab ? '2px solid #2255cc' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'alerts' && alerts.length > 0 && (
                      <span style={{ marginLeft: 6, color: '#e67e00' }}>({alerts.length})</span>
                    )}
                    {tab === 'vehicles' && vehicles.length > 0 && (
                      <span style={{ marginLeft: 6, color: '#2255cc' }}>({vehicles.length})</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                style={{
                  background: '#2a1a1a',
                  border: '1px solid #8b3333',
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 12,
                  color: '#ff9999',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading predictions...
              </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && !loading && (
              <div>
                {predictions.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8, marginTop: 12 }}>
                      Next Arrivals
                      {lastUpdated && (
                        <span style={{ marginLeft: 8 }}>
                          (Updated {lastUpdated.toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                    {predictions.map(pred => {
                      const trip = getTrip(pred.relationships.trip.data.id)
                      const route = getRoute(pred.relationships.route.data.id)
                      const stopData = getStop(pred.relationships.stop.data.id)
                      return (
                        <PredictionRow
                          key={pred.id}
                          prediction={pred}
                          headsign={trip?.attributes.headsign || 'Unknown'}
                          stopName={stopData?.attributes.name || 'Unknown Stop'}
                          route={route}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No predictions available
                  </div>
                )}
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                {loadingAlerts ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading alerts...
                  </div>
                ) : alerts.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    {alerts.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No active alerts
                  </div>
                )}
              </div>
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div>
                {loadingVehicles ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading vehicles...
                  </div>
                ) : vehicles.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                      Active Vehicles ({vehicles.length})
                    </div>
                    {vehicles.map(vehicle => {
                      const route = getRoute(vehicle.relationships.route.data.id)
                      return (
                        <div
                          key={vehicle.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid #2a2a2a',
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              background: routeColor(route),
                              color: route ? `#${route.attributes.text_color || 'fff'}` : '#fff',
                              borderRadius: 6,
                              padding: '3px 8px',
                              fontWeight: 600,
                              fontSize: 13,
                              minWidth: 40,
                              textAlign: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {route?.attributes.short_name || '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                              {vehicle.attributes.label}
                            </div>
                            <div style={{ fontSize: 12, color: '#999' }}>
                              {vehicle.attributes.current_status}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No active vehicles
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Legend Modal */}
      {showLegend && (
        <div
          onClick={() => setShowLegend(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111',
              width: '100%',
              borderRadius: '16px 16px 0 0',
              padding: '20px 16px 40px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle bar */}
            <div style={{ width: 40, height: 4, background: '#333', borderRadius: 2, margin: '0 auto 20px' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: "'Black Han Sans', Impact, sans-serif",
                  fontSize: 20,
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                MBTA Lines
              </div>
              <button
                onClick={() => setShowLegend(false)}
                style={{
                  background: '#2a2a2a',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            {/* Your trip stops callout */}
            <div
              style={{
                background: '#1a1a1a',
                borderLeft: '3px solid #2255cc',
                borderRadius: 6,
                padding: '10px 12px',
                marginBottom: 16,
                fontFamily: "'Barlow Condensed'",
                fontSize: 13,
                color: '#888',
                lineHeight: 1.5,
              }}
            >
              Your trip uses: <span style={{ color: '#fff' }}>Green-D</span> (Fenway) ·{' '}
              <span style={{ color: '#fff' }}>Orange</span> (Green St, Haymarket) ·{' '}
              <span style={{ color: '#fff' }}>Red</span> (Charles/MGH, Park St) ·{' '}
              <span style={{ color: '#fff' }}>Fairmount CR</span> (Four Corners/Geneva)
            </div>

            {/* Line rows */}
            {MBTA_LINES.map(line => (
              <div
                key={line.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #1e1e1e',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: line.color,
                    color: line.textColor,
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontFamily: "'Barlow Condensed'",
                    fontWeight: 600,
                    fontSize: 13,
                    minWidth: 90,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {line.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed'",
                    fontSize: 13,
                    color: '#888',
                    lineHeight: 1.4,
                  }}
                >
                  {line.hint}
                </div>
              </div>
            ))}

            <div
              style={{
                fontFamily: "'Barlow Condensed'",
                fontSize: 11,
                color: '#444',
                textAlign: 'center',
                marginTop: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Tap anywhere outside to close
            </div>
          </div>
        </div>
      )}    </div>
  )
}
