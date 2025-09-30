import clsx from 'clsx'
import { type ComponentProps, forwardRef, useMemo, useRef, useState } from 'react'
import * as RechartsPrimitive from 'recharts'
import { twMerge } from '@qovery/shared/util-js'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { ChartLoader } from './chart-loader'
import { ChartSkeleton } from './chart-skeleton'

interface TooltipPayloadItem {
  dataKey: string | number
  value: number | string | null | undefined
  color: string
  payload?: {
    fullTime?: string
    [key: string]: unknown
  }
}

interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  isLoading?: boolean
  isEmpty?: boolean
  isRefreshing?: boolean
}

const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(function ChartContainer(
  { children, className, isLoading, isEmpty, isRefreshing, ...htmlProps },
  ref
) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label="Interactive chart"
      className={twMerge('relative flex h-[300px] justify-center text-xs focus:outline-none', className)}
      {...htmlProps}
    >
      {!isLoading && !isEmpty ? (
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      ) : (
        <div className="h-full w-full">
          <ChartSkeleton />
        </div>
      )}

      {(isLoading || (isEmpty && !isLoading)) && (
        <div
          className={twMerge(
            'absolute inset-0 p-4 transition-all ease-in-out',
            isLoading ? 'visible opacity-100 duration-100' : 'visible opacity-100 duration-150'
          )}
          style={{ pointerEvents: isLoading ? 'auto' : 'none' }}
        >
          <div className="absolute inset-0 mt-10 flex flex-col items-center justify-center gap-2">
            {isLoading ? (
              <>
                <ChartLoader />
                <div className="text-sm text-neutral-400">Fetching data...</div>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white p-2 text-base text-neutral-350">
                  <Icon iconName="chart-column" iconStyle="regular" />
                </div>
                <div className="text-sm text-neutral-400">No data available</div>
              </>
            )}
          </div>
        </div>
      )}

      {isRefreshing && !isLoading && !isEmpty && <div className="pointer-events-none absolute inset-0 bg-white/50" />}
    </div>
  )
})

const ChartTooltip = (props: ComponentProps<typeof RechartsPrimitive.Tooltip>) => {
  return (
    <RechartsPrimitive.Tooltip
      isAnimationActive={true}
      animationDuration={100}
      animationEasing="ease-out"
      position={{ y: 13 }}
      wrapperStyle={{ zIndex: 5 }}
      {...props}
    />
  )
}

// The following code is a wrapper to filter out all non-DOM props that cause React warnings when passed to div elements
// made possible with Recharts v3 (https://github.com/recharts/recharts/issues/2788)
// the problem with this approach is that it breaks the tooltip UI
// still no workaround as of 2025-08-06
// see also: https://github.com/recharts/recharts/issues/3177

// function ChartTooltip(props: ComponentProps<typeof RechartsPrimitive.Tooltip>) {
//   const { content, ...validProps } = props
//   return <RechartsPrimitive.Tooltip {...validProps} />
// }

interface ChartTooltipContentProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  title: string
  formatValue?: (value: string, dataKey: string) => string
  formatLabel?: (dataKey: string) => string
  maxItems?: number
}

const ChartTooltipContent = forwardRef<HTMLDivElement, ChartTooltipContentProps>(function ChartTooltipContent(
  { active, payload, title, formatValue, formatLabel, maxItems = 15 },
  ref
) {
  const filteredPayload = useMemo(
    () =>
      payload?.filter(
        (entry: TooltipPayloadItem, index: number, arr: TooltipPayloadItem[]) =>
          arr.findIndex((e: TooltipPayloadItem) => e.dataKey === entry.dataKey) === index
      ) || [],
    [payload]
  )

  if (!active || !payload || payload.length === 0) return null

  const dataPoint = payload[0]?.payload

  return (
    <div ref={ref} className="rounded-md bg-neutral-600 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 p-3 pb-2">
        <span className="text-xs text-neutral-50">{title}</span>
        <span className="text-xs text-neutral-250">{dataPoint?.fullTime}</span>
      </div>
      <div className="space-y-1 p-3 pt-0">
        {(maxItems ? filteredPayload.slice(0, maxItems) : filteredPayload).map((entry: TooltipPayloadItem) => {
          const seriesKey = typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.dataKey)
          const displayName = formatLabel ? formatLabel(seriesKey) : seriesKey
          const formattedValue = formatValue
            ? formatValue(entry.value?.toString() ?? '', seriesKey)
            : entry.value?.toString()

          return (
            <div key={seriesKey} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-neutral-50">{displayName}</span>
              </div>
              <span className="text-neutral-50">{formattedValue}</span>
            </div>
          )
        })}
        {maxItems && filteredPayload.length > maxItems && (
          <div className="flex items-center text-xs">
            <span className="text-neutral-250">+{filteredPayload.length - maxItems} more</span>
          </div>
        )}
      </div>
    </div>
  )
})

