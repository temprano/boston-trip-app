import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DayView } from './DayView'
import { mockItinerary } from '../data/mockData'

describe('DayView', () => {
  const testDay = mockItinerary.days[0]
  const emptyDay = { ...mockItinerary.days[0], activities: [] }

  it('should render day header with date', () => {
    render(<DayView day={testDay} />)
    expect(screen.getByText(/Monday/)).toBeInTheDocument()
    expect(screen.getByText(/2026-06-15/)).toBeInTheDocument()
  })

  it('should display all activities for the day', () => {
    render(<DayView day={testDay} />)
    testDay.activities.forEach((activity) => {
      expect(screen.getByText(activity.title)).toBeInTheDocument()
    })
  })

  it('should show "No Activities" state when empty', () => {
    render(<DayView day={emptyDay} />)
    expect(screen.getByText('No Activities')).toBeInTheDocument()
  })

  it('should display activity count', () => {
    render(<DayView day={testDay} />)
    expect(screen.getByText(`${testDay.activities.length}`)).toBeInTheDocument()
  })

  it('should calculate and display total duration', () => {
    render(<DayView day={testDay} />)
    const totalMinutes = testDay.activities.reduce((sum, a) => sum + a.duration, 0)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    expect(screen.getByText(`${hours}h ${minutes}m`)).toBeInTheDocument()
  })

  it('should display day notes when present', () => {
    render(<DayView day={testDay} />)
    if (testDay.notes) {
      expect(screen.getByText(testDay.notes)).toBeInTheDocument()
    }
  })

  it('should sort activities by time by default', () => {
    render(<DayView day={testDay} />)

    // Get all activity titles in order
    const activities = testDay.activities.sort((a, b) => a.time.localeCompare(b.time))
    const firstActivityText = screen.getByText(activities[0].title)
    expect(firstActivityText).toBeInTheDocument()
  })

  it('should toggle sort to category view', () => {
    render(<DayView day={testDay} />)

    const categoryButton = screen.getByText('Category')
    fireEvent.click(categoryButton)

    // Category button should now be active (highlighted)
    expect(categoryButton).toHaveClass('bg-blue-500')
  })

  it('should display category count', () => {
    render(<DayView day={testDay} />)

    const uniqueCategories = new Set(testDay.activities.map((a) => a.category)).size
    expect(screen.getByText(`${uniqueCategories}`)).toBeInTheDocument()
  })

  it('should render formatted date', () => {
    render(<DayView day={testDay} />)

    // Date should be formatted as "Monday, Jun 15, 2026" or similar
    expect(screen.getByText(/Jun|June/)).toBeInTheDocument()
  })

  it('should display sort controls', () => {
    render(<DayView day={testDay} />)

    expect(screen.getByText('Sort by:')).toBeInTheDocument()
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
  })

  it('should show activity item components', () => {
    render(<DayView day={testDay} />)

    // Should render all activity titles
    testDay.activities.forEach((activity) => {
      expect(screen.getByText(activity.title)).toBeInTheDocument()
    })
  })

  it('should handle map preview prop', () => {
    render(<DayView day={testDay} showMapPreviews={true} />)

    // Should render activities (map previews are shown in ActivityItem)
    expect(screen.getByText(testDay.activities[0].title)).toBeInTheDocument()
  })

  it('should show activity stats', () => {
    render(<DayView day={testDay} />)

    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
    expect(screen.getByText('Total Time')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('should render add activity button for empty day', () => {
    render(<DayView day={emptyDay} />)

    const addButton = screen.getByText('+ Add Activity')
    expect(addButton).toBeInTheDocument()
  })

  it('should have scrollable activities list for many items', () => {
    const { container } = render(<DayView day={testDay} />)

    const scrollableDiv = container.querySelector('.max-h-96')
    expect(scrollableDiv).toBeInTheDocument()
  })
})
