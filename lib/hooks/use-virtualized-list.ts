import { useState, useEffect, useRef, useCallback } from "react"

interface VirtualizedListOptions<T> {
  items: T[]
  itemHeight: number
  overscan?: number
  windowHeight?: number
}

interface VirtualizedListResult<T> {
  virtualItems: Array<{ item: T; index: number }>
  totalHeight: number
  startIndex: number
  endIndex: number
  containerRef: React.RefObject<HTMLDivElement>
}

export function useVirtualizedList<T>({
  items,
  itemHeight,
  overscan = 3,
  windowHeight = 0,
}: VirtualizedListOptions<T>): VirtualizedListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(windowHeight)

  // Calculate the total height of all items
  const totalHeight = items.length * itemHeight

  // Calculate the range of visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )

  // Create the visible items array
  const virtualItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      item: items[i],
      index: i,
    })
  }

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  // Measure the container height on mount and resize
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        setContainerHeight(entries[0].contentRect.height)
      })

      resizeObserver.observe(containerRef.current)
      setContainerHeight(containerRef.current.clientHeight)

      // Add scroll event listener
      containerRef.current.addEventListener("scroll", handleScroll)

      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener("scroll", handleScroll)
        }
        resizeObserver.disconnect()
      }
    }
  }, [handleScroll])

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    containerRef,
  }
}
