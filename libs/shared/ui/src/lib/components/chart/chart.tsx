import { type ComponentProps, forwardRef, useRef } from 'react'
import * as RechartsPrimitive from 'recharts'
import { twMerge } from '@qovery/shared/util-js'
import { ChartLoader } from './chart-loader'
import { ChartSkeleton } from './chart-skeleton'

const ChartContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
    isLoading?: boolean
    isEmpty?: boolean
  }
>(({ children, className, isLoading, isEmpty, ...props }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className={twMerge('relative flex h-[300px] justify-center text-xs', className)} {...props}>
      <RechartsPrimitive.ResponsiveContainer ref={chartContainerRef} width="100%" height="100%" maxHeight={600}>
        {children as React.ReactElement}
      </RechartsPrimitive.ResponsiveContainer>

      <div
        className={twMerge(
          'absolute inset-0 bg-white p-4 transition-all duration-100 ease-in-out',
          isLoading ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        style={{ pointerEvents: isLoading ? 'auto' : 'none' }}
      >
        <div className="h-full w-full">
          <ChartSkeleton />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <ChartLoader />
          <div className="text-sm text-neutral-400">Fetching data...</div>
        </div>
      </div>

      <div
        className={twMerge(
          'absolute inset-0 bg-white p-4 transition-all duration-150 ease-in-out',
          isEmpty && !isLoading ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <div className="h-full w-full">
          <ChartSkeleton />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="text-sm text-neutral-400">No data available</div>
        </div>
      </div>
    </div>
  )
})
ChartContainer.displayName = 'Chart'

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = forwardRef<
  HTMLDivElement,
  RechartsPrimitive.TooltipProps<number, string> & {
    title: string
    formatValue?: (value: string, dataKey: string) => string
    formatLabel?: (dataKey: string) => string
  }
>(({ active, payload, title, formatValue, formatLabel }, ref) => {
  if (!active || !payload || payload.length === 0) return null

  const dataPoint = payload[0]?.payload

  return (
    <div ref={ref} className="rounded-md bg-neutral-600 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 p-3 pb-2">
        <span className="text-xs text-neutral-50">{title}</span>
        <span className="text-xs text-neutral-250">{dataPoint?.fullTime}</span>
      </div>
      <div className="space-y-1 p-3 pt-0">
        {payload
          .filter((entry, index, arr) => arr.findIndex((e) => e.dataKey === entry.dataKey) === index)
          .map((entry, index) => {
            const seriesKey = entry.dataKey as string
            const displayName = formatLabel ? formatLabel(seriesKey) : seriesKey
            const formattedValue = formatValue
              ? formatValue(entry.value?.toString() ?? '', seriesKey)
              : entry.value?.toString()

            return (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-neutral-50">{displayName}</span>
                </div>
                <span className="text-neutral-50">{formattedValue}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = 'ChartTooltipContent'

export const Chart = {
  Container: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
}
