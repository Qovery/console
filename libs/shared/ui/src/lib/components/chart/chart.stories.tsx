import type { Meta } from '@storybook/react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Chart, useZoomableChart } from './chart'
import { createXAxisConfig } from './chart-utils'

const CHART_COLORS = [
  'var(--color-r-ams)',
  'var(--color-r-arn)',
  'var(--color-r-atl)',
  'var(--color-r-bog)',
  'var(--color-r-bom)',
  'var(--color-r-bos)',
  'var(--color-r-gig)',
  'var(--color-r-gru)',
  'var(--color-r-hkg)',
  'var(--color-r-lhr)',
  'var(--color-r-mad)',
  'var(--color-r-mia)',
  'var(--color-r-nrt)',
  'var(--color-r-ord)',
  'var(--color-r-otp)',
  'var(--color-r-phx)',
  'var(--color-r-qro)',
  'var(--color-r-scl)',
]

// Sample data with independent system metrics: CPU, Memory, Disk usage (percentages)
const sampleData = [
  { timestamp: 1704067200000, time: '00:00', fullTime: '2024-01-01 00:00:00', cpu: 25, memory: 68, disk: 45 },
  { timestamp: 1704070800000, time: '01:00', fullTime: '2024-01-01 01:00:00', cpu: 45, memory: 72, disk: 47 },
  { timestamp: 1704074400000, time: '02:00', fullTime: '2024-01-01 02:00:00', cpu: 78, memory: 65, disk: 52 },
  { timestamp: 1704078000000, time: '03:00', fullTime: '2024-01-01 03:00:00', cpu: 92, memory: 58, disk: 46 },
  { timestamp: 1704081600000, time: '04:00', fullTime: '2024-01-01 04:00:00', cpu: 68, memory: 82, disk: 49 },
  { timestamp: 1704085200000, time: '05:00', fullTime: '2024-01-01 05:00:00', cpu: 34, memory: 76, disk: 51 },
  { timestamp: 1704088800000, time: '06:00', fullTime: '2024-01-01 06:00:00', cpu: 52, memory: 69, disk: 48 },
]

// Generate 20 unique instance metrics
const generateMetrics = () => {
  const baseUUIDs = [
    'dk2ms',
    'zwdnt',
    'px7kf',
    'qm9bg',
    'ry4ch',
    'vn8jl',
    'ht3wp',
    'kb6rx',
    'mg1az',
    'fs5yq',
    'jw0ek',
    'lc7nt',
    'bp4xs',
    'dn9mv',
    'gk2fh',
    'rs6pl',
    'tz3wj',
    'xh8qr',
    'yv1kc',
    'am5dt',
  ]

  return baseUUIDs.map((uuid) => ({
    key: `pod-889b7db58-${uuid}`,
    baseValue: 400 + Math.floor(Math.random() * 2000), // Random base between 400-2400
    variance: 50 + Math.floor(Math.random() * 200), // Random variance between 50-250
    // Unique pattern parameters for each metric
    trendPhase: Math.random() * Math.PI * 2, // Random phase shift
    trendFrequency: 0.5 + Math.random() * 3, // Random frequency (0.5x to 3.5x)
    cyclicPhase: Math.random() * Math.PI * 2, // Random cyclic phase
    cyclicFrequency: 2 + Math.random() * 8, // Random cyclic frequency (2x to 10x)
    noiseIntensity: 0.2 + Math.random() * 0.6, // Random noise intensity (0.2 to 0.8)
    trendDirection: Math.random() > 0.5 ? 1 : -1, // Random trend direction
    spikeProbability: Math.random() * 0.1, // Random spike probability (0-10%)
  }))
}

