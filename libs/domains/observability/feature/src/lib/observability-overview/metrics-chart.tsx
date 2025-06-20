import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// import { Chart } from '@qovery/shared/ui'

interface MetricsData {
  data: {
    result: Array<{
      metric: Record<string, string>
      values: Array<[number, string]>
    }>
  }
}

interface MetricsChartProps {
  label: string
  data?: MetricsData
  isLoading?: boolean
  useLocalTime?: boolean
  timeRange?: {
    start: Date
    end: Date
  }
}

export const COLORS = [
  'var(--color-brand-500)',
  'var(--color-purple-500)',
  '#D940FF',
  '#009EDD',
  '#F4C004',
  '#00FF66',
  '#FF5733',
  '#33CCCC',
  '#FF3399',
  '#FFCC00',
  '#66FF33',
  '#FF66CC',
  '#FF9900',
  '#00FFFF',
  '#FF00FF',
  '#8B4513',
  '#1E90FF',
  '#32CD32',
  '#FF1493',
  '#00CED1',
]

export function MetricsChart({ label, data, isLoading, useLocalTime = true, timeRange }: MetricsChartProps) {
  const chartData = useMemo(() => {
    // Create a complete timeline based on timeRange if provided
    if (timeRange) {
      const { start, end } = timeRange

      // For short durations, use the original approach but ensure full timeline coverage
      if (!data?.data?.result) {
        return []
      }

      const timeSeriesMap = new Map<number, { timestamp: number; time: string; fullTime: string; [key: string]: any }>()

      // First, add all actual data points
      data.data.result.forEach((series, index) => {
        const seriesName = `pod-${index + 1}`

        series.values.forEach(([timestamp, value]) => {
          const timestampNum = timestamp * 1000 // Convert to milliseconds
          const date = new Date(timestampNum)

          const timeString = useLocalTime
            ? date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              })

          const fullTimeString = useLocalTime
            ? date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              }) + ' UTC'

          if (!timeSeriesMap.has(timestampNum)) {
            timeSeriesMap.set(timestampNum, {
              timestamp: timestampNum,
              time: timeString,
              fullTime: fullTimeString,
            })
          }

          const dataPoint = timeSeriesMap.get(timestampNum)!
          const cpuValue = parseFloat(value) * 1000 // Convert to mCPU
          dataPoint[seriesName] = cpuValue
        })
      })

      // Then, ensure we have boundary points for the full time range
      const addBoundaryPoint = (boundaryTime: Date) => {
        const boundaryTimestamp = boundaryTime.getTime()
        if (!timeSeriesMap.has(boundaryTimestamp)) {
          const timeString = useLocalTime
            ? boundaryTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : boundaryTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              })

          const fullTimeString = useLocalTime
            ? boundaryTime.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : boundaryTime.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'UTC',
              }) + ' UTC'

          timeSeriesMap.set(boundaryTimestamp, {
            timestamp: boundaryTimestamp,
            time: timeString,
            fullTime: fullTimeString,
          })
        }
      }

      // Add start and end boundary points
      addBoundaryPoint(start)
      addBoundaryPoint(end)

      return Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
    }

    // Fallback to original logic if no timeRange provided
    if (!data?.data?.result) {
      return []
    }

    const timeSeriesMap = new Map<number, { timestamp: number; time: string; fullTime: string; [key: string]: any }>()

    data.data.result.forEach((series, index) => {
      const seriesName = `pod-${index + 1}`

      series.values.forEach(([timestamp, value]) => {
        const timestampNum = timestamp * 1000 // Convert to milliseconds
        const date = new Date(timestampNum)

        const timeString = useLocalTime
          ? date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
          : date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: 'UTC',
            })

        const fullTimeString = useLocalTime
          ? date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })
          : date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZone: 'UTC',
            }) + ' UTC'

        if (!timeSeriesMap.has(timestampNum)) {
          timeSeriesMap.set(timestampNum, {
            timestamp: timestampNum,
            time: timeString,
            fullTime: fullTimeString,
          })
        }

        const dataPoint = timeSeriesMap.get(timestampNum)!
        const cpuValue = parseFloat(value) * 1000 // Convert to mCPU
        dataPoint[seriesName] = cpuValue
      })
    })

    return Array.from(timeSeriesMap.values()).sort((a, b) => a.timestamp - b.timestamp)
  }, [data, useLocalTime, timeRange])

  const seriesNames = useMemo(() => {
    if (!data?.data?.result) return []
    return data.data.result.map((_, index) => `pod-${index + 1}`)
  }, [data])

  const originalPodNames = useMemo(() => {
    if (!data?.data?.result) return {}
    const mapping: Record<string, string> = {}
    data.data.result.forEach((series, index) => {
      const podName = series.metric['pod'] || `Series ${index + 1}`
      mapping[`pod-${index + 1}`] = podName
    })
    return mapping
  }, [data])

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
        <div className="text-neutral-400">Loading...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)', strokeDasharray: '3 3' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)', strokeDasharray: '3 3' }}
          label={{
            value: label,
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, color: 'var(--color-neutral-350)' },
          }}
          tickFormatter={(value) => `${value.toFixed(3)}`}
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
            return [
              <span key={name.toString()} className="flex items-center justify-between gap-7 px-2.5 text-xs leading-5">
                <span className="flex items-center gap-2">
                  <span className="relative top-[1px] block h-2 w-2 rounded-full bg-current" />
                  <span className="text-neutral-50">{podName}</span>
                </span>
                <span className="text-neutral-50">{parseFloat(value.toString()).toFixed(2)} mCPU</span>
              </span>,
            ]
          }}
          cursor={{
            stroke: 'var(--color-neutral-350)',
            strokeWidth: 1,
          }}
        />
        {seriesNames.map((name, index) => {
          const color = COLORS[index] ?? 'var(--color-brand-500)'
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
            />
          )
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default MetricsChart