interface ChartTooltipZoomRangeProps {
  active?: boolean
  startTime: string
  endTime: string
}

export const ChartTooltipZoomRange = forwardRef<HTMLDivElement, ChartTooltipZoomRangeProps>(
  function ChartTooltipZoomRange({ active = true, startTime, endTime }, ref) {
    if (!active) return null

    return (
      <div ref={ref} className="rounded-md bg-neutral-600 shadow-lg">
        <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 p-3 pb-2">
          <span className="text-xs text-neutral-50">Zoom In</span>
        </div>
        <div className="space-y-1 p-3 pt-0">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-neutral-50">Start:</span>
            <span className="text-neutral-250">{startTime}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-neutral-50">End:</span>
            <span className="text-neutral-250">{endTime}</span>
          </div>
        </div>
      </div>
    )
  }
)

const ChartLegend = RechartsPrimitive.Legend

export const ChartLegendContent = ({
  name,
  className,
  payload,
  onClick,
  onMouseEnter,
  onMouseLeave,
  formatter,
  // Custom props
  selectedKeys = new Set<string>(),
}: RechartsPrimitive.DefaultLegendContentProps & {
  selectedKeys?: Set<string>
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const isScrollingRef = useRef(false)

  // Apply highlighting styles to chart paths
  const applyHighlightStyles = (key: string | null) => {
    const styleId = `${name ? name + '-' : ''}chart-highlight-style`
    const style = document.getElementById(styleId) || document.createElement('style')
    style.id = styleId

    if (key) {
      // When highlighting, make non-highlighted paths semi-transparent
      style.textContent = `
        path[name]:not([name="${key}"]) {
          opacity: 0.15 !important;
        }
        path[name="${key}"] {
          opacity: 1 !important;
        }
      `
    } else {
      // When not highlighting, reset all paths to full opacity
      style.textContent = `
        path[name] {
          opacity: 1 !important;
        }
      `
    }

    if (!document.head.contains(style)) {
      document.head.appendChild(style)
    }
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    isScrollingRef.current = true

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
    setTimeout(() => {
      isScrollingRef.current = false
    }, 300)
  }

  const handleClick = (item: RechartsPrimitive.LegendPayload, index: number, event: React.MouseEvent) => {
    if (isScrollingRef.current) return
    onClick?.(item, index, event)
  }

  const handleMouseOver = (item: RechartsPrimitive.LegendPayload, index: number, event: React.MouseEvent) => {
    if (isScrollingRef.current) return
    const key = String(item.dataKey)
    applyHighlightStyles(key)
    onMouseEnter?.(item, index, event)
  }

  const handleMouseLeave = (item: RechartsPrimitive.LegendPayload, index: number, event: React.MouseEvent) => {
    if (isScrollingRef.current) return
    applyHighlightStyles(null)
    onMouseLeave?.(item, index, event)
  }

  if (!payload?.length) {
    return null
  }

  return (
    <div className={twMerge('relative', className)}>
      <span
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex w-full touch-pan-x flex-nowrap items-center gap-2 overflow-x-auto overscroll-y-none overscroll-x-contain whitespace-nowrap pb-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <span className="flex w-full flex-nowrap items-center gap-2">
          {payload?.map((item, index) => {
            if (!item.dataKey) return null

            const isActive = selectedKeys.has(String(item.dataKey))
            const displayValue = formatter ? formatter(item.value, item, index) : item.value

            return (
              <Button
                key={String(item.dataKey)}
                variant={isActive ? 'surface' : 'outline'}
                size="xs"
                radius="full"
                className={clsx(
                  "relative z-0 cursor-pointer gap-2 transition-colors duration-100 before:absolute before:bottom-0 before:left-[-8px] before:right-[-8px] before:top-0 before:-z-[1] before:content-[''] active:scale-100",
                  isActive && '!border-neutral-300 hover:!bg-neutral-150'
                )}
                onClick={(e) => handleClick(item, index, e)}
                onMouseEnter={(e) => handleMouseOver(item, index, e)}
                onMouseLeave={(e) => handleMouseLeave(item, index, e)}
              >
                <span
                  className={clsx(
                    'inline-block shrink-0 transition-all duration-150',
                    item.type === 'line' ? 'h-0.5 w-3' : 'h-2 w-2 rounded-full'
                  )}
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{displayValue}</span>
              </Button>
            )
          })}
        </span>
      </span>
      {canScrollLeft && (
        <span className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-white/0" />
      )}
      {canScrollRight && (
        <span className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-white/0" />
      )}
    </div>
  )
}

export const Chart = {
  Container: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  TooltipZoomRange: ChartTooltipZoomRange,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  Skeleton: ChartSkeleton,
  Loader: ChartLoader,
}

// Hooks
export { useZoomableChart } from './use-zoomable-chart'
