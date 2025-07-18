import type { IconName, IconStyle } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { type OrganizationEventResponse, OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, ComposedChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { Button, Chart, Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useEvents } from '../../hooks/use-events/use-events'
import { ModalChart } from '../modal-chart/modal-chart'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { Tooltip as TooltipChart, type UnitType } from './tooltip'

export interface ReferenceLineEvent {
  type: 'metric' | 'event' | 'exit-code'
  timestamp: number
  reason: string
  icon: IconName
  key: string
  description?: string
  iconStyle?: IconStyle
  version?: string
  repository?: string
}

interface ChartContentProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: UnitType
  label: string
  isEmpty: boolean
  isLoading: boolean
  xDomain?: [number | string, number | string]
  yDomain?: [number | string, number | string]
  tooltipLabel?: string
  events?: OrganizationEventResponse[]
  margin?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  referenceLineData?: ReferenceLineEvent[]
  service?: AnyService
  isFullscreen?: boolean
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
  xDomain,
  yDomain,
  margin = { top: 14, bottom: 0, left: 0, right: 0 },
  referenceLineData,
  service,
  isFullscreen = true,
}: ChartContentProps) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents, hoveredEventKey, setHoveredEventKey } =
    useServiceOverviewContext()
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  function getXDomain() {
    return xDomain ?? [Number(startTimestamp) * 1000, Number(endTimestamp) * 1000]
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
    <div className="flex h-full">
      <Chart.Container className="h-full w-full p-5 py-2 pr-0" isLoading={isLoading} isEmpty={isEmpty}>
        <ComposedChart
          data={data}
          syncId="syncId"
          margin={margin}
          onMouseMove={() => setOnHoverHideTooltip(true)}
          onMouseLeave={() => setOnHoverHideTooltip(false)}
          onMouseUp={() => setOnHoverHideTooltip(false)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-250)" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={getXDomain()}
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
          <Chart.Tooltip
            isAnimationActive={false}
            content={
              !onHoverHideTooltip ? (
                <div />
              ) : (
                <TooltipChart customLabel={tooltipLabel ?? label} unit={unit} events={events} />
              )
            }
          />
          {children}
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'var(--color-neutral-250)' }}
            strokeDasharray="3 3"
            orientation="right"
            tickCount={5}
            domain={yDomain}
          />
        </ComposedChart>
      </Chart.Container>
      {isFullscreen && referenceLineData && referenceLineData.length > 0 && !hideEvents && (
        <div className="flex h-[87vh] w-full min-w-[420px] max-w-[420px] flex-col border-l border-neutral-200">
          <p className="border-b border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-500">
            {pluralize(referenceLineData.length, 'Event', 'Events')} associated
          </p>
          <div className="h-full overflow-y-auto">
            {referenceLineData.map((event) => {
              const timestamp = formatTimestamp(event.timestamp, useLocalTime)
              return (
                <div
                  key={event.key}
                  className={clsx(
                    'flex gap-2 border-b border-neutral-200 px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100',
                    {
                      'bg-neutral-100': hoveredEventKey === event.key,
                    }
                  )}
                  onMouseEnter={() => setHoveredEventKey(event.key)}
                  onMouseLeave={() => setHoveredEventKey(null)}
                >
                  <span
                    className={clsx(
                      'flex h-5 min-h-5 w-5 min-w-5 items-center justify-center rounded-full',
                      event.type === 'event' ? 'bg-brand-500' : 'bg-red-500'
                    )}
                  >
                    <Icon
                      iconName={event.icon}
                      iconStyle={event.iconStyle ?? 'regular'}
                      className="text-xs text-white"
                    />
                  </span>
                  <div className="flex w-full flex-col gap-1 text-xs">
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium">{event.reason}</span>
                      <span className="text-neutral-350">{timestamp.fullTimeString}</span>
                    </div>
                    {event.type === 'event' && (
                      <>
                        <span className="text-neutral-350">
                          {service?.serviceType === 'CONTAINER' ? 'Image name' : 'Repository'}: {event.repository}
                        </span>
                        <span className="text-neutral-350">
                          {service?.serviceType === 'CONTAINER' ? 'Tag' : 'Version'}: {event.version?.slice(0, 8)}
                        </span>
                      </>
                    )}
                    {event.description && <span className="text-neutral-350">{event.description}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface LocalChartProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: UnitType
  isEmpty: boolean
  isLoading: boolean
  serviceId: string
  label?: string
  className?: string
  tooltipLabel?: string
  yDomain?: [number | string, number | string]
  xDomain?: [number | string, number | string]
  margin?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  referenceLineData?: ReferenceLineEvent[]
  isFullscreen?: boolean
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
  yDomain,
  xDomain,
  margin,
  referenceLineData,
  isFullscreen = false,
}: LocalChartProps) {
  const { organizationId = '' } = useParams()
  const { startTimestamp, endTimestamp, hoveredEventKey, setHoveredEventKey } = useServiceOverviewContext()
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

  const eventsFiltered = events?.filter((event) => event.target_id === serviceId)

  const eventReferenceLines: ReferenceLineEvent[] = (eventsFiltered || [])
    .filter((event) => event.event_type === 'TRIGGER_DEPLOY' && event.target_id === serviceId)
    .map((event) => {
      const eventTimestamp = new Date(event.timestamp!).getTime()
      const key = `event-${event.id || eventTimestamp}`
      const change = JSON.parse(event.change || '')
      // TODO: Add support for other service types and clean-up api endpoint
      const version =
        change?.service_source?.image?.tag ??
        change?.service_source?.docker?.git_repository?.deployed_commit_id ??
        'Unknown'

      const repository =
        change?.service_source?.image?.image_name ?? change?.service_source?.docker?.git_repository?.url ?? 'Unknown'

      return {
        type: 'event',
        timestamp: eventTimestamp,
        reason: 'Trigger deploy',
        icon: 'play',
        iconStyle: 'solid',
        version,
        repository,
        key,
      }
    })

  // Merge with any referenceLineData passed as prop
  const mergedReferenceLineData = [...(referenceLineData || []), ...eventReferenceLines]

  return (
    <>
      <Section className={twMerge('h-full min-h-[300px] w-full', className)}>
        {label && (
          <div className="flex w-full items-center justify-between gap-1 p-5 pb-0">
            <Heading className="scroll-mt-20">{label}</Heading>
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
          </div>
        )}
        <ChartContent
          data={data}
          unit={unit}
          label={label ?? ''}
          tooltipLabel={tooltipLabel}
          isEmpty={isEmpty}
          isLoading={isLoading}
          events={eventsFiltered}
          xDomain={xDomain}
          yDomain={yDomain}
          margin={margin}
          referenceLineData={mergedReferenceLineData}
          service={service}
          isFullscreen={isFullscreen}
        >
          {/* Render reference lines for events of type 'event' */}
          {mergedReferenceLineData
            .filter((event) => event.type === 'event')
            .map((event) => (
              <ReferenceLine
                key={event.key}
                x={event.timestamp}
                stroke="var(--color-brand-500)"
                strokeDasharray="3 3"
                opacity={hoveredEventKey === event.key ? 1 : 0.3}
                strokeWidth={2}
                onMouseEnter={() => setHoveredEventKey(event.key)}
                onMouseLeave={() => setHoveredEventKey(null)}
                label={{
                  value: hoveredEventKey === event.key ? event.reason : undefined,
                  position: 'top',
                  fill: 'var(--color-brand-500)',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            ))}
          {children}
        </ChartContent>
      </Section>
      {isModalOpen && (
        <ModalChart title={label ?? ''} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ChartContent
            data={data}
            unit={unit}
            label={label ?? ''}
            tooltipLabel={tooltipLabel}
            isEmpty={isEmpty}
            isLoading={isLoading}
            events={eventsFiltered}
            xDomain={xDomain}
            yDomain={yDomain}
            margin={margin}
            referenceLineData={mergedReferenceLineData}
            service={service}
            isFullscreen={true}
          >
            {/* Render reference lines for events of type 'event' in modal as well */}
            {mergedReferenceLineData
              .filter((event) => event.type === 'event')
              .map((event) => (
                <ReferenceLine
                  key={event.key}
                  x={event.timestamp}
                  stroke="var(--color-brand-500)"
                  strokeDasharray="3 3"
                  opacity={hoveredEventKey === event.key ? 1 : 0.3}
                  strokeWidth={2}
                  onMouseEnter={() => setHoveredEventKey(event.key)}
                  onMouseLeave={() => setHoveredEventKey(null)}
                  label={{
                    value: hoveredEventKey === event.key ? event.reason : undefined,
                    position: 'top',
                    fill: 'var(--color-brand-500)',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                />
              ))}
            {children}
          </ChartContent>
        </ModalChart>
      )}
    </>
  )
}

export default LocalChart
