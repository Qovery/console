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

type TooltipEntry = {
  dataKey: string
  value: number
  color: string
  payload: { timestamp: number; fullTime: string; [key: string]: string | number | null }
}

type GroupedEntry = {
  request?: TooltipEntry
  limit?: TooltipEntry
  others: TooltipEntry[]
}

interface CustomTooltipProps {
  customLabel: string
  active?: boolean
  payload?: TooltipEntry[]
  events?: OrganizationEventResponse[]
}

function getBaseNameFromRequestKey(seriesKey: string): string {
  return seriesKey.slice(0, -8) // Remove '-request'
}

function getBaseNameFromLimitKey(seriesKey: string): string {
  return seriesKey.slice(0, -6) // Remove '-limit'
}

function getDisplayName(seriesKey: string): string {
  if (seriesKey.endsWith('-request-limit')) {
    const baseName = seriesKey.slice(0, -14) // Remove '-request-limit'
    return `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Request/Limit`
  } else if (seriesKey.endsWith('-limit')) {
    const baseName = getBaseNameFromLimitKey(seriesKey)
    return `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Limit`
  } else if (seriesKey.endsWith('-request')) {
    const baseName = getBaseNameFromRequestKey(seriesKey)
    return `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Request`
  }
  // Remove the qovery namespace of the series key (<qovery-namespace>-<service-name>-<pod-name>)
  return seriesKey.replace(/^[^-]+-[^-]+-/, '')
}

function formatValue(value: number | string | null): string {
  const numValue = parseFloat(value?.toString() || '0')
  return isNaN(numValue) ? 'N/A' : `${numValue.toFixed(2)} mCPU`
}

function groupEntriesByType(payload: TooltipEntry[]): Map<string, GroupedEntry> {
  const groupedEntries = new Map<string, GroupedEntry>()

  payload.forEach((entry) => {
    const seriesKey = entry.dataKey

    if (seriesKey.endsWith('-request')) {
      const baseName = getBaseNameFromRequestKey(seriesKey)
      if (!groupedEntries.has(baseName)) {
        groupedEntries.set(baseName, { request: undefined, limit: undefined, others: [] })
      }
      groupedEntries.get(baseName)!.request = entry
    } else if (seriesKey.endsWith('-limit')) {
      const baseName = getBaseNameFromLimitKey(seriesKey)
      if (!groupedEntries.has(baseName)) {
        groupedEntries.set(baseName, { request: undefined, limit: undefined, others: [] })
      }
      groupedEntries.get(baseName)!.limit = entry
    } else {
      // Other entries that don't follow request/limit pattern
      if (!groupedEntries.has('others')) {
        groupedEntries.set('others', { request: undefined, limit: undefined, others: [] })
      }
      groupedEntries.get('others')!.others.push(entry)
    }
  })

  return groupedEntries
}

function processGroupedEntries(groupedEntries: Map<string, GroupedEntry>): TooltipEntry[] {
  const processedEntries: TooltipEntry[] = []

  groupedEntries.forEach((group, baseName) => {
    if (baseName === 'others') {
      // Handle non-request/limit entries
      group.others.forEach((entry) => {
        processedEntries.push(entry)
      })
    } else {
      // Handle request/limit pairs
      const request = group.request
      const limit = group.limit

      if (request && limit) {
        const requestValue = parseFloat(request.value?.toString() || '0')
        const limitValue = parseFloat(limit.value?.toString() || '0')

        if (!isNaN(requestValue) && !isNaN(limitValue) && requestValue === limitValue) {
          // Same values - show combined entry
          const combinedEntry: TooltipEntry = {
            ...request,
            dataKey: `${baseName}-request-limit`,
            color: limit.color, // Use limit color
          }
          processedEntries.push(combinedEntry)
        } else {
          // Different values - show both entries
          processedEntries.push(request, limit)
        }
      } else {
        // Only one exists - show it
        if (request) processedEntries.push(request)
        if (limit) processedEntries.push(limit)
      }
    }
  })

  return processedEntries
}

function CustomTooltip({ active, payload, customLabel, events }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

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

  const dataPoint = payload[0]?.payload
  const nearbyEvents = dataPoint?.timestamp
    ? getEventsNearTimestamp(dataPoint.timestamp).filter((event) => event.event_type === 'DEPLOYED')
    : []

  const groupedEntries = groupEntriesByType(payload)
  const processedEntries = processGroupedEntries(groupedEntries)

  return (
    <div className="rounded-md bg-neutral-600 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 px-3 py-2">
        <span className="text-xs text-neutral-50">{customLabel}</span>
        <span className="text-xs text-neutral-250">{dataPoint?.fullTime}</span>
      </div>
      <div className="space-y-1 p-3 pt-0">
        {processedEntries
          .filter((entry, index, arr) => arr.findIndex((e) => e.dataKey === entry.dataKey) === index)
          .sort((a, b) => {
            const isARequestOrLimit =
              a.dataKey.endsWith('-limit') || a.dataKey.endsWith('-request') || a.dataKey.endsWith('-request-limit')
            const isBRequestOrLimit =
              b.dataKey.endsWith('-limit') || b.dataKey.endsWith('-request') || b.dataKey.endsWith('-request-limit')
            if (isARequestOrLimit && !isBRequestOrLimit) return -1
            if (!isARequestOrLimit && isBRequestOrLimit) return 1
            return 0
          })
          .map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-neutral-50">{getDisplayName(entry.dataKey)}</span>
              </div>
              <span className="text-neutral-50">{formatValue(entry.value)}</span>
            </div>
          ))}
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

  return (
    <Section className={twMerge('h-full min-h-[300px] w-full', className)}>
      <div className="flex w-full justify-between p-4">
        <Heading>{label}</Heading>
        {/* <span className="text-sm text-neutral-400">55%</span> */}
      </div>
      <Chart.Container className="-ml-4 h-full w-[calc(100%+1rem)] pr-4" isLoading={isLoading} isEmpty={isEmpty}>
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

          <Chart.Tooltip
            content={!onHoverHideTooltip ? <div /> : <CustomTooltip customLabel={label} events={events} />}
          />
          {children}
        </LineChart>
      </Chart.Container>
    </Section>
  )
}
