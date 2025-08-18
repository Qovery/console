import type { IconName, IconStyle } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CartesianGrid, ComposedChart, ReferenceArea, ReferenceLine, XAxis, YAxis } from 'recharts'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import {
  Badge,
  Button,
  Chart,
  Heading,
  Icon,
  Section,
  Tooltip,
  createXAxisConfig,
  getTimeGranularity,
  useChartHighlighting,
  useChartHighlightingSync,
  useZoomableChart,
} from '@qovery/shared/ui'
import { getColorByPod } from '@qovery/shared/util-hooks'
import { pluralize, twMerge } from '@qovery/shared/util-js'
import { useEvents } from '../../hooks/use-events/use-events'
import { ModalChart } from '../modal-chart/modal-chart'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'
import { Tooltip as TooltipChart, type UnitType } from './tooltip'

// Utility function to extract chart series information from React children
function extractChartSeriesFromChildren(
  children: React.ReactNode
): Array<{ key: string; label: string; color: string }> {
  const series: Array<{ key: string; label: string; color: string }> = []

  const processChild = (child: React.ReactNode): void => {
    if (!child) return

    if (Array.isArray(child)) {
      child.forEach(processChild)
      return
    }

    if (typeof child === 'object' && 'props' in child) {
      const element = child as React.ReactElement

      // Check if this is a chart series component (Line, Area, Bar, etc.)
      if (element.props?.dataKey && (element.props?.stroke || element.props?.fill)) {
        const dataKey = String(element.props.dataKey)
        const color = element.props.stroke || element.props.fill || 'var(--color-brand-500)'
        const label = element.props.name || dataKey

        if (!series.some((s) => s.key === dataKey)) {
          series.push({ key: dataKey, label, color })
        }
      }

      // Recursively process children
      if (element.props?.children) {
        processChild(element.props.children)
      }
    }
  }

  processChild(children)
  return series
}

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
  selectedKeys?: Set<string>
  highlightedKey?: string | null
}

