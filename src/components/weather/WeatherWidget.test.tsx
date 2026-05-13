import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { WeatherWidget } from './WeatherWidget'

describe('WeatherWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(<WeatherWidget />)
    expect(screen.getByText('Loading weather...')).toBeInTheDocument()
  })

  it('should fetch and display current weather', async () => {
    render(<WeatherWidget />)

    // Wait for weather data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading weather...')).not.toBeInTheDocument()
    })

    // Check for weather display
    expect(screen.getByText('Boston Weather')).toBeInTheDocument()
    expect(screen.getByText(/Feels like/)).toBeInTheDocument()
    // Temperature might be split across elements, so check for just the number
    const tempElements = screen.queryAllByText(/\d+/)
    expect(tempElements.length).toBeGreaterThan(0)
  })

  it('should display weather details', async () => {
    render(<WeatherWidget />)

    await waitFor(() => {
      expect(screen.queryByText('Loading weather...')).not.toBeInTheDocument()
    })

    // Check for detail sections
    expect(screen.getByText('Humidity')).toBeInTheDocument()
    expect(screen.getByText('Wind')).toBeInTheDocument()
    expect(screen.getByText('Clouds')).toBeInTheDocument()
    expect(screen.getByText('Pressure')).toBeInTheDocument()
  })

  it('should render compact version when compact prop is true', async () => {
    render(<WeatherWidget compact={true} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading weather...')).not.toBeInTheDocument()
    })

    // In compact mode, should still show basic info but simplified layout
    expect(screen.getByText('Boston Weather')).toBeInTheDocument()
  })

  it('should accept custom title and coordinates', async () => {
    render(<WeatherWidget title="Test Weather" lat={40.7128} lon={-74.006} />)

    await waitFor(() => {
      expect(screen.queryByText('Loading weather...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Test Weather')).toBeInTheDocument()
  })

  it('should display weather description', async () => {
    render(<WeatherWidget />)

    await waitFor(() => {
      expect(screen.queryByText('Loading weather...')).not.toBeInTheDocument()
    })

    // Should show description (capitalized from API response)
    const description = screen.getByText(/clear|cloudy|rainy|sunny|partly/i)
    expect(description).toBeInTheDocument()
  })
})
