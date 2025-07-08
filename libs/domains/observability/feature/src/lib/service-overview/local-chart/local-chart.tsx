import { type OrganizationEventResponse, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, Customized, LineChart, XAxis, YAxis } from 'recharts'
import { useService } from '@qovery/domains/services/feature'
import { Button, Chart, Heading, Icon, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useEvents } from '../../hooks/use-events/use-events'
import { type MetricData, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { ModalChart } from '../modal-chart/modal-chart'
import ReferenceLineEvents from '../reference-line-events/reference-line-events'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { Tooltip, type UnitType } from './tooltip'

interface ChartContentProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: UnitType
  label: string
  isEmpty: boolean
  isLoading: boolean
  events?: OrganizationEventResponse[]
  kubeEvents?: {
    data?: {
      result?: MetricData[]
    }
  }
}

function ChartContent({ data, unit, label, isEmpty, isLoading, children, events, kubeEvents }: ChartContentProps) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents } = useServiceOverviewContext()
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  function getDomain() {
    return [Number(startTimestamp) * 1000, Number(endTimestamp) * 1000]
  }

  function getLogicalTicks(): number[] {
    const startTime = Number(startTimestamp) * 1000
    const endTime = Number(endTimestamp) * 1000

    const ticks: number[] = []
    const interval = (endTime - startTime) / 5 // 5 intervals for 6 ticks

    for (let i = 0; i < 6; i++) {
      ticks.push(startTime + interval * i)
    }

    return ticks
  }

  return (
    <Chart.Container className="h-full w-full p-5 pb-2 pr-0" isLoading={isLoading} isEmpty={isEmpty}>
      <LineChart
        data={data}
        syncId="syncId"
        margin={{ top: 2, bottom: 0, left: 0, right: 0 }}
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
          allowDataOverflow={true}
          interval="preserveStartEnd"
          strokeDasharray="3 3"
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
          tickLine={{ stroke: 'transparent' }}
          axisLine={{ stroke: 'var(--color-neutral-250)' }}
          strokeDasharray="3 3"
          orientation="right"
          tickCount={5}
        />
        <Chart.Tooltip
          isAnimationActive={false}
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
  )
}

interface LocalChartProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: UnitType
  label: string
  isEmpty: boolean
  isLoading: boolean
  serviceId: string
  clusterId: string
  className?: string
  fullscreen?: boolean
}

export function LocalChart({
  data,
  unit,
  isLoading = false,
  isEmpty = false,
  label,
  className,
  children,
  serviceId,
  clusterId,
  fullscreen = true,
}: LocalChartProps) {
  const { organizationId = '' } = useParams()
  const { startTimestamp, endTimestamp } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    query: `sum by(type, reason) (increase(k8s_event_logger_q_k8s_events_total{qovery_com_service_id="${serviceId}", type="Warning"}[1m]))`,
  })

  return (
    <>
      <Section className={twMerge('h-full min-h-[300px] w-full', className)}>
        <div className="flex w-full items-center justify-between gap-1 p-5 pb-0">
          <Heading className="scroll-mt-20">{label}</Heading>
          {fullscreen && (
            <Button
              variant="surface"
              color="neutral"
              size="xs"
              className="gap-1.5"
              onClick={() => setIsModalOpen(true)}
            >
              Fullscreen
              <Icon iconName="eye" iconStyle="regular" />
            </Button>
          )}
        </div>
        <ChartContent
          data={data}
          unit={unit}
          label={label}
          isEmpty={isEmpty}
          isLoading={isLoading}
          events={events}
          kubeEvents={kubeEvents}
        >
          {children}
        </ChartContent>
      </Section>
      {isModalOpen && (
        <ModalChart title={label} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ChartContent
            data={data}
            unit={unit}
            label={label}
            isEmpty={isEmpty}
            isLoading={isLoading}
            events={events}
            kubeEvents={kubeEvents}
          >
            {children}
          </ChartContent>
        </ModalChart>
      )}
    </>
  )
}

export default LocalChart
