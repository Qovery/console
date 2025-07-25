import type { IconName, IconStyle } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type PropsWithChildren, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, ComposedChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import { Button, Chart, Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'
import { createXAxisConfig } from '@qovery/shared/ui'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useEvents } from '../../hooks/use-events/use-events'
import { ModalChart } from '../modal-chart/modal-chart'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { Tooltip as TooltipChart, type UnitType } from './tooltip'

export type LineLabelProps = {
  x?: number
  y?: number
  index?: number
  value?: number | string
  [key: string]: unknown
}

export function renderResourceLimitLabel(
  labelText: string,
  chartData: Array<{ [key: string]: string | number | null }>,
  color = 'var(--color-red-500)'
) {
  return (props: LineLabelProps) => {
    const { x, y, index, value } = props
    // Only render for the last point with a value
    if (chartData && index === chartData.length - 1 && value != null) {
      return (
        <text x={x} y={(y ?? 0) - 8} fill={color} fontSize={12} fontWeight={500} textAnchor="end">
          {labelText}
        </text>
      )
    }
    // Return an empty SVG group instead of null to satisfy type requirements
    return <g />
  }
}

export interface ReferenceLineEvent {
  type: 'metric' | 'event' | 'exit-code' | 'k8s-event' | 'probe'
  timestamp: number
  reason: string
  icon: IconName
  key: string
  description?: string
  iconStyle?: IconStyle
  version?: string
  repository?: string
  color?: string
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

