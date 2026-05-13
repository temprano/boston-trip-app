import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { NearbyPlacesWidget } from './NearbyPlacesWidget'
import { Location } from '../../services/mapsService'

describe('NearbyPlacesWidget', () => {
  const bostonLocation: Location = { lat: 42.36, lng: -71.06 }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(
      <NearbyPlacesWidget
        location={bostonLocation}
        placeType="restaurant"
      />
    )
    expect(screen.getByText(/Loading restaurant/)).toBeInTheDocument()
  })

  it('should fetch and display nearby places', async () => {
    render(
      <NearbyPlacesWidget
        location={bostonLocation}
        placeType="restaurant"
        title="Nearby Restaurants"
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading restaurant/)).not.toBeInTheDocument()
    })

    expect(screen.getByText('Nearby Restaurants')).toBeInTheDocument()
  })

  it('should display place details', async () => {
    render(
      <NearbyPlacesWidget
        location={bostonLocation}
        placeType="cafe"
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading cafe/)).not.toBeInTheDocument()
    })

    // Should show at least place names and addresses
    const placeNames = screen.queryAllByText(/restaurant|cafe|place/i)
    expect(placeNames.length).toBeGreaterThan(0)
  })

  it('should respect maxResults prop', async () => {
    const { container } = render(
      <NearbyPlacesWidget
        location={bostonLocation}
        placeType="restaurant"
        maxResults={3}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading restaurant/)).not.toBeInTheDocument()
    })

    // Check that no more than 3 + 1 place cards are shown (title + max results)
    const placeCards = container.querySelectorAll(
      '[class*="bg-gray-50"]'
    ).length
    expect(placeCards).toBeLessThanOrEqual(3)
  })

  it('should display result count badge', async () => {
    const { container } = render(
      <NearbyPlacesWidget
        location={bostonLocation}
        placeType="restaurant"
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Loading restaurant/)).not.toBeInTheDocument()
    })

    // Should show count badge - look for it in a specific blue container
    const badge = container.querySelector(
      '.bg-blue-100'
    )
    expect(badge).toBeInTheDocument()
  })
})