// Generate time series data with realistic variations
const generateTimeSeriesData = (metrics: ReturnType<typeof generateMetrics>) => {
  const startTime = 1704067200000 // 2024-01-01 00:00:00
  const endTime = 1704081600000 // 2024-01-01 04:00:00
  const pointCount = 100 // Granularity
  const intervalMs = (endTime - startTime) / (pointCount - 1)

  const timePoints: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number }> = []

  for (let i = 0; i < pointCount; i++) {
    const timestamp = startTime + i * intervalMs
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    timePoints.push({
      timestamp: Math.round(timestamp),
      time: `${hours}:${minutes}`,
      fullTime: `2024-01-01 ${hours}:${minutes}:${seconds}`,
    })
  }

  return timePoints.map((timePoint) => {
    const dataPoint = { ...timePoint }

    metrics.forEach((metric) => {
      const normalizedTime = (timePoint.timestamp - startTime) / (endTime - startTime)

      // Each metric has its own unique curve pattern
      const primaryTrend =
        Math.sin(normalizedTime * metric.trendFrequency * Math.PI * 2 + metric.trendPhase) *
        metric.variance *
        0.6 *
        metric.trendDirection

      const secondaryWave =
        Math.cos(normalizedTime * metric.cyclicFrequency * Math.PI * 2 + metric.cyclicPhase) * metric.variance * 0.3

      // Unique noise pattern for each metric
      const noise = (Math.random() - 0.5) * metric.variance * metric.noiseIntensity

      // Random spikes/dips for some metrics
      const spike = Math.random() < metric.spikeProbability ? (Math.random() - 0.5) * metric.variance * 2 : 0

      // Long-term drift (some metrics trending up/down over time)
      const drift = normalizedTime * metric.trendDirection * metric.variance * 0.2

      // Ensure value stays positive and reasonable
      const rawValue = metric.baseValue + primaryTrend + secondaryWave + noise + spike + drift
      dataPoint[metric.key] = Math.max(50, Math.round(rawValue))
    })

    return dataPoint
  })
}

// Generate all data
const gaffotronMetrics = generateMetrics()
const maximalEdgeCaseData = generateTimeSeriesData(gaffotronMetrics)

const Story: Meta<typeof Chart.Container> = {
  component: Chart.Container,
  title: 'Chart',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Composed = {
  render: () => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704088800, { tickCount: 7 }) // Show all 7 items

    // Create modified data where first and last bars are hidden
    const modifiedData = sampleData.map((item, index) => ({
      ...item,
      memory: index === 0 || index === sampleData.length - 1 ? undefined : item.memory,
    }))

    return (
      <Chart.Container className="h-[400px] w-full p-5 py-2 pr-0">
        <ComposedChart data={modifiedData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis
            {...xAxisConfig}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          <Tooltip
            content={
              <Chart.TooltipContent
                title="System Usage"
                formatLabel={(key) => {
                  const labelMap: Record<string, string> = { cpu: 'CPU', memory: 'Memory', disk: 'Disk' }
                  return labelMap[key] || key
                }}
                formatValue={(value) => `${value}%`}
              />
            }
          />
          <Legend />
          <Area
            type="linear"
            dataKey="cpu"
            stroke="var(--color-yellow-500)"
            fill="var(--color-yellow-500)"
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive={false}
            name="CPU"
          />
          <Bar dataKey="memory" fill="var(--color-brand-500)" barSize={20} isAnimationActive={false} name="Memory" />
          <Line
            type="linear"
            dataKey="disk"
            stroke="var(--color-green-500)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
            name="Disk"
          />
        </ComposedChart>
      </Chart.Container>
    )
  },
}

