import type { Meta } from '@storybook/react'
import { Area, AreaChart, Line, LineChart, XAxis, YAxis } from 'recharts'
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
  { time: '00:00', fullTime: '2024-01-01 00:00', value: 20, secondary: 15 },
  { time: '01:00', fullTime: '2024-01-01 01:00', value: 35, secondary: 25 },
  { time: '02:00', fullTime: '2024-01-01 02:00', value: 45, secondary: 40 },
  { time: '03:00', fullTime: '2024-01-01 03:00', value: 30, secondary: 20 },
  { time: '04:00', fullTime: '2024-01-01 04:00', value: 60, secondary: 55 },
  { time: '05:00', fullTime: '2024-01-01 05:00', value: 40, secondary: 35 },
  { time: '06:00', fullTime: '2024-01-01 06:00', value: 80, secondary: 70 },
]

export const LineChartExample = {
  render: () => (
    <Chart.Container>
      <LineChart data={sampleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="time" />
        <YAxis />
        <Chart.Tooltip content={<Chart.TooltipContent title="Performance Metrics" />} />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
        <Line type="monotone" dataKey="secondary" stroke="#7c3aed" strokeWidth={2} />
      </LineChart>
    </Chart.Container>
  ),
}

export const AreaChartExample = {
  render: () => (
    <Chart.Container>
      <AreaChart data={sampleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="time" />
        <YAxis />
        <Chart.Tooltip content={<Chart.TooltipContent title="Usage Metrics" />} />
        <Area type="monotone" dataKey="value" stackId="1" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
        <Area type="monotone" dataKey="secondary" stackId="1" stroke="#7c3aed" fill="#8b5cf6" fillOpacity={0.6} />
      </AreaChart>
    </Chart.Container>
  ),
}

export const LoadingState = {
  args: {
    isLoading: true,
  },
  render: (args: any) => (
    <Chart.Container {...args}>
      <LineChart data={sampleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="time" />
        <YAxis />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </Chart.Container>
  ),
}

export const EmptyState = {
  args: {
    isEmpty: true,
  },
  render: (args: any) => (
    <Chart.Container {...args}>
      <LineChart data={[]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="time" />
        <YAxis />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </Chart.Container>
  ),
}

export const CustomTooltip = {
  render: () => (
    <Chart.Container>
      <LineChart data={sampleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="time" />
        <YAxis />
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
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
        <Line type="monotone" dataKey="secondary" stroke="#7c3aed" strokeWidth={2} />
      </LineChart>
    </Chart.Container>
  ),
}

export default Story