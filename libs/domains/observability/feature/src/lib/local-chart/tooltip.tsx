import { memo, useMemo } from 'react'
import { Kbd } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export type TooltipEntry = {
  dataKey: string
  value: number
  color: string
  payload: { timestamp: number; fullTime: string; [key: string]: string | number | null }
}

export type GroupedEntry = {
  request?: TooltipEntry
  limit?: TooltipEntry
  others: TooltipEntry[]
}

export type UnitType =
  | 'mCPU'
  | 'MiB'
  | 'req/s'
  | 'ms'
  | 'bytes'
  | 'instance'
  | '%'
  | 'MiB/sec'
  | 'GB'
  | 'requests'
  | 'ops'
  | 'connections'

interface TooltipProps {
  customLabel: string
  unit: UnitType
  active?: boolean
  payload?: TooltipEntry[]
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
  if (seriesKey === 'Request-Limit' || seriesKey.endsWith('-request-limit')) {
    return 'Request/Limit'
  } else if (seriesKey === 'Limit' || seriesKey.endsWith('-limit')) {
    return 'Limit'
  } else if (seriesKey === 'Request' || seriesKey.endsWith('-request')) {
    return 'Request'
  } else if (seriesKey.endsWith('-storage')) {
    return `${upperCaseFirstLetter(seriesKey)}`.replace(/-/g, ' ')
  }
  return seriesKey
}

// Formats a value for display in the tooltip
function formatValue(value: number | string | null, unit: UnitType): string {
  const numValue = Math.abs(parseFloat(value?.toString() || '0'))
  return isNaN(numValue) ? 'N/A' : unit === 'instance' ? `${Math.round(numValue)}` : `${numValue.toFixed(2)} ${unit}`
}

// Groups tooltip entries by type (request, limit, others)
function groupEntriesByType(payload: TooltipEntry[]): Map<string, GroupedEntry> {
  const groupedEntries = new Map<string, GroupedEntry>()
  payload.forEach((entry) => {
    const seriesKey = entry.dataKey
    // Handle both new format (Request/Limit) and old format (cpu-request/memory-limit)
    if (seriesKey === 'Request' || seriesKey.endsWith('-request')) {
      const baseName = seriesKey === 'Request' ? 'default' : getBaseNameFromRequestKey(seriesKey)
      if (!groupedEntries.has(baseName)) {
        groupedEntries.set(baseName, { request: undefined, limit: undefined, others: [] })
      }
      const groupEntry = groupedEntries.get(baseName)
      if (groupEntry) {
        groupEntry.request = entry
      }
    } else if (seriesKey === 'Limit' || seriesKey.endsWith('-limit')) {
      const baseName = seriesKey === 'Limit' ? 'default' : getBaseNameFromLimitKey(seriesKey)
      if (!groupedEntries.has(baseName)) {
        groupedEntries.set(baseName, { request: undefined, limit: undefined, others: [] })
      }
      const groupEntry = groupedEntries.get(baseName)
      if (groupEntry) {
        groupEntry.limit = entry
      }
    } else {
      // Other entries that don't follow request/limit pattern
      if (!groupedEntries.has('others')) {
        groupedEntries.set('others', { request: undefined, limit: undefined, others: [] })
      }
      const othersEntry = groupedEntries.get('others')
      if (othersEntry) {
        othersEntry.others.push(entry)
      }
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
          const combinedDataKey = baseName === 'default' ? 'Request-Limit' : `${baseName}-request-limit`
          const combinedEntry: TooltipEntry = {
            ...request,
            dataKey: combinedDataKey,
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
export const Tooltip = memo(({ active, unit, payload, customLabel }: TooltipProps) => {
  const MAX_ITEMS = 6
  const metaKey = useFormatHotkeys('meta')

  const filteredPayload = useMemo(
    () =>
      payload?.filter(
        (entry: TooltipEntry, index: number, arr: TooltipEntry[]) =>
          arr.findIndex((e: TooltipEntry) => e.dataKey === entry.dataKey) === index
      ) || [],
    [payload]
  )

  if (!active || !filteredPayload || filteredPayload.length === 0) return null

  const dataPoint = filteredPayload[0]?.payload

  const groupedEntries = groupEntriesByType(filteredPayload)
  const processedEntries = processGroupedEntries(groupedEntries)
    .filter((entry, index, arr) => arr.findIndex((e) => e.dataKey === entry.dataKey) === index)
    .sort((a, b) => {
      const isARequestOrLimit =
        a.dataKey.endsWith('-limit') || a.dataKey.endsWith('-request') || a.dataKey.endsWith('-request-limit')
      const isBRequestOrLimit =
        b.dataKey.endsWith('-limit') || b.dataKey.endsWith('-request') || b.dataKey.endsWith('-request-limit')
      if (isARequestOrLimit && !isBRequestOrLimit) return -1
      if (!isARequestOrLimit && isBRequestOrLimit) return 1

      const aValue = parseFloat(a.value?.toString() || '0')
      const bValue = parseFloat(b.value?.toString() || '0')
      return bValue - aValue
    })

  return (
    <div className="rounded-md bg-neutral-600 text-xs shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 px-3 py-2">
        <span className="text-xs font-medium text-neutral-50">{customLabel}</span>
        <span className="text-xs text-neutral-250">{dataPoint?.fullTime}</span>
      </div>
      <div className="space-y-1 px-2 pb-2">
        {(MAX_ITEMS ? processedEntries.slice(0, MAX_ITEMS) : processedEntries).map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-neutral-50">{getDisplayName(entry.dataKey)}</span>
            </div>
            <span className="text-neutral-50">{formatValue(entry.value, unit)}</span>
          </div>
        ))}
      </div>
      {MAX_ITEMS && processedEntries.length > MAX_ITEMS && (
        <div className="flex h-3 items-center px-2 pb-3.5 pt-1">
          <span className="text-neutral-250">+{processedEntries.length - MAX_ITEMS} more</span>
        </div>
      )}
      {metaKey && (
        <div className="border-t border-neutral-400 px-2 py-2">
          <div className="flex flex-wrap items-center gap-3 text-neutral-250">
            <div className="flex items-center gap-1">
              <Kbd className="bg-neutral-500 text-2xs font-medium text-neutral-50">DRAG</Kbd>
              <span>Zoom In</span>
            </div>
            <div className="flex items-center gap-1">
              <Kbd className="bg-neutral-500 text-2xs font-medium text-neutral-50">DBL-CLICK</Kbd>
              <span>Reset</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default Tooltip
