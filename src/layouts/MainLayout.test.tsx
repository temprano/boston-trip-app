import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { MainLayout } from './MainLayout'
import { ItineraryPage, TravelersPage, SettingsPage } from '../pages'
import { useAppStore } from '../store'

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <ItineraryPage /> },
      { path: '/team', element: <TravelersPage /> },
      { path: '/dayview', element: <ItineraryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]

describe('MainLayout', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentItinerary: null,
      travelers: [],
      isOffline: false,
      theme: 'light',
    })
  })

  it('should render header with app title', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    expect(screen.getByText('BOSTON')).toBeInTheDocument()
    expect(screen.getByText('MORE THAN A FEELING')).toBeInTheDocument()
  })

  it('should render tab navigation buttons', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(4) // 4 nav tabs: Home, Team, DayView, Settings
  })

  it('should render footer with copyright', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    // Updated to check for BottomNav buttons by aria-label (images, no text)
    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(screen.getByLabelText('Team')).toBeInTheDocument()
    expect(screen.getByLabelText('DayView')).toBeInTheDocument()
    expect(screen.getByLabelText('Settings')).toBeInTheDocument()
  })

  it('should render outlet for child routes', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    render(<RouterProvider router={router} />)

    // Default route should render ItineraryPage content
    expect(screen.getByText('No itinerary loaded')).toBeInTheDocument()
  })
})
