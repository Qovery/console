import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, Customized, LineChart, XAxis, YAxis } from 'recharts'
import { useService } from '@qovery/domains/services/feature'
import { Chart, Heading, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import useEvents from '../../hooks/use-events/use-events'
import { useMetrics } from '../../hooks/use-metrics/use-metrics'
import ReferenceLineEvents from '../reference-line-events/reference-line-events'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { Tooltip, type UnitType } from './tooltip'

interface LocalChartProps extends PropsWithChildren {
  id: string
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: UnitType
  label: string
  isEmpty: boolean
  isLoading: boolean
  serviceId: string
  clusterId: string
  className?: string
}

export function LocalChart({
  id,
  data,
  unit,
  isLoading = false,
  isEmpty = false,
  label,
  className,
  children,
  serviceId,
  clusterId,
}: LocalChartProps) {
  const { organizationId = '' } = useParams()
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents } = useServiceOverviewContext()
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  // Alpha: Workaround to get the events
  const { data: service } = useService({ serviceId })

  const { data: events } = useEvents({
    organizationId,
    serviceId,
    targetType:
      service?.service_type === 'CONTAINER'
        ? OrganizationEventTargetType.CONTAINER
        : OrganizationEventTargetType.APPLICATION,
    toTimestamp: endTimestamp,
    fromTimestamp: startTimestamp,
  })

  const { data: kubeEvents } = useMetrics({
    clusterId,
    startTimestamp,
    endTimestamp,
    query: `sum by(type, reason) (increase(k8s_event_logger_q_k8s_events_total{qovery_service_id="${serviceId}", type="Warning"}[1m]))`,
  })

  function getDomain() {
    if (!data || data.length === 0) {
      return [Number(startTimestamp) * 1000, Number(endTimestamp) * 1000]
    }

    const dataMin = Math.min(...data.map((d) => d.timestamp))
    const dataMax = Math.max(...data.map((d) => d.timestamp))

    return [dataMin, dataMax]
  }

  function getLogicalTicks(): number[] {
    const startTime = Number(startTimestamp) * 1000
    const endTime = Number(endTimestamp) * 1000
    const durationMs = endTime - startTime
    const durationHours = durationMs / (1000 * 60 * 60)

    // Calculate appropriate interval based on time range duration
    let intervalMinutes: number
    if (durationHours >= 24) {
      intervalMinutes = 60 // 1 hour
    } else if (durationHours >= 6) {
      intervalMinutes = 15 // 15 minutes
    } else if (durationHours >= 3) {
      intervalMinutes = 10 // 10 minutes
    } else if (durationHours >= 1) {
      intervalMinutes = 5 // 5 minutes
    } else {
      intervalMinutes = 1 // 1 minute
    }

    const ticks: number[] = []

    // Always start from the beginning of the hour and work from there
    const baseDate = new Date(startTime)
    if (useLocalTime) {
      baseDate.setMinutes(0, 0, 0)
    } else {
      baseDate.setUTCMinutes(0, 0, 0)
    }

    let current = baseDate.getTime()

    // Move forward to find the first tick that should be visible
    while (current < startTime - intervalMinutes * 60 * 1000) {
      current += intervalMinutes * 60 * 1000
    }

    // Generate ticks extending slightly beyond our range for better visual coverage
    const paddingMs = intervalMinutes * 60 * 1000
    while (current <= endTime + paddingMs) {
      ticks.push(current)
      current += intervalMinutes * 60 * 1000
    }

    // Only return ticks that make sense for our visible range
    return ticks.filter((tick) => {
      // Include ticks that are close enough to our range to be useful
      return tick >= startTime - paddingMs && tick <= endTime + paddingMs
    })
  }

  return (
    <Section className={twMerge('h-full min-h-[300px] w-full', className)}>
      <div className="w-full p-4">
        <Heading id={id} className="scroll-mt-20">
          {label}
        </Heading>
      </div>
      <Chart.Container className="-ml-4 h-full w-[calc(100%+1rem)] pr-4" isLoading={isLoading} isEmpty={isEmpty}>
        <LineChart
          data={data}
          syncId="syncId"
          margin={{ top: 3, bottom: 10 }}
          onMouseMove={() => setOnHoverHideTooltip(true)}
          onMouseLeave={() => setOnHoverHideTooltip(false)}
          onMouseUp={() => setOnHoverHideTooltip(false)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-250)" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={getDomain()}
            ticks={getLogicalTicks()}
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'var(--color-neutral-250)' }}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)
              const isLongRange = () => {
                const durationInHours = (Number(endTimestamp) - Number(startTimestamp)) / (60 * 60)
                return durationInHours > 24
              }
              if (isLongRange()) {
                const day = useLocalTime
                  ? date.getDate().toString().padStart(2, '0')
                  : date.getUTCDate().toString().padStart(2, '0')
                const month = useLocalTime ? (date.getMonth() + 1).toString().padStart(2, '0') : date.getUTCMonth() + 1
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
              return `${hours}:${minutes}`
            }}
            allowDataOverflow={false}
            strokeDasharray="3 3"
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'var(--color-neutral-250)' }}
            strokeDasharray="3 3"
          />
          <Chart.Tooltip
            content={
              !onHoverHideTooltip ? (
                <div />
              ) : (
                <Tooltip customLabel={label} unit={unit} events={events} kubeEvents={kubeEvents} />
              )
            }
          />
          {children}
          {!hideEvents && <Customized component={ReferenceLineEvents} events={events} />}
        </LineChart>
      </Chart.Container>
    </Section>
  )
}

export default LocalChart
