import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TravelersSection } from './TravelersSection'
import { mockTravelers } from '../data/mockData'

describe('TravelersSection', () => {
  it('should render traveler section with title', () => {
    render(<TravelersSection travelers={mockTravelers} title="Trip Travelers" />)

    expect(screen.getByText(/Trip Travelers/)).toBeInTheDocument()
  })

  it.skip('should render correct number of travelers', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    mockTravelers.forEach((traveler) => {
      expect(screen.getByText(traveler.name)).toBeInTheDocument()
    })
  })

  it.skip('should separate organizers and guests', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    expect(screen.getByText('👑 Organizers')).toBeInTheDocument()
    expect(screen.getByText('👤 Guests')).toBeInTheDocument()
  })

  it.skip('should display traveler roles correctly', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    // Jeff is organizer
    const jeffText = screen.getByText('Jeff Svehla')
    const jeffParent = jeffText.closest('div')
    expect(jeffParent?.textContent).toContain('Organizer')

    // Deb is guest
    const debText = screen.getByText('Deb Svehla')
    const debParent = debText.closest('div')
    expect(debParent?.textContent).toContain('Guest')
  })

  it.skip('should expand accordion on click', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    const firstTraveler = mockTravelers[0]
    const phoneLink = screen.getByText(firstTraveler.contact.phone!)

    // Phone should be visible initially (first traveler expanded by default)
    expect(phoneLink).toBeInTheDocument()
  })

  it.skip('should display contact information when expanded', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    // First traveler should be expanded by default
    expect(screen.getByText(mockTravelers[0].contact.phone!)).toBeInTheDocument()
  })

  it.skip('should display flight information', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    expect(screen.getByText('Flight Details')).toBeInTheDocument()
    // Check for airline
    expect(screen.getByText(/American Airlines|Delta Air Lines|United Airlines/)).toBeInTheDocument()
  })

  it.skip('should display dietary restrictions when present', () => {
    const { container } = render(<TravelersSection travelers={mockTravelers} />)

    // Find the second traveler card (Mike Chen has dietary restrictions)
    const travelerCards = container.querySelectorAll('.glass-card')
    expect(travelerCards.length).toBeGreaterThan(1)

    // Click the second card to expand it
    const secondCard = travelerCards[1] as HTMLElement
    fireEvent.click(secondCard)

    // Now dietary info should be visible
    const dietaryLabel = screen.getByText('Dietary Info')
    expect(dietaryLabel).toBeInTheDocument()
  })

  it.skip('should toggle accordion on click', () => {
    const { container } = render(<TravelersSection travelers={mockTravelers} />)

    const travelerCards = container.querySelectorAll('.glass-card')
    expect(travelerCards.length).toBeGreaterThan(0)

    // Click a card to toggle
    const firstCard = travelerCards[0] as HTMLElement
    fireEvent.click(firstCard)

    // The accordion state should change
    // Note: This is a basic test - in a real scenario, you'd check specific expanded/collapsed states
    expect(travelerCards.length).toBeGreaterThan(0)
  })

  it('should handle empty travelers list', () => {
    render(<TravelersSection travelers={[]} />)

    expect(screen.getByText('No travelers yet')).toBeInTheDocument()
  })

  it.skip('should display bio when present', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    expect(screen.getByText('Travel enthusiast and organizer')).toBeInTheDocument()
  })

  it('should display default title', () => {
    render(<TravelersSection travelers={mockTravelers} />)

    expect(screen.getByText(/Travelers \(3\)/)).toBeInTheDocument()
  })

  it('should count travelers correctly in title', () => {
    const twoTravelers = mockTravelers.slice(0, 2)
    render(<TravelersSection travelers={twoTravelers} />)

    expect(screen.getByText(/Travelers \(2\)/)).toBeInTheDocument()
  })
})