export const MaximalEdgeCase = {
  render: () => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704081600, { tickCount: 10 }) // Custom tick count for demo
    return (
      <Chart.Container className="h-[400px] w-full p-5 py-2 pr-0">
        <ComposedChart data={maximalEdgeCaseData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis
            {...xAxisConfig}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          <Chart.Tooltip content={<Chart.TooltipContent title="CPU" maxItems={10} />} />
          <Legend />
          {gaffotronMetrics.map((metric, index) => (
            <Line
              key={metric.key}
              type="linear"
              dataKey={metric.key}
              name={metric.key}
              stroke={CHART_COLORS[index]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </Chart.Container>
    )
  },
}

export const ZoomableChart = {
  render: () => {
    const {
      zoomState,
      isCtrlPressed,
      handleChartDoubleClick,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      getXDomain,
    } = useZoomableChart()

    const xAxisConfig = createXAxisConfig(1704067200, 1704088800, { tickCount: 7 })
    const domain = getXDomain(['dataMin', 'dataMax'])

    return (
      <div style={{ userSelect: 'none', width: '100%', position: 'relative' }}>
        <div
          style={{
            background: 'var(--color-neutral-100)',
            border: '1px solid var(--color-neutral-400)',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--color-neutral-900)',
            fontWeight: 500,
          }}
        >
          Drag to zoom in • Hold Ctrl/Cmd + Click to zoom out one step • Double-click to reset zoom
        </div>

        <Chart.Container className="h-[400px] w-full p-5 py-2 pr-0">
          <ComposedChart
            data={sampleData}
            margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleChartDoubleClick}
            style={{ cursor: isCtrlPressed ? 'zoom-out' : 'crosshair' }}
          >
            <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
            <XAxis
              {...xAxisConfig}
              allowDataOverflow
              domain={domain}
              type="number"
              dataKey="timestamp"
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp)
                const hours = date.getHours().toString().padStart(2, '0')
                const minutes = date.getMinutes().toString().padStart(2, '0')
                return `${hours}:${minutes}`
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
              tickLine={{ stroke: 'transparent' }}
              axisLine={{ stroke: 'transparent' }}
              orientation="right"
              tickCount={5}
              tickFormatter={(value) => (value === 0 ? '' : value)}
            />
            <Tooltip
              content={
                <Chart.TooltipContent
                  title="System Usage"
                  formatLabel={(key) => {
                    const labelMap: Record<string, string> = { cpu: 'CPU', memory: 'Memory', disk: 'Disk' }
                    return labelMap[key] || key
                  }}
                  formatValue={(value) => `${value}%`}
                />
              }
            />
            <Legend />
            <Area
              type="linear"
              dataKey="cpu"
              stroke="var(--color-yellow-500)"
              fill="var(--color-yellow-500)"
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={false}
              name="CPU"
            />
            <Bar dataKey="memory" fill="var(--color-brand-500)" barSize={20} isAnimationActive={false} name="Memory" />
            <Line
              type="linear"
              dataKey="disk"
              stroke="var(--color-green-500)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              name="Disk"
            />
            {!isCtrlPressed && zoomState.refAreaLeft && zoomState.refAreaRight ? (
              <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} />
            ) : null}
          </ComposedChart>
        </Chart.Container>
      </div>
    )
  },
}

export const MaximalEdgeCase = {
  render: () => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704081600, { tickCount: 10 }) // Custom tick count for demo
    return (
      <Chart.Container className="h-[400px] w-full p-5 py-2 pr-0">
        <ComposedChart data={maximalEdgeCaseData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
          <XAxis
            {...xAxisConfig}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          <Chart.Tooltip content={<Chart.TooltipContent title="CPU" maxItems={10} />} />
          <Legend />
          {gaffotronMetrics.map((metric, index) => (
            <Line
              key={metric.key}
              type="linear"
              dataKey={metric.key}
              name={metric.key}
              stroke={CHART_COLORS[index]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </Chart.Container>
    )
  },
}

export const EventMarkers = {
  render: () => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704088800) // Default tick count
    return (
      <Chart.Container className="h-[300px] w-full p-5 py-2 pr-0">
        <ComposedChart data={sampleData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis
            {...xAxisConfig}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          <Chart.Tooltip content={<Chart.TooltipContent title="System Usage %" />} />
          <ReferenceLine
            x={1704074400000}
            stroke="var(--color-brand-500)"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              value: 'Deploy Event',
              position: 'top',
              fill: 'var(--color-brand-500)',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
          <ReferenceLine
            x={1704081600000}
            stroke="var(--color-red-500)"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              value: 'Alert Triggered',
              position: 'top',
              fill: 'var(--color-red-500)',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          />
        </ComposedChart>
      </Chart.Container>
    )
  },
}

export const LoadingState = {
  args: {
    isLoading: true,
  },
  render: (args: { isLoading?: boolean }) => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704088800) // Default tick count
    return (
      <Chart.Container {...args} className="h-[300px] w-full p-5 py-2 pr-0">
        <ComposedChart data={sampleData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis
            {...xAxisConfig}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          <Line
            type="linear"
            dataKey="cpu"
            stroke="var(--color-yellow-500)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </Chart.Container>
    )
  },
}

export const EmptyState = {
  args: {
    isEmpty: true,
  },
  render: (args: { isEmpty?: boolean }) => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704088800) // Default tick count
    return (
      <Chart.Container {...args} className="h-[300px] w-full p-5 py-2 pr-0">
        <ComposedChart data={[]} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis
            {...xAxisConfig}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${hours}:${minutes}`
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          <Line
            type="linear"
            dataKey="cpu"
            stroke="var(--color-yellow-500)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </Chart.Container>
    )
  },
}

export default Story
