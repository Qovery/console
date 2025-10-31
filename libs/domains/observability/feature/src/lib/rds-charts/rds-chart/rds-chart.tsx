import { type PropsWithChildren } from 'react'
import { CartesianGrid, ComposedChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Chart, createXAxisConfig, getTimeGranularity } from '@qovery/shared/ui'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'

interface RdsChartProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: string
  label: string
  description: string
  isEmpty: boolean
  isLoading: boolean
}

export function RdsChart({ data, unit, label, description, isEmpty, isLoading, children }: RdsChartProps) {
  const { startTimestamp, endTimestamp, useLocalTime } = useRdsManagedDbContext()

  const startMs = Number(startTimestamp) * 1000
  const endMs = Number(endTimestamp) * 1000

  const xDomain: [number | string, number | string] = [startMs, endMs]

  const xAxisConfig = createXAxisConfig(Number(startTimestamp), Number(endTimestamp))

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Chart.Loader />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 p-4">
        <p className="text-sm font-medium text-neutral-350">{label}</p>
        <p className="text-xs text-neutral-350">No data available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-400">{label}</h3>
          <p className="text-xs text-neutral-350">{description}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" vertical={false} />
          <XAxis
            {...xAxisConfig}
            domain={xDomain}
            stroke="var(--color-neutral-300)"
            tick={{ fill: 'var(--color-neutral-350)', fontSize: 12 }}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const pad = (num: number) => num.toString().padStart(2, '0')

              if (useLocalTime) {
                return `${pad(date.getHours())}:${pad(date.getMinutes())}`
              } else {
                const utcHours = date.getUTCHours()
                const utcMinutes = date.getUTCMinutes()
                return `${pad(utcHours)}:${pad(utcMinutes)}`
              }
            }}
          />
          <YAxis
            stroke="var(--color-neutral-300)"
            tick={{ fill: 'var(--color-neutral-350)', fontSize: 12 }}
            label={{ value: unit, angle: -90, position: 'insideLeft', style: { fill: 'var(--color-neutral-350)' } }}
          />
          <Chart.Tooltip content={<Chart.TooltipContent title={label} />} />
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RdsChart
