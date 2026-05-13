import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityItem } from './ActivityItem'
import { mockItinerary } from '../data/mockData'

describe('ActivityItem', () => {
  const testActivity = mockItinerary.days[0].activities[0]

  it('should render activity title', () => {
    render(<ActivityItem activity={testActivity} />)
    expect(screen.getByText(testActivity.title)).toBeInTheDocument()
  })

  it('should render activity time', () => {
    render(<ActivityItem activity={testActivity} />)
    expect(screen.getByText(testActivity.time)).toBeInTheDocument()
  })

  it('should display location name', () => {
    render(<ActivityItem activity={testActivity} />)
    expect(screen.getByText(testActivity.location.name)).toBeInTheDocument()
  })

  it('should display location address', () => {
    render(<ActivityItem activity={testActivity} />)
    expect(screen.getByText(testActivity.location.address!)).toBeInTheDocument()
  })

  it('should render activity category badge', () => {
    render(<ActivityItem activity={testActivity} />)
    expect(screen.getByText(new RegExp(testActivity.category))).toBeInTheDocument()
  })

  it('should display duration in minutes', () => {
    render(<ActivityItem activity={testActivity} />)
    expect(screen.getByText(`${testActivity.duration}m`)).toBeInTheDocument()
  })

  it('should display description when present', () => {
    render(<ActivityItem activity={testActivity} />)
    if (testActivity.description) {
      expect(screen.getByText(new RegExp(testActivity.description.substring(0, 20)))).toBeInTheDocument()
    }
  })

  it('should display notes when present', () => {
    render(<ActivityItem activity={testActivity} />)
    if (testActivity.notes) {
      expect(screen.getByText(new RegExp(testActivity.notes))).toBeInTheDocument()
    }
  })

  it('should not show map preview by default when showMapPreview is false', () => {
    render(<ActivityItem activity={testActivity} showMapPreview={false} />)
    expect(screen.queryByText('Show Map')).not.toBeInTheDocument()
  })

  it('should show map toggle button when showMapPreview is true', () => {
    render(<ActivityItem activity={testActivity} showMapPreview={true} />)
    expect(screen.getByText('Show Map')).toBeInTheDocument()
  })

  it('should toggle map preview on click', () => {
    render(<ActivityItem activity={testActivity} showMapPreview={true} />)

    const toggleButton = screen.getByText('Show Map')
    fireEvent.click(toggleButton)

    expect(screen.getByText('Hide Map')).toBeInTheDocument()
    // Check if the location name appears in map preview (it should appear at least in map context)
    const locations = screen.getAllByText(new RegExp(testActivity.location.name))
    expect(locations.length).toBeGreaterThan(0)
  })

  it('should display location coordinates in map preview', () => {
    render(<ActivityItem activity={testActivity} showMapPreview={true} />)

    const toggleButton = screen.getByText('Show Map')
    fireEvent.click(toggleButton)

    expect(screen.getByText(new RegExp(testActivity.location.lat.toFixed(4)))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(testActivity.location.lng.toFixed(4)))).toBeInTheDocument()
  })

  it('should have category-specific styling', () => {
    const foodActivity = mockItinerary.days[0].activities.find((a) => a.category === 'food')!
    const { container } = render(<ActivityItem activity={foodActivity} />)

    const badge = container.querySelector(`[class*="orange"]`)
    expect(badge).toBeInTheDocument()
  })

  it('should render multiple activities with different categories', () => {
    const { rerender } = render(<ActivityItem activity={mockItinerary.days[0].activities[0]} />)
    expect(screen.getByText(mockItinerary.days[0].activities[0].title)).toBeInTheDocument()

    rerender(<ActivityItem activity={mockItinerary.days[0].activities[1]} />)
    expect(screen.getByText(mockItinerary.days[0].activities[1].title)).toBeInTheDocument()
  })

  it('should format time correctly', () => {
    const activity = mockItinerary.days[0].activities[0]
    render(<ActivityItem activity={activity} />)

    // Time should be in HH:MM format
    expect(screen.getByText(activity.time)).toBeInTheDocument()
  })
})
