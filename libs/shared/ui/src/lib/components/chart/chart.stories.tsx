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

const sampleData = [
  { timestamp: 1704067200000, time: '00:00', fullTime: '2024-01-01 00:00:00', value: 20, secondary: 15 },
  { timestamp: 1704070800000, time: '01:00', fullTime: '2024-01-01 01:00:00', value: 35, secondary: 25 },
  { timestamp: 1704074400000, time: '02:00', fullTime: '2024-01-01 02:00:00', value: 45, secondary: 40 },
  { timestamp: 1704078000000, time: '03:00', fullTime: '2024-01-01 03:00:00', value: 30, secondary: 20 },
  { timestamp: 1704081600000, time: '04:00', fullTime: '2024-01-01 04:00:00', value: 60, secondary: 55 },
  { timestamp: 1704085200000, time: '05:00', fullTime: '2024-01-01 05:00:00', value: 40, secondary: 35 },
  { timestamp: 1704088800000, time: '06:00', fullTime: '2024-01-01 06:00:00', value: 80, secondary: 70 },
]

export const LineChartExample = {
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
          tickFormatter={(value) => value === 0 ? '' : value}
        />
        <Chart.Tooltip content={<Chart.TooltipContent title="Performance Metrics" />} />
        <Line type="linear" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
        <Line type="linear" dataKey="secondary" stroke="var(--color-purple-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
      </ComposedChart>
    </Chart.Container>
  ),
}

export const AreaChartExample = {
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
          tickFormatter={(value) => value === 0 ? '' : value}
        />
        <Chart.Tooltip content={<Chart.TooltipContent title="Usage Metrics" />} />
        <Area type="linear" dataKey="value" stackId="httpErrors" stroke="var(--color-brand-500)" fill="var(--color-brand-500)" fillOpacity={0.6} strokeWidth={2} isAnimationActive={false} />
        <Area type="linear" dataKey="secondary" stackId="httpErrors" stroke="var(--color-purple-500)" fill="var(--color-purple-500)" fillOpacity={0.6} strokeWidth={2} isAnimationActive={false} />
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
          tickFormatter={(value) => value === 0 ? '' : value}
        />
        <Line type="linear" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
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
          tickFormatter={(value) => value === 0 ? '' : value}
        />
        <Line type="linear" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
      </ComposedChart>
    </Chart.Container>
  ),
}

export const CustomTooltip = {
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
          tickFormatter={(value) => value === 0 ? '' : value}
        />
        <Chart.Tooltip
          content={
            <Chart.TooltipContent
              title="Custom Metrics"
              formatValue={(value, dataKey) => {
                if (dataKey === 'value') return `${value}ms`
                if (dataKey === 'secondary') return `${value}%`
                return value
              }}
              formatLabel={(dataKey) => {
                if (dataKey === 'value') return 'Response Time'
                if (dataKey === 'secondary') return 'CPU Usage'
                return dataKey
              }}
            />
          }
        />
        <Line type="linear" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
        <Line type="linear" dataKey="secondary" stroke="var(--color-purple-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
      </ComposedChart>
    </Chart.Container>
  ),
}

export const WithReferenceLines = {
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
          tickFormatter={(value) => value === 0 ? '' : value}
        />
        <Chart.Tooltip content={<Chart.TooltipContent title="Performance with Events" />} />
        <Line type="linear" dataKey="value" stroke="var(--color-brand-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
        <Line type="linear" dataKey="secondary" stroke="var(--color-purple-500)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
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