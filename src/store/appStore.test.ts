import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppStore, useItinerary, useTravelers, useIsOffline, useTheme } from './appStore'
import { mockItinerary, mockTravelers } from '../data/mockData'

describe('App Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      currentItinerary: null,
      travelers: [],
      isOffline: false,
      theme: 'light',
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState()
      expect(state.currentItinerary).toBeNull()
      expect(state.travelers).toEqual([])
      expect(state.isOffline).toBe(false)
      expect(state.theme).toBe('light')
    })
  })

  describe('Setters', () => {
    it('should set itinerary', () => {
      act(() => {
        useAppStore.getState().setItinerary(mockItinerary)
      })

      const state = useAppStore.getState()
      expect(state.currentItinerary).toEqual(mockItinerary)
      expect(state.currentItinerary?.title).toBe('Boston Adventure 2026')
    })

    it('should clear itinerary', () => {
      act(() => {
        useAppStore.getState().setItinerary(mockItinerary)
        useAppStore.getState().setItinerary(null)
      })

      const state = useAppStore.getState()
      expect(state.currentItinerary).toBeNull()
    })

    it('should set travelers list', () => {
      act(() => {
        useAppStore.getState().setTravelers(mockTravelers)
      })

      const state = useAppStore.getState()
      expect(state.travelers).toHaveLength(3)
      expect(state.travelers[0].name).toBe('Jeff Svehla')
    })

    it('should set offline status', () => {
      act(() => {
        useAppStore.getState().setIsOffline(true)
      })

      const state = useAppStore.getState()
      expect(state.isOffline).toBe(true)
    })

    it('should set theme', () => {
      act(() => {
        useAppStore.getState().setTheme('dark')
      })

      const state = useAppStore.getState()
      expect(state.theme).toBe('dark')
    })
  })

  describe('Actions', () => {
    it('should add a traveler', () => {
      const newTraveler = mockTravelers[0]

      act(() => {
        useAppStore.getState().addTraveler(newTraveler)
      })

      const state = useAppStore.getState()
      expect(state.travelers).toHaveLength(1)
      expect(state.travelers[0].id).toBe(newTraveler.id)
    })

    it('should add multiple travelers', () => {
      act(() => {
        mockTravelers.forEach((t) => {
          useAppStore.getState().addTraveler(t)
        })
      })

      const state = useAppStore.getState()
      expect(state.travelers).toHaveLength(3)
    })

    it('should remove a traveler', () => {
      act(() => {
        useAppStore.getState().setTravelers(mockTravelers)
        useAppStore.getState().removeTraveler('1')
      })

      const state = useAppStore.getState()
      expect(state.travelers).toHaveLength(2)
      expect(state.travelers.find((t) => t.id === '1')).toBeUndefined()
    })

    it('should update a traveler', () => {
      act(() => {
        useAppStore.getState().setTravelers(mockTravelers)
        useAppStore.getState().updateTraveler('1', {
          contact: { phone: '(402) 555-9999' },
        })
      })

      const state = useAppStore.getState()
      const traveler = state.travelers.find((t) => t.id === '1')
      expect(traveler?.contact.phone).toBe('(402) 555-9999')
      expect(traveler?.name).toBe('Jeff Svehla') // Other props unchanged
    })

    it('should reset state to initial values', () => {
      act(() => {
        useAppStore.getState().setItinerary(mockItinerary)
        useAppStore.getState().setTravelers(mockTravelers)
        useAppStore.getState().setIsOffline(true)
        useAppStore.getState().setTheme('dark')

        useAppStore.getState().resetState()
      })

      const state = useAppStore.getState()
      expect(state.currentItinerary).toBeNull()
      expect(state.travelers).toEqual([])
      expect(state.isOffline).toBe(false)
      expect(state.theme).toBe('light')
    })
  })

  describe('Selectors', () => {
    beforeEach(() => {
      act(() => {
        useAppStore.getState().setItinerary(mockItinerary)
        useAppStore.getState().setTravelers(mockTravelers)
        useAppStore.getState().setIsOffline(true)
        useAppStore.getState().setTheme('dark')
      })
    })

    it('should select itinerary', () => {
      const { result } = renderHook(() => useItinerary())
      expect(result.current?.title).toBe('Boston Adventure 2026')
    })

    it('should select travelers', () => {
      const { result } = renderHook(() => useTravelers())
      expect(result.current).toHaveLength(3)
    })

    it('should select offline status', () => {
      const { result } = renderHook(() => useIsOffline())
      expect(result.current).toBe(true)
    })

    it('should select theme', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current).toBe('dark')
    })
  })

  describe('Store Subscriptions', () => {
    it('should notify subscribers on state changes', () => {
      const listener = vi.fn()

      const unsubscribe = useAppStore.subscribe(
        (state) => state.theme,
        listener
      )

      act(() => {
        useAppStore.getState().setTheme('dark')
      })

      expect(listener).toHaveBeenCalledWith('dark', 'light')

      unsubscribe()
    })

    it('should persist state changes across multiple updates', () => {
      act(() => {
        useAppStore.getState().setItinerary(mockItinerary)
        useAppStore.getState().setTravelers(mockTravelers)
      })

      const state1 = useAppStore.getState()
      expect(state1.currentItinerary).not.toBeNull()
      expect(state1.travelers).toHaveLength(3)

      // Update one property
      act(() => {
        useAppStore.getState().setTheme('dark')
      })

      const state2 = useAppStore.getState()
      // Other properties should remain unchanged
      expect(state2.currentItinerary).not.toBeNull()
      expect(state2.travelers).toHaveLength(3)
      expect(state2.theme).toBe('dark')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle full workflow', () => {
      act(() => {
        // Load itinerary and travelers
        useAppStore.getState().setItinerary(mockItinerary)
        useAppStore.getState().setTravelers(mockTravelers)

        // Go offline
        useAppStore.getState().setIsOffline(true)

        // Switch theme
        useAppStore.getState().setTheme('dark')
      })

      let state = useAppStore.getState()
      expect(state.currentItinerary).not.toBeNull()
      expect(state.travelers).toHaveLength(3)
      expect(state.isOffline).toBe(true)
      expect(state.theme).toBe('dark')

      act(() => {
        // Remove a traveler
        useAppStore.getState().removeTraveler('1')

        // Go back online
        useAppStore.getState().setIsOffline(false)
      })

      state = useAppStore.getState()
      expect(state.travelers).toHaveLength(2)
      expect(state.isOffline).toBe(false)
    })
  })
})

// Import vi for vi.fn()
import { vi } from 'vitest'
