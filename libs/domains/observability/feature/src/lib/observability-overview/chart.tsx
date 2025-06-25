import { type PropsWithChildren, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LoaderSpinner } from '@qovery/shared/ui'

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
  originalPodNames: Record<string, string>
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
  originalPodNames,
  colors,
  timeRange,
  isLoading,
  useLocalTime,
  children,
}: ChartProps) {
  const [onHover, setOnHover] = useState(false)

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
        onMouseMove={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        onMouseUp={() => setOnHover(false)}
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
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-neutral-600)',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'var(--color-neutral-50)',
            fontSize: 12,
            padding: '6px 0',
          }}
          content={onHover ? undefined : <span />}
          labelFormatter={(_, payload) => {
            if (payload && payload.length > 0) {
              const dataPoint = payload[0].payload
              return (
                <span className="mb-1 flex items-center justify-between gap-4 border-b border-neutral-400 px-2.5 py-2 text-xs">
                  <span className="text-neutral-50">{label}</span>
                  <span className="text-neutral-250">{dataPoint.fullTime}</span>
                </span>
              )
            }
            return null
          }}
          formatter={(value: string | number, name: string | number) => {
            const podName = originalPodNames[name.toString()] || name.toString()
            const numValue = parseFloat(value.toString())
            if (isNaN(numValue)) {
              return [
                <span
                  key={name.toString()}
                  className="flex items-center justify-between gap-7 px-2.5 text-xs leading-5"
                >
                  <span className="flex items-center gap-2">
                    <span className="relative top-[1px] block h-2 w-2 rounded-full bg-current" />
                    <span className="text-neutral-50">{podName}</span>
                  </span>
                  <span className="text-neutral-50">N/A</span>
                </span>,
              ]
            }
            const formattedValue = label.includes('Memory') ? numValue.toFixed(3) : numValue.toFixed(2)
            const unit = label.includes('Memory') ? 'GiB' : label.includes('CPU') ? 'mCPU' : ''
            return [
              <span key={name.toString()} className="flex items-center justify-between gap-7 px-2.5 text-xs leading-5">
                <span className="flex items-center gap-2">
                  <span className="relative top-[1px] block h-2 w-2 rounded-full bg-current" />
                  <span className="text-neutral-50">{podName}</span>
                </span>
                <span className="text-neutral-50">
                  {formattedValue} {unit}
                </span>
              </span>,
            ]
          }}
          cursor={{
            stroke: 'var(--color-neutral-350)',
            strokeWidth: 1,
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
              connectNulls={true}
              isAnimationActive={false}
            />
          )
        })}
        {children}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default Chart
