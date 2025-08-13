import { forwardRef, useEffect, useRef, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Badge } from '../badge/badge'

export interface ChartLegendItem {
  key: string
  label: string
  color: string
}

export interface ChartLegendProps {
  items: ChartLegendItem[]
  rightGutterWidth?: number
  selectedKeys?: Set<string>
  onToggle?: (key: string) => void
  onHighlight?: (key: string | null) => void
  className?: string
}

/**
 * A reusable chart legend component that displays legend items in a horizontally scrollable container.
 * Features include:
 * - Horizontal scrolling with hidden scrollbar
 * - Interactive selection and highlighting
 * - Mouse and keyboard accessibility
 * - Fade gradient for visual overflow indication
 */
export const ChartLegend = forwardRef<HTMLDivElement, ChartLegendProps>(function ChartLegend(
  { items, rightGutterWidth = 48, selectedKeys = new Set<string>(), onToggle, onHighlight, className },
  ref
) {
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    const target = event.currentTarget
    if (!target) return
    const scrollDelta = event.deltaY !== 0 ? event.deltaY : event.deltaX
    if (scrollDelta === 0) return
    event.preventDefault()
    event.stopPropagation()
    target.scrollLeft += scrollDelta

    // Set scrolling state to prevent highlighting
    setIsScrolling(true)
    setHighlightedKey(null)
    onHighlight?.(null)

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Reset scrolling state after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }

  const handleMouseEnter = (key: string) => {
    if (!isScrolling) {
      setHighlightedKey(key)
      onHighlight?.(key)
    }
  }

  const handleItemMouseLeave = () => {
    // Don't clear highlight when leaving individual items
    // Only clear when leaving the entire container
  }

  const handleContainerMouseLeave = () => {
    if (!isScrolling) {
      setHighlightedKey(null)
      onHighlight?.(null)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  if (!items || items.length === 0) return null

  return (
    <>
      <style>{`
        .legend-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .legend-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div
        ref={ref}
        className={twMerge('relative mt-2', className)}
        style={{ width: `calc(100% - ${rightGutterWidth}px)` }}
      >
        <div
          onWheel={handleWheel}
          onMouseLeave={handleContainerMouseLeave}
          className="legend-scrollbar m-0 box-border flex w-full touch-pan-x flex-nowrap items-center gap-2 overflow-x-auto overscroll-y-none overscroll-x-contain whitespace-nowrap p-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((entry) => {
            const isActive = selectedKeys.has(entry.key)
            const isHighlighted = highlightedKey === entry.key
            return (
              <Badge
                key={entry.key}
                role="button"
                tabIndex={0}
                radius="full"
                className="cursor-pointer gap-2 transition-all duration-150"
                onClick={() => onToggle?.(entry.key)}
                onMouseEnter={() => handleMouseEnter(entry.key)}
                onMouseLeave={handleItemMouseLeave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggle?.(entry.key)
                  }
                }}
                style={{
                  ...(isActive
                    ? {
                        backgroundColor: entry.color.startsWith('var(')
                          ? `color-mix(in srgb, ${entry.color} 15%, transparent)`
                          : `${entry.color}15`,
                        borderColor: entry.color,
                        borderWidth: 1,
                      }
                    : {}),
                  ...(isHighlighted
                    ? {
                        backgroundColor: entry.color.startsWith('var(')
                          ? `color-mix(in srgb, ${entry.color} 15%, transparent)`
                          : `${entry.color}15`,
                        borderColor: entry.color,
                        borderWidth: 1,
                      }
                    : {}),
                }}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full transition-all duration-150"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate">{entry.label}</span>
              </Badge>
            )
          })}
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 h-full"
          style={{ width: '2.5rem', background: 'linear-gradient(to left, white, rgba(255,255,255,0))' }}
        />
      </div>
    </>
  )
})
