import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import type { MetricData } from '../../hooks/use-metrics/use-metrics'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

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

export type UnitType = 'mCPU' | 'MiB' | 'req/s'

interface TooltipProps {
  customLabel: string
  unit: UnitType
  active?: boolean
  payload?: TooltipEntry[]
  events?: OrganizationEventResponse[]
  kubeEvents?: {
    data?: {
      result?: MetricData[]
    }
  }
}

// Returns the base name by removing '-request' from the series key
function getBaseNameFromRequestKey(seriesKey: string): string {
  return seriesKey.slice(0, -8)
}

// Returns the base name by removing '-limit' from the series key
function getBaseNameFromLimitKey(seriesKey: string): string {
  return seriesKey.slice(0, -6)
}

// Returns a display name for a metric series key
function getDisplayName(seriesKey: string): string {
  if (seriesKey.endsWith('-request-limit')) {
    const baseName = seriesKey.slice(0, -14) // Remove '-request-limit'
    return `${upperCaseFirstLetter(baseName)} Request/Limit`
  } else if (seriesKey.endsWith('-limit')) {
    const baseName = getBaseNameFromLimitKey(seriesKey)
    return `${upperCaseFirstLetter(baseName)} Limit`
  } else if (seriesKey.endsWith('-request')) {
    const baseName = getBaseNameFromRequestKey(seriesKey)
    return `${upperCaseFirstLetter(baseName)} Request`
  } else if (seriesKey.endsWith('-storage')) {
    return `${upperCaseFirstLetter(seriesKey)}`.replace(/-/g, ' ')
  }
  // Remove the qovery namespace of the series key (<qovery-namespace>-<service-name>-<pod-name>)
  if (seriesKey.startsWith('qovery-') || seriesKey.startsWith('app-')) {
    return seriesKey.replace(/^[^-]+-[^-]+-/, '')
  }
  return seriesKey
}

// Formats a value for display in the tooltip
function formatValue(value: number | string | null, unit: UnitType): string {
  const numValue = parseFloat(value?.toString() || '0')
  return isNaN(numValue) ? 'N/A' : `${numValue.toFixed(2)} ${unit}`
}

// Groups tooltip entries by type (request, limit, others)
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

// Processes grouped entries for tooltip display
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

// Tooltip component for displaying metric and events details
export function Tooltip({ active, unit, payload, customLabel, events, kubeEvents }: TooltipProps) {
  const { hideEvents } = useServiceOverviewContext()

  if (!active || !payload || payload.length === 0) return null

  // Returns kubeEvents (Warning) near a given timestamp
  const getKubeEventsNearTimestamp = (timestamp: number) => {
    if (!kubeEvents?.data?.result) return []
    const tolerance = 5 * 60 // 5 minutes tolerance in seconds
    return kubeEvents.data.result.filter((serie) => {
      return serie.values.some(([ts, value]) => {
        const tsNum = typeof ts === 'string' ? Number(ts) : ts
        return Math.abs(tsNum - timestamp / 1000) <= tolerance && parseFloat(value) > 0
      })
    })
  }

  const dataPoint = payload[0]?.payload
  const kubeEventsAtPoint = dataPoint?.timestamp ? getKubeEventsNearTimestamp(dataPoint.timestamp) : []

  // Function to get events near a specific timestamp
  const getEventsNearTimestamp = (timestamp: number) => {
    if (!events) return []

    const tolerance = 5 * 60 * 1000 // 5 minutes tolerance in milliseconds
    return events.filter((event) => {
      if (!event.timestamp) return false
      const eventTimestamp = new Date(event.timestamp).getTime()
      return Math.abs(eventTimestamp - timestamp) <= tolerance
    })
  }

  const nearbyEvents = dataPoint?.timestamp
    ? getEventsNearTimestamp(dataPoint.timestamp).filter((event) => event.event_type === 'DEPLOYED')
    : []

  const groupedEntries = groupEntriesByType(payload)
  const processedEntries = processGroupedEntries(groupedEntries)

  return (
    <div className="rounded-md bg-neutral-600 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 px-3 py-2">
        <span className="text-xs font-medium text-neutral-50">{customLabel}</span>
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
              <span className="text-neutral-50">{formatValue(entry.value, unit)}</span>
            </div>
          ))}
      </div>
      {!hideEvents && (
        <>
          {/* Section Events (Deployed only) */}
          {nearbyEvents.length > 0 && (
            <div className="border-t border-neutral-400 px-3 py-2">
              <div className="mb-2 text-xs font-medium text-neutral-50">
                {pluralize(nearbyEvents.length, 'Event', 'Events')}
              </div>
              {nearbyEvents.map((event, index) => (
                <div key={index} className="mb-1 flex items-center gap-2 text-xs">
                  <div className="flex w-full justify-between gap-1 text-neutral-50">
                    <span>{upperCaseFirstLetter(event.event_type).replace(/_/g, ' ')}</span>
                    {event.id && <span>version: {event.id.substring(0, 7)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Section KubeEvents Warning */}
          {kubeEventsAtPoint.length > 0 && (
            <div className="border-t border-neutral-400 px-3 py-2">
              <div className="mb-2 text-xs font-medium text-yellow-600">KubeEvents</div>
              {kubeEventsAtPoint.map((serie: MetricData, idx: number) => (
                <div key={idx} className="mb-1 flex items-center gap-2 text-xs text-yellow-600">
                  <span>{serie.metric.reason ?? ''}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Tooltip
