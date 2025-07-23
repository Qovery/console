import type { Meta } from '@storybook/react'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Chart } from './chart'

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

// Generate 20 unique gaffotron instance metrics
const generateGaffotronMetrics = () => {
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
    key: `gaffotron-889b7db58-${uuid}`,
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
const generateTimeSeriesData = (metrics: ReturnType<typeof generateGaffotronMetrics>) => {
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

// Generate color palette mapping
const generateColorPalette = (): string[] => {
  const colorFamilies = [
    { family: 'brand', shades: ['500', '400', '300', '600'] },
    { family: 'red', shades: ['500', '400', '300', '600'] },
    { family: 'yellow', shades: ['500', '400', '300', '600'] },
    { family: 'green', shades: ['500', '400', '300', '600'] },
    { family: 'purple', shades: ['500', '400', '300', '600'] },
    { family: 'sky', shades: ['500', '400', '300', '600'] },
  ]

  const colors: string[] = []
  colorFamilies.forEach((colorFamily) => {
    colorFamily.shades.forEach((shade) => {
      colors.push(`var(--color-${colorFamily.family}-${shade})`)
    })
  })

  return colors.slice(0, 20) // Ensure exactly 20 colors
}

// Generate all data
const gaffotronMetrics = generateGaffotronMetrics()
const maximalEdgeCaseData = generateTimeSeriesData(gaffotronMetrics)
const colorPalette = generateColorPalette()

export const LineChart = {
  render: () => (
    <Chart.Container className="h-[400px] w-full p-5 py-2 pr-0">
      <ComposedChart data={maximalEdgeCaseData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={[1704067200000, 1704081600000]}
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp)
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            return `${hours}:${minutes}`
          }}
          strokeDasharray="3 3"
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'transparent' }}
          orientation="right"
          tickCount={5}
          tickFormatter={(value) => (value === 0 ? '' : value)}
        />
        <Chart.Tooltip content={<Chart.TooltipContent title="CPU" />} />
        {gaffotronMetrics.map((metric, index) => (
          <Line
            key={metric.key}
            type="linear"
            dataKey={metric.key}
            stroke={colorPalette[index]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </Chart.Container>
  ),
}

export const AreaChart = {
  render: () => (
    <Chart.Container className="h-[300px] w-full p-5 py-2 pr-0">
      <ComposedChart data={sampleData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={[1704067200000, 1704088800000]}
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp)
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            return `${hours}:${minutes}`
          }}
          strokeDasharray="3 3"
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
        <Area
          type="linear"
          dataKey="cpu"
          stackId="systemMetrics"
          stroke="var(--color-yellow-500)"
          fill="var(--color-yellow-500)"
          fillOpacity={0.6}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          type="linear"
          dataKey="memory"
          stackId="systemMetrics"
          stroke="var(--color-purple-500)"
          fill="var(--color-purple-500)"
          fillOpacity={0.6}
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Area
          type="linear"
          dataKey="disk"
          stackId="systemMetrics"
          stroke="var(--color-sky-500)"
          fill="var(--color-sky-500)"
          fillOpacity={0.6}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </ComposedChart>
    </Chart.Container>
  ),
}

export const LoadingState = {
  args: {
    isLoading: true,
  },
  render: (args: { isLoading?: boolean }) => (
    <Chart.Container {...args} className="h-[300px] w-full p-5 py-2 pr-0">
      <ComposedChart data={sampleData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={[1704067200000, 1704088800000]}
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          strokeDasharray="3 3"
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
  ),
}

export const EmptyState = {
  args: {
    isEmpty: true,
  },
  render: (args: { isEmpty?: boolean }) => (
    <Chart.Container {...args} className="h-[300px] w-full p-5 py-2 pr-0">
      <ComposedChart data={[]} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          strokeDasharray="3 3"
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
  ),
}

export const EventMarkers = {
  render: () => (
    <Chart.Container className="h-[300px] w-full p-5 py-2 pr-0">
      <ComposedChart data={sampleData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
        <XAxis
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={[1704067200000, 1704088800000]}
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp)
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            return `${hours}:${minutes}`
          }}
          strokeDasharray="3 3"
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
        <Line
          type="linear"
          dataKey="cpu"
          stroke="var(--color-yellow-500)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          type="linear"
          dataKey="memory"
          stroke="var(--color-purple-500)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          type="linear"
          dataKey="disk"
          stroke="var(--color-sky-500)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
        />
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
  ),
}

export default Story
