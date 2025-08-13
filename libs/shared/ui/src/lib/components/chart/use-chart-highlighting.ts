import { useEffect, useRef } from 'react'

export interface ChartHighlightingOptions {
  /**
   * Array of metric keys that will be used in the chart
   */
  metricKeys: string[]
  /**
   * Set of currently selected metric keys
   */
  selectedKeys: Set<string>
}

/**
 * Hook for managing chart highlighting functionality.
 * Provides selection and hover highlighting for chart series via CSS classes.
 *
 * @example
 * ```tsx
 * const { containerRef, handleHighlight, highlightingStyles } = useChartHighlighting({
 *   metricKeys: metrics.map(m => m.key),
 *   selectedKeys: selectedMetrics
 * })
 *
 * return (
 *   <div ref={containerRef} className="highlight-scope">
 *     <style>{highlightingStyles}</style>
 *     <Chart>...</Chart>
 *     <Chart.Legend onHighlight={handleHighlight} />
 *   </div>
 * )
 * ```
 */
export function useChartHighlighting({ metricKeys, selectedKeys }: ChartHighlightingOptions) {
  const containerRef = useRef<HTMLDivElement>(null)

  const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]+/g, '-')

  // Handle selection highlighting via CSS classes
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    // Clear all existing selection classes
    root.classList.forEach((className) => {
      if (className.startsWith('selected-series--')) {
        root.classList.remove(className)
      }
    })

    // Add selection classes for each selected key
    selectedKeys.forEach((key) => {
      root.classList.add(`selected-series--${sanitizeKey(key)}`)
    })

    // Toggle has-selection class
    root.classList.toggle('has-selection', selectedKeys.size > 0)
  }, [selectedKeys])

  // Handle hover highlighting via CSS classes
  const handleHighlight = (key: string | null) => {
    const root = containerRef.current
    if (!root) return

    // Remove existing hover classes
    root.classList.forEach((className) => {
      if (className.startsWith('hover-series--')) {
        root.classList.remove(className)
      }
    })

    if (key) {
      root.classList.add(`hover-series--${sanitizeKey(key)}`)
      root.classList.add('has-hover')
    } else {
      root.classList.remove('has-hover')
    }
  }

  // Generate CSS styles for highlighting
  const highlightingStyles = `
    /* Base state: when there are selections, dim all series */
    .highlight-scope.has-selection g.series path,
    .highlight-scope.has-selection g.series rect,
    .highlight-scope.has-selection g.series circle,
    .highlight-scope.has-selection g.series polygon {
      opacity: 0.2;
    }
    
    /* Base state: when hovering, dim all series */
    .highlight-scope.has-hover g.series path,
    .highlight-scope.has-hover g.series rect,
    .highlight-scope.has-hover g.series circle,
    .highlight-scope.has-hover g.series polygon {
      opacity: 0.2;
    }
    
    /* Generate CSS for each metric - both selection and hover states */
    ${metricKeys
      .map((key) => {
        const seriesClass = sanitizeKey(key)
        return `
        /* Selected series: always visible */
        .highlight-scope.selected-series--${seriesClass} g.series.series--${seriesClass} path,
        .highlight-scope.selected-series--${seriesClass} g.series.series--${seriesClass} rect,
        .highlight-scope.selected-series--${seriesClass} g.series.series--${seriesClass} circle,
        .highlight-scope.selected-series--${seriesClass} g.series.series--${seriesClass} polygon {
          opacity: 1 !important;
        }
        
        /* Hovered series: always visible when hovering */
        .highlight-scope.hover-series--${seriesClass} g.series.series--${seriesClass} path,
        .highlight-scope.hover-series--${seriesClass} g.series.series--${seriesClass} rect,
        .highlight-scope.hover-series--${seriesClass} g.series.series--${seriesClass} circle,
        .highlight-scope.hover-series--${seriesClass} g.series.series--${seriesClass} polygon {
          opacity: 1 !important;
        }
      `
      })
      .join('')}
  `

  return {
    containerRef,
    handleHighlight,
    highlightingStyles,
    sanitizeKey,
  }
}
