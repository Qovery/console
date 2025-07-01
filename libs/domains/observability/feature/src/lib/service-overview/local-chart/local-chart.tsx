import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { CartesianGrid, LineChart, XAxis, YAxis } from 'recharts'
import { Chart, Heading, Section } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

interface LocalChartProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  label: string
  isEmpty: boolean
  isLoading: boolean
  className?: string
  events?: OrganizationEventResponse[]
}

export function LocalChart({
  data,
  isLoading = false,
  isEmpty = false,
  label,
  className,
  children,
  events,
}: LocalChartProps) {
  const { startTimestamp, endTimestamp, useLocalTime } = useServiceOverviewContext()
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  function getDomain() {
    if (!data || data.length === 0) {
      return [Number(startTimestamp) * 1000, Number(endTimestamp) * 1000]
    }

    const dataMin = Math.min(...data.map((d) => d.timestamp))
    const dataMax = Math.max(...data.map((d) => d.timestamp))

    return [dataMin, dataMax]
  }

  function getLogicalTicks(): number[] {
    const startTime = Number(startTimestamp) * 1000
    const endTime = Number(endTimestamp) * 1000
    const durationMs = endTime - startTime
    const durationHours = durationMs / (1000 * 60 * 60)

    // Calculate appropriate interval based on time range duration
    let intervalMinutes: number
    if (durationHours >= 24) {
      intervalMinutes = 60 // 1 hour
    } else if (durationHours >= 6) {
      intervalMinutes = 15 // 15 minutes
    } else if (durationHours >= 3) {
      intervalMinutes = 10 // 10 minutes
    } else if (durationHours >= 1) {
      intervalMinutes = 5 // 5 minutes
    } else {
      intervalMinutes = 1 // 1 minute
    }

    const ticks: number[] = []

    // Always start from the beginning of the hour and work from there
    const baseDate = new Date(startTime)
    if (useLocalTime) {
      baseDate.setMinutes(0, 0, 0)
    } else {
      baseDate.setUTCMinutes(0, 0, 0)
    }

    let current = baseDate.getTime()

    // Move forward to find the first tick that should be visible
    while (current < startTime - intervalMinutes * 60 * 1000) {
      current += intervalMinutes * 60 * 1000
    }

    // Generate ticks extending slightly beyond our range for better visual coverage
    const paddingMs = intervalMinutes * 60 * 1000
    while (current <= endTime + paddingMs) {
      ticks.push(current)
      current += intervalMinutes * 60 * 1000
    }

    // Only return ticks that make sense for our visible range
    return ticks.filter((tick) => {
      // Include ticks that are close enough to our range to be useful
      return tick >= startTime - paddingMs && tick <= endTime + paddingMs
    })
  }

  // Function to get events near a specific timestamp
  const getEventsNearTimestamp = (timestamp: number) => {
    if (!events) return []

    const tolerance = 5 * 60 * 1000 // 5 minutes tolerance
    return events.filter((event) => {
      if (!event.timestamp) return false
      const eventTimestamp = new Date(event.timestamp).getTime()
      return Math.abs(eventTimestamp - timestamp) <= tolerance
    })
  }

  const CustomTooltipContent = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{
      dataKey: string
      value: number
      color: string
      payload: { timestamp: number; fullTime: string; [key: string]: string | number | null }
    }>
  }) => {
    if (!active || !payload || payload.length === 0) return null

    const dataPoint = payload[0]?.payload
    const nearbyEvents = dataPoint?.timestamp
      ? getEventsNearTimestamp(dataPoint.timestamp).filter((event) => event.event_type === 'DEPLOYED')
      : []

    return (
      <div className="rounded-md bg-neutral-600 shadow-lg">
        <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 px-3 py-2">
          <span className="text-xs text-neutral-50">{label}</span>
          <span className="text-xs text-neutral-250">{dataPoint?.fullTime}</span>
        </div>
        <div className="space-y-1 p-3 pt-0">
          {payload
            .filter((entry, index, arr) => arr.findIndex((e) => e.dataKey === entry.dataKey) === index)
            .map((entry, index) => {
              const seriesKey = entry.dataKey as string
              const displayName = (() => {
                if (seriesKey.startsWith('pod-')) {
                  return seriesKey
                } else if (seriesKey === 'cpu-limit') {
                  return 'CPU Limit'
                } else if (seriesKey === 'cpu-request') {
                  return 'CPU Request'
                }
                return seriesKey
              })()
              const formattedValue = (() => {
                const numValue = parseFloat(entry.value?.toString() || '0')
                return isNaN(numValue) ? 'N/A' : `${numValue.toFixed(2)} mCPU`
              })()

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
        {nearbyEvents.length > 0 && (
          <div className="border-t border-neutral-400 px-3 py-2">
            <div className="mb-2 text-xs text-neutral-50">{pluralize(nearbyEvents.length, 'Event', 'Events')}</div>
            {nearbyEvents.map((event, index) => (
              <div key={index} className="mb-1 flex items-center gap-2 text-xs">
                <div className="flex w-full justify-between gap-1 text-neutral-50">
                  <span className="font-medium">{event.event_type}</span>
                  {event.id && <span>version: {event.id.substring(0, 7)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Section className={twMerge('h-[300px]', className)}>
      <div className="flex w-full justify-between p-4">
        <Heading>{label}</Heading>
        <span className="text-sm text-neutral-400">55%</span>
      </div>
      <Chart.Container className="pb-4 pr-4" isLoading={isLoading} isEmpty={isEmpty}>
        <LineChart
          data={data}
          syncId="syncId"
          margin={{ top: 3, bottom: 10 }}
          onMouseMove={() => setOnHoverHideTooltip(true)}
          onMouseLeave={() => setOnHoverHideTooltip(false)}
          onMouseUp={() => setOnHoverHideTooltip(false)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-250)" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={getDomain()}
            ticks={getLogicalTicks()}
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'var(--color-neutral-250)' }}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const isLongRange = () => {
                const durationInHours = (Number(endTimestamp) - Number(startTimestamp)) / (60 * 60)
                return durationInHours > 24
              }

              if (isLongRange()) {
                const day = useLocalTime
                  ? date.getDate().toString().padStart(2, '0')
                  : date.getUTCDate().toString().padStart(2, '0')
                const month = useLocalTime ? (date.getMonth() + 1).toString().padStart(2, '0') : date.getUTCMonth() + 1
                const hours = useLocalTime
                  ? date.getHours().toString().padStart(2, '0')
                  : date.getUTCHours().toString().padStart(2, '0')
                const minutes = useLocalTime
                  ? date.getMinutes().toString().padStart(2, '0')
                  : date.getUTCMinutes().toString().padStart(2, '0')
                return `${day}/${month} ${hours}:${minutes}`
              }
              const hours = useLocalTime
                ? date.getHours().toString().padStart(2, '0')
                : date.getUTCHours().toString().padStart(2, '0')
              const minutes = useLocalTime
                ? date.getMinutes().toString().padStart(2, '0')
                : date.getUTCMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
            allowDataOverflow={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'var(--color-neutral-250)' }}
          />

          <Chart.Tooltip content={!onHoverHideTooltip ? <div /> : <CustomTooltipContent />} />
          {children}
        </LineChart>
      </Chart.Container>
    </Section>
  )
}
