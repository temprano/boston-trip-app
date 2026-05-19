import { useRef, useEffect, useState } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  disabled?: boolean
}

/**
 * Custom hook for pull-to-refresh functionality
 * Works with native touch events on iOS and Android PWAs
 * 
 * Usage:
 * const { containerRef, isRefreshing } = usePullToRefresh({
 *   onRefresh: async () => { await fetchData() },
 *   threshold: 80, // pixels to pull before triggering
 * })
 * 
 * Then attach ref to your scrollable container:
 * <div ref={containerRef} style={{ overflowY: 'auto' }}>...</div>
 */
export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, threshold = 80, disabled = false } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const isBeingPulledRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    /**
     * Detect when pull gesture starts
     * Only activate if scrollTop is at 0 (at the top of container)
     */
    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = container.scrollTop
      
      // Only start tracking if we're at the top of the scroll container
      if (scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY
        isBeingPulledRef.current = true
        console.log('[usePullToRefresh] Touch started at top of container')
      } else {
        isBeingPulledRef.current = false
      }
    }

    /**
     * Track pull distance as user moves finger down
     */
    const handleTouchMove = (e: TouchEvent) => {
      if (!isBeingPulledRef.current || isRefreshing) return

      currentYRef.current = e.touches[0].clientY
      const distance = Math.max(0, currentYRef.current - startYRef.current)
      
      // Only show pull indicator if we're pulling down (distance > 0)
      if (distance > 0) {
        setPullDistance(distance)
        console.log('[usePullToRefresh] Pull distance:', distance)
      }
    }

    /**
     * Trigger refresh if pulled far enough
     */
    const handleTouchEnd = async () => {
      if (!isBeingPulledRef.current) return
      
      isBeingPulledRef.current = false
      
      // Check if we pulled far enough to trigger refresh
      if (pullDistance > threshold && !isRefreshing) {
        console.log('[usePullToRefresh] Threshold reached, triggering refresh...')
        setIsRefreshing(true)
        
        try {
          // Call the refresh callback
          await onRefresh()
          console.log('[usePullToRefresh] ✓ Refresh complete')
        } catch (error) {
          console.error('[usePullToRefresh] Refresh failed:', error)
        } finally {
          // Reset state after refresh completes
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        // Not far enough, reset
        setPullDistance(0)
      }
    }

    // Attach touch event listeners
    // Using { passive: true } for better scroll performance
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Cleanup
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isRefreshing, pullDistance, threshold, disabled, onRefresh])

  return {
    containerRef,          // Attach to your scrollable container
    isRefreshing,          // Show loading state
    pullDistance,          // Optional: use for visual feedback
  }
}