  const xAxisConfig = createXAxisConfig(Number(startTimestamp), Number(endTimestamp))

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
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-250)" />
          <XAxis
            {...xAxisConfig}
            domain={getXDomain()}
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
          />
          <Chart.Tooltip
            isAnimationActive={false}
            content={!onHoverHideTooltip ? <div /> : <TooltipChart customLabel={tooltipLabel ?? label} unit={unit} />}
          />
          {children}
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            domain={yDomain}
            tickFormatter={(value) => value === 0 ? '' : value}
          />
        </ComposedChart>
      </Chart.Container>
      {isFullscreen && referenceLineData && referenceLineData.length > 0 && !hideEvents && (
        <div className="flex h-[87vh] w-full min-w-[420px] max-w-[420px] flex-col border-l border-neutral-250">
          <p className="border-b border-neutral-250 bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500">
            {pluralize(referenceLineData.length, 'Event', 'Events')} associated
          </p>
          <div className="h-full overflow-y-auto">
            {referenceLineData.map((event) => {
              const timestamp = formatTimestamp(event.timestamp, useLocalTime)
              return (
                <div
                  key={event.key}
                  className={clsx(
                    'flex gap-2 border-b border-neutral-250 px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-150',
                    {
                      'bg-neutral-150': hoveredEventKey === event.key,
                    }
                  )}
                  onMouseEnter={() => setHoveredEventKey(event.key)}
                  onMouseLeave={() => setHoveredEventKey(null)}
                >
                  <span
                    className="flex h-5 min-h-5 w-5 min-w-5 items-center justify-center rounded-full"
                    style={{ backgroundColor: event.color ?? 'var(--color-red-500)' }}
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
                    {event.type === 'exit-code' && <span className="text-neutral-350">Instance: {event.key}</span>}
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
  description?: string
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
  description,
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
  const { startTimestamp, endTimestamp, hoveredEventKey, setHoveredEventKey, hideEvents } = useServiceOverviewContext()
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
    .filter(
      (event) =>
        (event.event_type === 'TRIGGER_DEPLOY' ||
          event.event_type === 'DEPLOY_FAILED' ||
          event.event_type === 'DEPLOYED') &&
        event.target_id === serviceId
    )
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

      if (event.event_type === 'DEPLOY_FAILED') {
        return {
          type: 'event',
          timestamp: eventTimestamp,
          reason: 'Deploy failed',
          icon: 'xmark',
          color: 'var(--color-red-500)',
          key,
          version,
          repository,
        }
      } else if (event.event_type === 'DEPLOYED') {
        return {
          type: 'event',
          timestamp: eventTimestamp,
          reason: 'Deployed',
          icon: 'check',
          color: 'var(--color-green-500)',
          key,
          version,
          repository,
        }
      } else if (event.event_type === 'TRIGGER_DEPLOY') {
        return {
          type: 'event',
          timestamp: eventTimestamp,
          reason: 'Trigger deploy',
          icon: 'play',
          iconStyle: 'solid',
          color: 'var(--color-brand-500)',
          key,
          version,
          repository,
        }
      }

      return {
        type: 'event',
        timestamp: eventTimestamp,
        reason: 'Unknown',
        icon: 'question',
        color: 'var(--color-neutral-350)',
        key,
        version,
        repository,
      }
    })

  // Merge with any referenceLineData passed as prop
  const mergedReferenceLineData = [...(referenceLineData || []), ...eventReferenceLines]

  return (
    <>
      <Section className={twMerge('h-full min-h-[300px] w-full', className)}>
        {label && (
          <div className="flex w-full items-center justify-between gap-1 p-5 pb-0">
            <Heading className="flex items-center gap-1">
              {label}
              {description && (
                <Tooltip content={description}>
                  <span>
                    <Icon iconName="circle-info" iconStyle="regular" className="text-xs text-neutral-350" />
                  </span>
                </Tooltip>
              )}
            </Heading>
            <Tooltip content="View events details">
              <Button
                variant="surface"
                color="neutral"
                size="xs"
                className="gap-1 pr-1"
                onClick={() => setIsModalOpen(true)}
              >
                Mode fullscreen
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <g fill="#383E50" fillRule="evenodd" clipPath="url(#clip0_25356_47547)" clipRule="evenodd">
                    <path d="M4.15 3.6a.55.55 0 0 0-.55.55v1.1a.55.55 0 1 1-1.1 0v-1.1A1.65 1.65 0 0 1 4.15 2.5h1.1a.55.55 0 1 1 0 1.1zM10.2 3.05a.55.55 0 0 1 .55-.55h1.1a1.65 1.65 0 0 1 1.65 1.65v1.1a.55.55 0 1 1-1.1 0v-1.1a.55.55 0 0 0-.55-.55h-1.1a.55.55 0 0 1-.55-.55M12.95 10.2a.55.55 0 0 1 .55.55v1.1a1.65 1.65 0 0 1-1.65 1.65h-1.1a.55.55 0 1 1 0-1.1h1.1a.55.55 0 0 0 .55-.55v-1.1a.55.55 0 0 1 .55-.55M3.05 10.2a.55.55 0 0 1 .55.55v1.1a.55.55 0 0 0 .55.55h1.1a.55.55 0 1 1 0 1.1h-1.1a1.65 1.65 0 0 1-1.65-1.65v-1.1a.55.55 0 0 1 .55-.55M4.7 6.35a1.1 1.1 0 0 1 1.1-1.1h4.4a1.1 1.1 0 0 1 1.1 1.1v3.3a1.1 1.1 0 0 1-1.1 1.1H5.8a1.1 1.1 0 0 1-1.1-1.1zm5.5 0H5.8v3.3h4.4z"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_25356_47547">
                      <path fill="#fff" d="M2 2h12v12H2z"></path>
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
          xDomain={xDomain}
          yDomain={yDomain}
          margin={margin}
          referenceLineData={mergedReferenceLineData}
          service={service}
          isFullscreen={isFullscreen}
        >
          {/* Render reference lines for events of type 'event' */}
          {!hideEvents &&
            mergedReferenceLineData
              .filter((event) => event.type === 'event')
              .map((event) => (
                <ReferenceLine
                  key={event.key}
                  x={event.timestamp}
                  stroke="var(--color-brand-500)"
                  strokeDasharray="3 3"
                  opacity={hoveredEventKey === event.key ? 1 : 0.3}
                  strokeWidth={1}
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
            xDomain={xDomain}
            yDomain={yDomain}
            margin={margin}
            referenceLineData={mergedReferenceLineData}
            service={service}
            isFullscreen={true}
          >
            {/* Render reference lines for events of type 'event' in modal as well */}
            {!hideEvents &&
              mergedReferenceLineData
                .filter((event) => event.type === 'event')
                .map((event) => (
                  <ReferenceLine
                    key={event.key}
                    x={event.timestamp}
                    stroke="var(--color-brand-500)"
                    strokeDasharray="3 3"
                    opacity={hoveredEventKey === event.key ? 1 : 0.6}
                    strokeWidth={3}
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
