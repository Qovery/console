import { type ComponentProps, forwardRef, useMemo } from 'react'
import * as RechartsPrimitive from 'recharts'
import { twMerge } from '@qovery/shared/util-js'
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
}

const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(function ChartContainer(
  { children, className, isLoading, isEmpty, ...htmlProps },
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
          <>
            <div className="-mx-3 mt-2 border-t border-neutral-400" />
            <div className="text-left text-xs text-neutral-250">+{filteredPayload.length - maxItems} more</div>
          </>
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

export const Chart = {
  Container: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  TooltipZoomRange: ChartTooltipZoomRange,
  Skeleton: ChartSkeleton,
  Loader: ChartLoader,
}

// Hooks
export { useZoomableChart } from './use-zoomable-chart'
