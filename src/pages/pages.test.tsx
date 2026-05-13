import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { ItineraryPage, TravelersPage, SettingsPage } from './index'
import { MainLayout } from '../layouts'
import { useAppStore } from '../store'
import { mockItinerary, mockTravelers } from '../data/mockData'

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <ItineraryPage /> },
      { path: '/travelers', element: <TravelersPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]

describe('Pages', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentItinerary: null,
      travelers: [],
      isOffline: false,
      theme: 'light',
    })
  })

  describe('ItineraryPage', () => {
    it('should render empty state when no itinerary', () => {
      const router = createMemoryRouter(routes, { initialEntries: ['/'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText('No itinerary loaded')).toBeInTheDocument()
    })

    it('should display itinerary with activities', () => {
      useAppStore.setState({ currentItinerary: mockItinerary })

      const router = createMemoryRouter(routes, { initialEntries: ['/'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText('Boston Adventure 2026')).toBeInTheDocument()
    })
  })

  describe('TravelersPage', () => {
    it('should render empty state', () => {
      const router = createMemoryRouter(routes, { initialEntries: ['/travelers'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText('No travelers added yet')).toBeInTheDocument()
    })

    it('should display travelers', () => {
      useAppStore.setState({ travelers: mockTravelers })

      const router = createMemoryRouter(routes, { initialEntries: ['/travelers'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText('Jeff Svehla')).toBeInTheDocument()
      expect(screen.getByText('Deb Svehla')).toBeInTheDocument()
    })
  })

  describe('SettingsPage', () => {
    it('should render appearance settings', () => {
      const router = createMemoryRouter(routes, { initialEntries: ['/settings'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText('Appearance')).toBeInTheDocument()
    })

    it('should render connectivity settings', () => {
      const router = createMemoryRouter(routes, { initialEntries: ['/settings'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText('Connectivity')).toBeInTheDocument()
    })

    it('should show online status', () => {
      useAppStore.setState({ isOffline: false })

      const router = createMemoryRouter(routes, { initialEntries: ['/settings'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText(/Currently online/)).toBeInTheDocument()
    })

    it('should show offline status', () => {
      useAppStore.setState({ isOffline: true })

      const router = createMemoryRouter(routes, { initialEntries: ['/settings'] })
      render(<RouterProvider router={router} />)

      expect(screen.getByText(/Currently offline/)).toBeInTheDocument()
    })
  })
})
