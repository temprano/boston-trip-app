import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DirectionsWidget } from './DirectionsWidget'
import { Location } from '../../services/mapsService'

describe('DirectionsWidget', () => {
  const bostonLocation: Location = { lat: 42.36, lng: -71.06 }
  const cambridgeLocation: Location = { lat: 42.3736, lng: -71.1097 }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(
      <DirectionsWidget
        origin={bostonLocation}
        destination={cambridgeLocation}
      />
    )
    expect(screen.getByText(/Loading directions/)).toBeInTheDocument()
  })

  it('should fetch and display directions', async () => {
    render(
      <DirectionsWidget
        origin={bostonLocation}
        destination={cambridgeLocation}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading directions/)).not.toBeInTheDocument()
    })

    expect(screen.getByText('Directions')).toBeInTheDocument()
    expect(screen.getByText(/Distance/)).toBeInTheDocument()
    expect(screen.getByText(/Duration/)).toBeInTheDocument()
  })

  it('should render compact version', async () => {
    render(
      <DirectionsWidget
        origin={bostonLocation}
        destination={cambridgeLocation}
        compact={true}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading directions/)).not.toBeInTheDocument()
    })

    // Compact version should still show distance and duration
    const distanceElements = screen.queryAllByText(/Distance|km/)
    expect(distanceElements.length).toBeGreaterThan(0)
  })

  it('should display route steps', async () => {
    render(
      <DirectionsWidget
        origin={bostonLocation}
        destination={cambridgeLocation}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading directions/)).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Route/)).toBeInTheDocument()
  })
})
