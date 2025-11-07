import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import clsx from 'clsx'
import { type ElementRef, type PropsWithChildren, forwardRef, memo, useState } from 'react'
import { CartesianGrid, ComposedChart, ReferenceArea, ReferenceLine, XAxis, YAxis } from 'recharts'
import {
  Button,
  Chart,
  Heading,
  Icon,
  Section,
  Tooltip,
  createXAxisConfig,
  getTimeGranularity,
  useZoomableChart,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { ModalChart } from '../modal-chart/modal-chart'
import { formatTimestamp } from '../util-chart/format-timestamp'
import { useDashboardContext } from '../util-filter/dashboard-context'
import { EventSidebar } from './event-sidebar'
import { Tooltip as TooltipChart, type UnitType } from './tooltip'
import { useChartEvents } from './use-chart-events'

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
  pod?: string
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
  referenceLineData?: ReferenceLineEvent[]
  isFullscreen?: boolean
}

export const ChartContent = memo(function ChartContent({
  data,
  unit,
  label,
  tooltipLabel,
  isEmpty,
  isLoading,
  children,
  xDomain,
  yDomain,
  referenceLineData,
  isFullscreen = false,
}: ChartContentProps) {
  const {
    startTimestamp,
    endTimestamp,
    useLocalTime,
    hideEvents,
    handleZoomTimeRangeChange,
    registerZoomReset,
    setIsAnyChartZoomed,
    handleTimeRangeChange,
    lastDropdownTimeRange,
    isAnyChartRefreshing,
  } = useDashboardContext()
  const [onHoverHideTooltip, setOnHoverHideTooltip] = useState(false)

  // Use the zoomable chart hook - automatically handle zoom state changes
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
  } = useZoomableChart({
    onZoomChange: handleZoomTimeRangeChange,
    onResetRegister: registerZoomReset,
    onZoomStateChange: setIsAnyChartZoomed,
    onDoubleClick: () => {
      handleTimeRangeChange(lastDropdownTimeRange)
    },
    disabled: isLoading || isEmpty,
  })

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
    <Chart.Container
      className={clsx('h-full min-h-72 w-full select-none p-5 py-2', { 'pr-0': !isLoading && !isEmpty })}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isRefreshing={isAnyChartRefreshing}
    >
      <ComposedChart
        data={data}
        syncId="syncId"
        margin={{ top: 14, bottom: 0, left: 0, right: 0 }}
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
        style={{ cursor: isLoading || isEmpty ? 'default' : 'crosshair' }}
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
              typeof d === 'number' ? d : d === 'dataMin' ? Number(startTimestamp) * 1000 : Number(endTimestamp) * 1000
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
          position={{ y: isFullscreen ? undefined : 13 }}
          content={
            zoomState.refAreaLeft && zoomState.refAreaRight ? (
              <Chart.TooltipZoomRange
                startTime={
                  formatTimestamp(Math.min(Number(zoomState.refAreaLeft), Number(zoomState.refAreaRight)), useLocalTime)
                    .fullTimeString
                }
                endTime={
                  formatTimestamp(Math.max(Number(zoomState.refAreaLeft), Number(zoomState.refAreaRight)), useLocalTime)
                    .fullTimeString
                }
              />
            ) : !onHoverHideTooltip ? (
              <div />
            ) : (
              <TooltipChart customLabel={tooltipLabel ?? label} unit={unit} />
            )
          }
        />
        {!hideEvents && referenceLineData?.map((event) => createAlignedReferenceLine(event))}
        {children}
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
  )
})

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
  referenceLineData?: ReferenceLineEvent[]
  isFullscreen?: boolean
  handleResetLegend?: () => void
}

export const LocalChart = forwardRef<ElementRef<'section'>, LocalChartProps>(function LocalChart(
  {
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
    referenceLineData,
    isFullscreen = false,
    handleResetLegend,
  },
  ref
) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { hideEvents } = useDashboardContext()

  const {
    service,
    events,
    isLoading: eventsLoading,
  } = useChartEvents({
    serviceId,
    additionalEvents: referenceLineData || [],
  })

  return (
    <>
      <Section ref={ref} className={twMerge('h-full min-h-[300px] w-full', className)}>
        {label && (
          <div className="flex w-full justify-between gap-1 p-4 pb-0">
            <div>
              <Heading className="flex items-center">{label}</Heading>
              <p className="text-ssm text-neutral-350">{description}</p>
            </div>
            <div className="flex items-center gap-1">
              {handleResetLegend && (
                <Tooltip content="Reset filter">
                  <Button
                    variant="outline"
                    color="neutral"
                    size="xs"
                    className="w-6 items-center justify-center p-0"
                    onClick={handleResetLegend}
                  >
                    <Icon iconName="filter-slash" iconStyle="regular" />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="Show chart">
                <Button
                  variant="outline"
                  color="neutral"
                  size="xs"
                  className="w-6 items-center justify-center p-0"
                  onClick={() => setIsModalOpen(true)}
                >
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
          </div>
        )}
        <div className="relative flex h-full w-full">
          <ChartContent
            data={data}
            unit={unit}
            label={label ?? ''}
            tooltipLabel={tooltipLabel}
            isEmpty={isEmpty}
            isLoading={isLoading}
            xDomain={xDomain}
            yDomain={yDomain}
            referenceLineData={events}
            isFullscreen={isFullscreen}
          >
            {children}
          </ChartContent>
          {isFullscreen && events && !hideEvents && (
            <EventSidebar events={events} service={service} isLoading={isLoading || eventsLoading} />
          )}
        </div>
      </Section>
      {isModalOpen && (
        <ModalChart title={label ?? ''} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="relative flex h-full w-full">
            <ChartContent
              data={data}
              unit={unit}
              label={label ?? ''}
              tooltipLabel={tooltipLabel}
              isEmpty={isEmpty}
              isLoading={isLoading}
              xDomain={xDomain}
              yDomain={yDomain}
              referenceLineData={events}
              isFullscreen={isFullscreen}
            >
              {children}
            </ChartContent>
            {events && !hideEvents && (
              <EventSidebar events={events} service={service} isLoading={isLoading || eventsLoading} />
            )}
          </div>
        </ModalChart>
      )}
    </>
  )
})

export default LocalChart

// Utility function to create reference lines with better clickable areas
function createAlignedReferenceLine(event: ReferenceLineEvent) {
  const key = event.key
  const strokeWidth = 2

  return (
    <ReferenceLine
      key={event.key}
      name={event.key}
      x={event.timestamp}
      stroke={event.color || 'var(--color-brand-500)'}
      strokeDasharray="3 3"
      opacity={0.4}
      strokeWidth={strokeWidth}
      onMouseEnter={() => {
        const referenceLine = document.querySelectorAll(`line[name="${key}"].recharts-reference-line-line`)
        referenceLine.forEach((line) => {
          line.classList.add('active')
        })
      }}
      onMouseLeave={() => {
        const referenceLine = document.querySelectorAll(`line[name="${key}"].recharts-reference-line-line`)
        referenceLine.forEach((line) => {
          line.classList.remove('active')
        })
      }}
      label={{
        value: event.reason,
        position: 'top',
        fill: event.color || 'var(--color-brand-500)',
        fontSize: 12,
        fontWeight: 'bold',
      }}
    />
  )
}