export function ChartContent({
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
  selectedKeys,
  highlightedKey,
}: ChartContentProps) {
  const { startTimestamp, endTimestamp, useLocalTime, hideEvents, hoveredEventKey, setHoveredEventKey } =
    useServiceOverviewContext()
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  // Use highlighting only if selectedKeys are provided
  const highlightingResult = useChartHighlighting({
    metricKeys: selectedKeys
      ? Object.keys(data[0] || {}).filter((key) => !['timestamp', 'time', 'fullTime'].includes(key))
      : [],
    selectedKeys: selectedKeys || new Set(),
  })

  // Update local highlighting when global highlighted key changes
  useEffect(() => {
    if (selectedKeys && highlightedKey !== undefined) {
      highlightingResult.handleHighlight(highlightedKey)
    }
  }, [highlightedKey, selectedKeys, highlightingResult])

  // Add CSS classes to chart series children
  const processedChildren = useMemo(() => {
    if (!selectedKeys) return children

    const processChild = (child: React.ReactNode): React.ReactNode => {
      if (!child) return child

      if (Array.isArray(child)) {
        return child.map(processChild)
      }

      if (typeof child === 'object' && 'props' in child) {
        const element = child as React.ReactElement

        // Check if this is a chart series component
        if (element.props?.dataKey && (element.props?.stroke || element.props?.fill)) {
          const dataKey = String(element.props.dataKey)
          const seriesClass = `series series--${highlightingResult.sanitizeKey(dataKey)}`
          const existingClassName = element.props.className || ''
          const newClassName = existingClassName ? `${existingClassName} ${seriesClass}` : seriesClass

          return {
            ...element,
            props: {
              ...element.props,
              className: newClassName,
            },
          }
        }
      }

      return child
    }

    return processChild(children)
  }, [children, selectedKeys, highlightingResult])

  // Use the zoomable chart hook
  const {
    zoomState,
    isCtrlPressed,
    handleChartDoubleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    getXDomain: getZoomXDomain,
    getXAxisTicks,
  } = useZoomableChart()

  function getXDomain(): [number | string, number | string] {
    const defaultDomain: [number | string, number | string] = xDomain ?? [
      Number(startTimestamp) * 1000,
      Number(endTimestamp) * 1000,
    ]
    return getZoomXDomain(defaultDomain)
  }

  // Get current domain and calculate appropriate ticks
  const currentDomain = getXDomain()
  const currentTicks = getXAxisTicks(currentDomain, 6)
  const xAxisConfig = createXAxisConfig(Number(startTimestamp), Number(endTimestamp))

  return (
    <div
      ref={selectedKeys ? highlightingResult.containerRef : undefined}
      className={`relative flex h-full ${selectedKeys ? 'highlight-scope' : ''}`}
    >
      {selectedKeys && <style>{highlightingResult.highlightingStyles}</style>}
      <Chart.Container className="h-full w-full select-none p-5 py-2 pr-0" isLoading={isLoading} isEmpty={isEmpty}>
        <ComposedChart
          data={data}
          syncId="syncId"
          margin={margin}
          onMouseDown={(e) => {
            handleMouseDown(e)
            setOnHoverHideTooltip(true)
          }}
          onMouseMove={(e) => {
            handleMouseMove(e)
            setOnHoverHideTooltip(true)
          }}
          onMouseLeave={() => {
            handleMouseLeave()
            setOnHoverHideTooltip(false)
          }}
          onMouseUp={() => {
            handleMouseUp()
            setOnHoverHideTooltip(false)
          }}
          onDoubleClick={handleChartDoubleClick}
          style={{ cursor: isCtrlPressed ? 'zoom-out' : 'crosshair' }}
        >
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis
            {...xAxisConfig}
            allowDataOverflow
            domain={currentDomain}
            ticks={currentTicks.length > 0 ? currentTicks : xAxisConfig.ticks}
            type="number"
            dataKey="timestamp"
            tick={{ ...xAxisConfig.tick }}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp)

              // Get current zoom domain for dynamic time granularity
              const [startMs, endMs] = currentDomain.map((d) =>
                typeof d === 'number'
                  ? d
                  : d === 'dataMin'
                    ? Number(startTimestamp) * 1000
                    : Number(endTimestamp) * 1000
              )
              const granularity = getTimeGranularity(startMs, endMs)

              // Helper functions for local vs UTC time
              const getDatePart = (fn: (d: Date) => number) =>
                useLocalTime ? fn(date) : fn(new Date(date.getTime() + date.getTimezoneOffset() * 60000))

              const pad = (num: number) => num.toString().padStart(2, '0')

              switch (granularity) {
                case 'seconds':
                  return `${pad(getDatePart((d) => d.getHours()))}:${pad(getDatePart((d) => d.getMinutes()))}:${pad(getDatePart((d) => d.getSeconds()))}`

                case 'minutes':
                  return `${pad(getDatePart((d) => d.getHours()))}:${pad(getDatePart((d) => d.getMinutes()))}`

                case 'days':
                default:
                  return `${pad(getDatePart((d) => d.getDate()))}/${pad(getDatePart((d) => d.getMonth() + 1))} ${pad(getDatePart((d) => d.getHours()))}:${pad(getDatePart((d) => d.getMinutes()))}`
              }
            }}
            interval="preserveStartEnd"
          />
          <Chart.Tooltip
            isAnimationActive={false}
            content={!onHoverHideTooltip ? <div /> : <TooltipChart customLabel={tooltipLabel ?? label} unit={unit} />}
          />
          {selectedKeys ? processedChildren : children}
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            domain={yDomain}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          {!isCtrlPressed && zoomState.refAreaLeft && zoomState.refAreaRight ? (
            <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} />
          ) : null}
        </ComposedChart>
      </Chart.Container>
      {isFullscreen && referenceLineData && !hideEvents && (
        <div className="flex h-[87vh] w-full min-w-[420px] max-w-[420px] flex-col border-l border-neutral-250">
          <p className="border-b border-neutral-250 bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500">
            {pluralize(referenceLineData.length, 'Event', 'Events')} associated
          </p>
          <div className="h-full overflow-y-auto">
            {referenceLineData.length > 0 ? (
              <>
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
                        {event.type === 'exit-code' && (
                          <div className="flex items-center gap-1">
                            <span className="text-neutral-350">Instance name:</span>
                            <Tooltip content={event.key}>
                              <Badge
                                variant="surface"
                                color="neutral"
                                size="sm"
                                className="max-w-max gap-1 font-code text-2xs"
                              >
                                <span
                                  className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                                  style={{ backgroundColor: getColorByPod(event.key) }}
                                />
                                {event.key.substring(event.key.length - 5)}
                              </Badge>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm">
                <p className="text-neutral-350">No events associated</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export interface LocalChartProps extends PropsWithChildren {
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
  showLegend?: boolean
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
  showLegend = false,
}: LocalChartProps) {
  const { organizationId = '' } = useParams()
  const {
    startTimestamp,
    endTimestamp,
    hoveredEventKey,
    setHoveredEventKey,
    hideEvents,
    chartSelectedKeys,
    setChartSelectedKeys,
    chartHighlightedKey,
    setChartHighlightedKey,
  } = useServiceOverviewContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Extract series information from children for legend
  const chartSeries = useMemo(() => {
    const series = extractChartSeriesFromChildren(children)

    // Sort series to show limit/request metrics first and add line indicator for them
    return series
      .map((item) => {
        const isLimitRequest =
          item.label.toLowerCase().includes('limit') || item.label.toLowerCase().includes('request')
        return {
          ...item,
          useLineIndicator: isLimitRequest,
        }
      })
      .sort((a, b) => {
        const aIsLimitRequest = a.useLineIndicator
        const bIsLimitRequest = b.useLineIndicator

        if (aIsLimitRequest && !bIsLimitRequest) return -1
        if (!aIsLimitRequest && bIsLimitRequest) return 1
        return 0
      })
  }, [children])

  // Use chart highlighting sync
  const chartSync = useChartHighlightingSync({
    selectedKeys: showLegend ? chartSelectedKeys : undefined,
    onSelectionChange: showLegend ? setChartSelectedKeys : undefined,
    highlightedKey: showLegend ? chartHighlightedKey : undefined,
    onHighlightChange: showLegend ? setChartHighlightedKey : undefined,
  })

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

  const eventReferenceLines: ReferenceLineEvent[] = useMemo(() => {
    // Get chart data timestamps for alignment
    const chartTimestamps = data.map((d) => d.timestamp).sort((a, b) => a - b)

    return (eventsFiltered || [])
      .filter(
        (event) =>
          (event.event_type === 'TRIGGER_DEPLOY' ||
            event.event_type === 'DEPLOY_FAILED' ||
            event.event_type === 'DEPLOYED') &&
          event.target_id === serviceId
      )
      .map((event) => {
        const eventTimestamp = new Date(event.timestamp || '').getTime()

        // Find the closest chart data point timestamp
        let alignedTimestamp = eventTimestamp
        if (chartTimestamps.length > 0) {
          const closestTimestamp = chartTimestamps.reduce((prev, curr) => {
            return Math.abs(curr - eventTimestamp) < Math.abs(prev - eventTimestamp) ? curr : prev
          })
          alignedTimestamp = closestTimestamp
        }

        const key = `event-${event.id || alignedTimestamp}`
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
            timestamp: alignedTimestamp,
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
            timestamp: alignedTimestamp,
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
            timestamp: alignedTimestamp,
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
          timestamp: alignedTimestamp,
          reason: 'Unknown',
          icon: 'question',
          color: 'var(--color-neutral-350)',
          key,
          version,
          repository,
        }
      })
  }, [eventsFiltered, serviceId, data])

  // Merge with any referenceLineData passed as prop
  const mergedReferenceLineData = useMemo(() => {
    return [...(referenceLineData || []), ...eventReferenceLines]
  }, [referenceLineData, eventReferenceLines])

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
          selectedKeys={showLegend ? chartSync.selectedKeys : undefined}
          highlightedKey={showLegend ? chartSync.highlightedKey : undefined}
        >
          {/* Render reference lines for events of type 'event' */}
          {!hideEvents &&
            mergedReferenceLineData
              .filter((event) => event.type === 'event')
              .map((event) => createAlignedReferenceLine(event, hoveredEventKey, setHoveredEventKey, false))}
          {children}
        </ChartContent>
        {/* Render legend if enabled */}
        {showLegend && chartSeries.length > 0 && (
          <div className="px-5 pb-5">
            <Chart.Legend
              items={chartSeries}
              selectedKeys={chartSync.selectedKeys}
              onToggle={chartSync.onSelectionToggle}
              onHighlight={chartSync.onHighlight}
              rightGutterWidth={0}
            />
          </div>
        )}
      </Section>
      {isModalOpen && (
        <ModalChart title={label ?? ''} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-hidden">
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
                isFullscreen
                selectedKeys={showLegend ? chartSync.selectedKeys : undefined}
                highlightedKey={showLegend ? chartSync.highlightedKey : undefined}
              >
                {/* Render reference lines for events of type 'event' in modal as well */}
                {!hideEvents &&
                  mergedReferenceLineData
                    .filter((event) => event.type === 'event')
                    .map((event) => createAlignedReferenceLine(event, hoveredEventKey, setHoveredEventKey, true))}
                {children}
              </ChartContent>
            </div>
            {/* Render legend in modal if enabled */}
            {showLegend && chartSeries.length > 0 && (
              <div className="flex-shrink-0 px-5 pb-5">
                <Chart.Legend
                  items={chartSeries}
                  selectedKeys={chartSync.selectedKeys}
                  onToggle={chartSync.onSelectionToggle}
                  onHighlight={chartSync.onHighlight}
                  rightGutterWidth={0}
                />
              </div>
            )}
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default LocalChart

// Utility function to create reference lines with better clickable areas
function createAlignedReferenceLine(
  event: ReferenceLineEvent,
  hoveredEventKey: string | null,
  setHoveredEventKey: (key: string | null) => void,
  isModal = false
) {
  const strokeWidth = isModal ? 4 : 3
  const opacity = hoveredEventKey === event.key ? 1 : isModal ? 0.6 : 0.4

  return (
    <ReferenceLine
      key={event.key}
      x={event.timestamp}
      stroke={event.color || 'var(--color-brand-500)'}
      strokeDasharray="3 3"
      opacity={opacity}
      strokeWidth={strokeWidth}
      onMouseEnter={() => {
        setHoveredEventKey(event.key)
      }}
      onMouseLeave={() => {
        setHoveredEventKey(null)
      }}
      style={{ cursor: 'pointer' }}
      label={{
        value: hoveredEventKey === event.key ? event.reason : undefined,
        position: 'top',
        fill: event.color || 'var(--color-brand-500)',
        fontSize: 12,
        fontWeight: 'bold',
      }}
    />
  )
}
