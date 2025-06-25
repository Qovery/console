import { type PropsWithChildren } from 'react'
import * as RechartsPrimitive from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { LoaderSpinner } from '@qovery/shared/ui'

const ResponsiveContainer = RechartsPrimitive.ResponsiveContainer
const LineChart = RechartsPrimitive.LineChart
const CartesianGrid = RechartsPrimitive.CartesianGrid
const XAxis = RechartsPrimitive.XAxis
const YAxis = RechartsPrimitive.YAxis
const Line = RechartsPrimitive.Line
const ChartTooltip = RechartsPrimitive.Tooltip
const ReferenceLine = RechartsPrimitive.ReferenceLine
const Label = RechartsPrimitive.Label

interface ChartTooltipContentProps extends RechartsPrimitive.TooltipProps<ValueType, NameType> {
  title?: string
  formatValue?: (value: ValueType, dataKey: string) => string
  formatLabel?: (dataKey: string) => string
}

function ChartTooltipContent({ active, payload, title, formatValue, formatLabel }: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null

  const dataPoint = payload[0]?.payload

  return (
    <div className="rounded-md border bg-neutral-600 shadow-lg">
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
            const formattedValue = formatValue ? formatValue(entry.value ?? '', seriesKey) : entry.value?.toString()

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
}

export {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ChartTooltip,
  ChartTooltipContent,
  ReferenceLine,
  Label,
}

interface ChartDataPoint {
  timestamp: number
  time: string
  fullTime: string
  [key: string]: any
}

interface ChartProps extends PropsWithChildren {
  label: string
  chartData: ChartDataPoint[]
  seriesNames: string[]
  colors: string[]
  useLocalTime: boolean
  timeRange?: {
    start: string
    end: string
  }
  isLoading?: boolean
}

export function Chart({
  label,
  chartData,
  seriesNames,
  colors,
  timeRange,
  isLoading,
  useLocalTime,
  children,
}: ChartProps) {
  if (!isLoading && (!chartData || chartData.length === 0)) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-neutral-400">No data available</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoaderSpinner />
      </div>
    )
  }

  return (
    <ResponsiveContainer>
      <LineChart
        data={chartData}
        syncId="syncId"
        // onMouseMove={() => setOnHover(true)}
        // onMouseLeave={() => setOnHover(false)}
        // onMouseUp={() => setOnHover(false)}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="timestamp"
          type="category"
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          interval="preserveStartEnd"
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp)
            const isLongRange = () => {
              if (!timeRange) return false
              const durationInHours = (Number(timeRange.end) - Number(timeRange.start)) / (60 * 60)
              return durationInHours > 24
            }

            if (isLongRange()) {
              const day = useLocalTime
                ? date.getDate().toString().padStart(2, '0')
                : date.getUTCDate().toString().padStart(2, '0')
              const month = useLocalTime
                ? (date.getMonth() + 1).toString().padStart(2, '0')
                : (date.getUTCMonth() + 1).toString().padStart(2, '0')
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
            const seconds = useLocalTime
              ? date.getSeconds().toString().padStart(2, '0')
              : date.getUTCSeconds().toString().padStart(2, '0')
            return `${hours}:${minutes}:${seconds}`
          }}
          allowDataOverflow={true}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          label={{
            value: label,
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, color: 'var(--color-neutral-350)' },
          }}
        />
        {seriesNames.map((name, index) => {
          const color = colors[index] ?? 'var(--color-brand-500)'
          return (
            <Line
              key={name}
              type="linear"
              dataKey={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 2, stroke: color, color }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )
        })}
        {children}
      </LineChart>
    </ResponsiveContainer>
  )
}

export interface LegendItem {
  name: string
  color: string
  visible: boolean
  label: string
}

export function Legend({ items, onItemClick }: { items: LegendItem[]; onItemClick: (itemName: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-4">
      {items.map((item) => (
        <button
          key={item.name}
          className={`flex items-center gap-2 rounded px-2 py-1 text-sm transition-opacity hover:bg-neutral-100 ${
            item.visible ? 'opacity-100' : 'opacity-50'
          }`}
          onClick={() => onItemClick(item.name)}
        >
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default Chart
