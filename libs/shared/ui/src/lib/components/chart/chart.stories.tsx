import type { Meta } from '@storybook/react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '../badge/badge'
import { Chart, useZoomableChart } from './chart'
import { createXAxisConfig, getTimeGranularity } from './chart-utils'

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

// Build a larger palette from base colors by generating lighter tints using CSS color-mix.
// This yields up to base.length * 3 distinct shades.
function createExpandedPalette(baseColors: string[], desiredCount: number): string[] {
  const variants: number[] = [100, 75, 55] // 100% base, then lighter tints
  const expanded: string[] = []
  outer: for (const weight of variants) {
    for (const base of baseColors) {
      if (expanded.length >= desiredCount) break outer
      if (weight === 100) {
        expanded.push(base)
      } else {
        // Use color-mix to generate a lighter tint of the base color
        expanded.push(`color-mix(in srgb, ${base} ${weight}%, white)`) // e.g., 75% base + 25% white
      }
    }
  }
  // If still not enough, cycle base colors
  while (expanded.length < desiredCount) {
    expanded.push(baseColors[expanded.length % baseColors.length])
  }
  return expanded
}

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

// Generate N unique instance metrics (default 50)
const generateMetrics = (count = 50) => {
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

  const uuids: string[] = []
  for (let i = 0; i < count; i++) {
    const base = baseUUIDs[i % baseUUIDs.length]
    const suffix = Math.floor(i / baseUUIDs.length) // 0,1,2...
    uuids.push(suffix === 0 ? base : `${base}${suffix}`)
  }

  return uuids.map((uuid) => ({
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
const maximalMetrics = generateMetrics(50)
const maximalEdgeCaseData = generateTimeSeriesData(maximalMetrics)
const EXPANDED_COLORS_50 = createExpandedPalette(CHART_COLORS, 50)

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

// Inline legend under the chart: one-line, horizontally scrollable, hidden scrollbar
function LegendInline({
  items,
  rightGutterWidth = 48,
}: {
  items: Array<{ label: string; color: string }>
  rightGutterWidth?: number
}) {
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (!event.currentTarget) return
    if (event.deltaY === 0) return
    event.preventDefault()
    event.currentTarget.scrollLeft += event.deltaY
  }

  if (!items || items.length === 0) return null

  return (
    <>
      <style>{`
        .legend-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .legend-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>
      <div className="relative mt-2" style={{ width: `calc(100% - ${rightGutterWidth}px)` }}>
        <div
          onWheel={handleWheel}
          className="legend-scrollbar m-0 box-border flex w-full flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap p-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((entry) => (
            <Badge key={entry.label} radius="full" className="gap-2">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.label}</span>
            </Badge>
          ))}
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 h-full"
          style={{ width: '2.5rem', background: 'linear-gradient(to left, white, rgba(255,255,255,0))' }}
        />
      </div>
    </>
  )
}

export const ComposableChart = {
  parameters: {
    docs: {
      description: {
        story: `
The chart supports mixed visualization types including area charts, bar charts, and line charts with customizable tooltip, legend, and zoom functionality.

#### Zoom Controls:
- **Drag** to select an area and zoom in
- **Ctrl/Cmd + Click** to zoom out one step
- **Double-click** to reset zoom to original view
- **Mouse cursor** changes based on interaction mode
        `,
      },
    },
  },
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
      getXAxisTicks,
    } = useZoomableChart()

    const defaultDomain: [number | string, number | string] = [1704067200000, 1704088800000]
    const domain = getXDomain(defaultDomain)
    const ticks = getXAxisTicks(defaultDomain, 7)

    const xAxisConfig = createXAxisConfig(1704067200, 1704088800, { tickCount: 7 })

    return (
      <div className="w-full p-5 py-2 pr-0">
        <Chart.Container className="h-[400px] w-full select-none">
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
              ticks={ticks.length > 0 ? ticks : xAxisConfig.ticks}
              type="number"
              dataKey="timestamp"
              tick={{ ...xAxisConfig.tick }}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp)

                // Get current zoom domain for dynamic time granularity
                const [startMs, endMs] = domain.map((d) =>
                  typeof d === 'number'
                    ? d
                    : d === 'dataMin'
                      ? (defaultDomain[0] as number)
                      : (defaultDomain[1] as number)
                )
                const granularity = getTimeGranularity(startMs, endMs)

                const pad = (num: number) => num.toString().padStart(2, '0')

                switch (granularity) {
                  case 'seconds':
                    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
                  case 'minutes':
                    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
                  case 'days':
                  default:
                    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
                }
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
        <LegendInline
          items={[
            { label: 'CPU', color: 'var(--color-yellow-500)' },
            { label: 'Memory', color: 'var(--color-brand-500)' },
            { label: 'Disk', color: 'var(--color-green-500)' },
          ]}
        />
      </div>
    )
  },
}

export const MaximalEdgeCase = {
  render: () => {
    const xAxisConfig = createXAxisConfig(1704067200, 1704081600, { tickCount: 10 }) // Custom tick count for demo
    return (
      <div className="w-full p-5 py-2 pr-0">
        <Chart.Container className="h-[400px] w-full">
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
            {maximalMetrics.map((metric, index) => (
              <Line
                key={metric.key}
                type="linear"
                dataKey={metric.key}
                name={metric.key}
                stroke={EXPANDED_COLORS_50[index]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </Chart.Container>
        <LegendInline items={maximalMetrics.map((m, i) => ({ label: m.key, color: EXPANDED_COLORS_50[i] }))} />
      </div>
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
