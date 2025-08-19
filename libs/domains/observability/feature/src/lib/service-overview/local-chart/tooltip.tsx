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

export type UnitType = 'mCPU' | 'MiB' | 'req/s' | 'ms' | 'bytes' | 'instance' | '%' | 'MiB/sec'

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
  if (seriesKey.endsWith('-request-limit')) {
    const baseName = seriesKey.slice(0, -14) // Remove '-request-limit'
    return `${baseName === 'cpu' ? 'CPU' : upperCaseFirstLetter(baseName)} Request/Limit`
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
  const numValue = Math.abs(parseFloat(value?.toString() || '0'))
  return isNaN(numValue) ? 'N/A' : unit === 'instance' ? `${numValue}` : `${numValue.toFixed(2)} ${unit}`
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
      const groupEntry = groupedEntries.get(baseName)
      if (groupEntry) {
        groupEntry.request = entry
      }
    } else if (seriesKey.endsWith('-limit')) {
      const baseName = getBaseNameFromLimitKey(seriesKey)
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
export const Tooltip = memo(function Tooltip({ active, unit, payload, customLabel }: TooltipProps) {
  const metaKey = useFormatHotkeys('meta')

  // Optimize: Single memoization combining all tooltip processing operations
  const sortedAndFilteredEntries = useMemo(() => {
    if (!payload || payload.length === 0) return []
    
    // Process and sort in single operation for better performance
    const groupedEntries = groupEntriesByType(payload)
    const processedEntries = processGroupedEntries(groupedEntries)
    
    return processedEntries
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
  }, [payload])

  if (!active || !payload || payload.length === 0) return null

  const dataPoint = payload[0]?.payload

  return (
    <div className="rounded-md bg-neutral-600 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutral-400 px-3 py-2">
        <span className="text-xs font-medium text-neutral-50">{customLabel}</span>
        <span className="text-xs text-neutral-250">{dataPoint?.fullTime}</span>
      </div>
      <div className="space-y-1 p-3 pt-0">
        {sortedAndFilteredEntries.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-neutral-50">{getDisplayName(entry.dataKey)}</span>
              </div>
              <span className="text-neutral-50">{formatValue(entry.value, unit)}</span>
            </div>
          ))}
      </div>
      {metaKey && (
        <div className="border-t border-neutral-400 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-250">
            <div className="flex items-center gap-1">
              <Kbd className="bg-neutral-500 text-2xs text-neutral-50">DRAG</Kbd>
              <span>Zoom In</span>
            </div>
            <div className="flex items-center gap-1">
              <Kbd className="bg-neutral-500 text-2xs text-neutral-50">{metaKey}</Kbd>
              <Kbd className="bg-neutral-500 text-2xs text-neutral-50">CLICK</Kbd>
              <span>Zoom Out</span>
            </div>
            <div className="flex items-center gap-1">
              <Kbd className="bg-neutral-500 text-2xs text-neutral-50">DBL-CLICK</Kbd>
              <span>Reset</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default Tooltip
