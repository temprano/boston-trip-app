import { describe, it, expect } from 'vitest'
import { mockDataService } from '../services/mockDataService'
import { mockItinerary, mockTravelers } from '../data/mockData'

describe('Mock Data Service', () => {
  it('should fetch itinerary', async () => {
    const itinerary = await mockDataService.getItinerary()
    expect(itinerary).toBeDefined()
    expect(itinerary.title).toBe('Boston Adventure 2026')
    expect(itinerary.days).toHaveLength(2)
  })

  it('should fetch all travelers', async () => {
    const travelers = await mockDataService.getTravelers()
    expect(travelers).toBeDefined()
    expect(travelers).toHaveLength(3)
    expect(travelers[0].name).toBe('Jeff Svehla')
  })

  it('should fetch traveler by ID', async () => {
    const traveler = await mockDataService.getTravelerById('1')
    expect(traveler).toBeDefined()
    expect(traveler?.name).toBe('Jeff Svehla')
    expect(traveler?.contact.phone).toBe('(402) 910-5996')
  })

  it('should return null for non-existent traveler', async () => {
    const traveler = await mockDataService.getTravelerById('non-existent')
    expect(traveler).toBeNull()
  })

  it('should fetch activities for a day', async () => {
    const activities = await mockDataService.getActivitiesForDay('day-1')
    expect(activities).toBeDefined()
    expect(activities).toHaveLength(3)
    expect(activities[0].title).toBe('Breakfast at Union Oyster House')
  })

  it('should return empty array for non-existent day', async () => {
    const activities = await mockDataService.getActivitiesForDay('non-existent-day')
    expect(activities).toEqual([])
  })

  it('should update itinerary', async () => {
    const updated = await mockDataService.updateItinerary({
      title: 'Updated Boston Trip',
    })
    expect(updated.title).toBe('Updated Boston Trip')
    expect(updated.updatedAt).toBeDefined()
  })

  it('should update traveler', async () => {
    const updated = await mockDataService.updateTraveler('1', {
      contact: { phone: '(402) 555-9999' },
    })
    expect(updated).toBeDefined()
    expect(updated?.name).toBe('Jeff Svehla')
  })

  it('should return null when updating non-existent traveler', async () => {
    const updated = await mockDataService.updateTraveler('non-existent', {
      bio: 'New bio',
    })
    expect(updated).toBeNull()
  })

  it('should have valid traveler data structure', () => {
    mockTravelers.forEach((traveler) => {
      expect(traveler.id).toBeDefined()
      expect(traveler.name).toBeDefined()
      expect(traveler.contact).toBeDefined()
      expect(traveler.flightInfo).toBeDefined()
    })
  })

  it('should have valid itinerary data structure', () => {
    expect(mockItinerary.id).toBeDefined()
    expect(mockItinerary.title).toBeDefined()
    expect(mockItinerary.startDate).toBeDefined()
    expect(mockItinerary.endDate).toBeDefined()
    expect(mockItinerary.days).toHaveLength(2)

    mockItinerary.days.forEach((day) => {
      expect(day.id).toBeDefined()
      expect(day.date).toBeDefined()
      expect(day.activities).toBeDefined()
      expect(Array.isArray(day.activities)).toBe(true)

      day.activities.forEach((activity) => {
        expect(activity.id).toBeDefined()
        expect(activity.title).toBeDefined()
        expect(activity.time).toBeDefined()
        expect(activity.location).toBeDefined()
        expect(activity.category).toBeDefined()
      })
    })
  })
})
