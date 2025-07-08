import { type OrganizationEventResponse, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, Customized, LineChart, XAxis, YAxis } from 'recharts'
import { useService } from '@qovery/domains/services/feature'
import { Button, Chart, Heading, Section, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useEvents } from '../../hooks/use-events/use-events'
import { type MetricData, useMetrics } from '../../hooks/use-metrics/use-metrics'
import { ModalChart } from '../modal-chart/modal-chart'
import ReferenceLineEvents from '../reference-line-events/reference-line-events'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { Tooltip as TooltipChart, type UnitType } from './tooltip'

interface ChartContentProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: UnitType
  label: string
  isEmpty: boolean
  isLoading: boolean
  tooltipLabel?: string
  events?: OrganizationEventResponse[]
  kubeEvents?: {
    data?: {
      result?: MetricData[]
    }
  }
}

function ChartContent({
  data,
  unit,
  label,
  tooltipLabel,
  isEmpty,
  isLoading,
  children,
  events,
  kubeEvents,
}: ChartContentProps) {
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
              <TooltipChart customLabel={tooltipLabel ?? label} unit={unit} events={events} kubeEvents={kubeEvents} />
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
  tooltipLabel?: string
}

export function LocalChart({
  data,
  unit,
  isLoading = false,
  isEmpty = false,
  label,
  tooltipLabel,
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
            <Tooltip content="Mode fullscreen">
              <Button
                variant="plain"
                color="neutral"
                size="sm"
                className="w-7 items-center justify-center p-0"
                onClick={() => setIsModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <g fill="#67778E" fillRule="evenodd" clipPath="url(#clip0_25081_61823)" clipRule="evenodd">
                    <path d="M2.866 2.133a.733.733 0 0 0-.733.733v1.467a.733.733 0 1 1-1.467 0V2.866a2.2 2.2 0 0 1 2.2-2.2h1.467a.733.733 0 1 1 0 1.467zM10.933 1.4c0-.406.328-.734.733-.734h1.467a2.2 2.2 0 0 1 2.2 2.2v1.467a.733.733 0 1 1-1.467 0V2.866a.733.733 0 0 0-.733-.733h-1.467a.733.733 0 0 1-.733-.734M14.6 10.933c.404 0 .733.328.733.733v1.467a2.2 2.2 0 0 1-2.2 2.2h-1.467a.733.733 0 0 1 0-1.467h1.467a.733.733 0 0 0 .733-.733v-1.467c0-.405.328-.733.733-.733M1.4 10.933c.404 0 .733.328.733.733v1.467a.733.733 0 0 0 .733.733h1.467a.733.733 0 1 1 0 1.467H2.866a2.2 2.2 0 0 1-2.2-2.2v-1.467c0-.405.328-.733.733-.733M3.6 5.8c0-.81.656-1.467 1.466-1.467h5.867c.81 0 1.466.656 1.466 1.466v4.4c0 .81-.656 1.467-1.466 1.467H5.066c-.81 0-1.467-.657-1.467-1.467zm7.333 0H5.066v4.4h5.867z"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_25081_61823">
                      <path fill="#fff" d="M0 0h16v16H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
              </Button>
            </Tooltip>
          )}
        </div>
        <ChartContent
          data={data}
          unit={unit}
          label={label}
          tooltipLabel={tooltipLabel}
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
            tooltipLabel={tooltipLabel}
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
