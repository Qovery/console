import { useCallback, useEffect, useRef } from 'react'

export interface ChartHighlightingOptions {
  /**
   * Set of currently selected metric keys
   */
  selectedKeys: Set<string>
}

/**
 * Hook for managing chart highlighting functionality.
 * Provides selection and hover highlighting for chart series via direct styling.
 *
 * @example
 * ```tsx
 * const { containerRef, handleHighlight } = useChartHighlighting({
 *   selectedKeys: selectedMetrics
 * })
 *
 * return (
 *   <div ref={containerRef}>
 *     <Chart>...</Chart>
 *     <Chart.Legend onHighlight={handleHighlight} />
 *   </div>
 * )
 * ```
 */
export function useChartHighlighting({ selectedKeys }: ChartHighlightingOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentHoveredKey = useRef<string | null>(null)

  const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]+/g, '-')

  // Apply direct styling to chart elements
  const applyHighlightStyles = useCallback(() => {
    const root = containerRef.current
    if (!root) return

    const hasSelection = selectedKeys.size > 0
    const hasHover = currentHoveredKey.current !== null
    const shouldDim = hasSelection || hasHover

    // Get all chart series elements
    const seriesElements = root.querySelectorAll('g.series path, g.series rect, g.series circle, g.series polygon')

    seriesElements.forEach((element) => {
      const seriesElement = element.closest('g.series') as HTMLElement
      if (!seriesElement) return

      // Extract series class to determine the data key
      const seriesClasses = Array.from(seriesElement.classList)
      const seriesClass = seriesClasses.find((cls) => cls.startsWith('series--'))

      if (!seriesClass) return

      const dataKey = seriesClass.replace('series--', '')
      const sanitizedKey = sanitizeKey(dataKey)

      let opacity = '1'

      if (shouldDim) {
        // Default to dimmed
        opacity = '0.2'

        // Check if this series should be highlighted
        // Try both the original dataKey and various transformations
        const isSelected =
          selectedKeys.has(dataKey) ||
          selectedKeys.has(sanitizedKey) ||
          Array.from(selectedKeys).some((key) => sanitizeKey(key) === dataKey)

        const hoveredKey = currentHoveredKey.current
        const isHovered =
          hoveredKey === dataKey || hoveredKey === sanitizedKey || (hoveredKey && sanitizeKey(hoveredKey) === dataKey)

        if (isSelected || isHovered) {
          opacity = '1'
        }
      }

      // Apply the style directly
      ;(element as HTMLElement).style.opacity = opacity
    })
  }, [selectedKeys])

  // Handle selection changes
  useEffect(() => {
    applyHighlightStyles()
  }, [selectedKeys, applyHighlightStyles])

  // Handle hover highlighting
  const handleHighlight = useCallback(
    (key: string | null) => {
      currentHoveredKey.current = key
      applyHighlightStyles()
    },
    [applyHighlightStyles]
  )

  // Set up observer to catch dynamically added chart elements
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const observer = new MutationObserver(() => {
      // Delay to ensure elements are fully rendered
      requestAnimationFrame(() => {
        applyHighlightStyles()
      })
    })

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: false,
    })

    return () => observer.disconnect()
  }, [applyHighlightStyles])

  return {
    containerRef,
    handleHighlight,
    sanitizeKey,
  }
}
