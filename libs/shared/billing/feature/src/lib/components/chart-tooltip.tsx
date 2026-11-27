/*
 * Chart tooltip content with the console's inverted treatment (observability local-chart
 * tooltip): a compact header over a divider, then one row per series with its marker, label and
 * value. Same props as Chart.TooltipContent, whose solid surface does not pair with its inverted
 * text in the console version the kit builds against.
 */
import { forwardRef } from 'react'

type Entry = {
  dataKey?: string | number
  value?: number | string | null
  color?: string
  payload?: { fullTime?: string }
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: Entry[]
  title: string
  formatValue?: (value: string, dataKey: string) => string
  formatLabel?: (dataKey: string) => string
  maxItems?: number
}

export const ChartTooltip = forwardRef<HTMLDivElement, ChartTooltipProps>(function ChartTooltip(
  { active, payload, title, formatValue, formatLabel, maxItems = 15 },
  ref
) {
  if (!active || !payload || payload.length === 0) return null
  const entries = payload.filter((e, i, all) => all.findIndex((x) => x.dataKey === e.dataKey) === i)
  const shown = maxItems ? entries.slice(0, maxItems) : entries
  const time = payload[0]?.payload?.fullTime
  return (
    <div ref={ref} className="rounded-md bg-surface-neutralInvert-component text-sm shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-4 border-b border-neutralInvert px-3 py-2">
        <span className="font-medium text-neutralInvert">{title}</span>
        {time && <span className="text-neutralInvert-subtle">{time}</span>}
      </div>
      <div className="space-y-1 px-3 pb-2">
        {shown.map((e) => {
          const key = String(e.dataKey ?? '')
          const value = e.value == null ? '' : String(e.value)
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-neutralInvert">{formatLabel ? formatLabel(key) : key}</span>
              </div>
              <span className="text-neutralInvert">{formatValue ? formatValue(value, key) : value}</span>
            </div>
          )
        })}
        {entries.length > shown.length && (
          <div className="text-neutralInvert-subtle">+{entries.length - shown.length} more</div>
        )}
      </div>
    </div>
  )
})
