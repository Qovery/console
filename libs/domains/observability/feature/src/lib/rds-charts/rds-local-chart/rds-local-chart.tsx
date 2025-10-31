import { type PropsWithChildren, useState } from 'react'
import { CartesianGrid, ComposedChart, ReferenceArea, XAxis, YAxis } from 'recharts'
import { Chart, createXAxisConfig, getTimeGranularity, useZoomableChart } from '@qovery/shared/ui'
import { useRdsManagedDbContext } from '../../rds-managed-db/util-filter/rds-managed-db-context'
import { formatTimestamp } from '../../service-overview/util-chart/format-timestamp'

interface RdsLocalChartProps extends PropsWithChildren {
  data: Array<{ timestamp: number; time: string; fullTime: string; [key: string]: string | number | null }>
  unit: string
  label: string
  description: string
  isEmpty: boolean
  isLoading: boolean
  tooltipLabel?: string
}

export function RdsLocalChart({
  data,
  unit,
  label,
  description,
  tooltipLabel,
  isEmpty,
  isLoading,
  children,
}: RdsLocalChartProps) {
  const {
    startTimestamp,
    endTimestamp,
    useLocalTime,
    handleZoomTimeRangeChange,
    registerZoomReset,
    setIsAnyChartZoomed,
    handleTimeRangeChange,
    lastDropdownTimeRange,
    isAnyChartRefreshing,
  } = useRdsManagedDbContext()
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
    const defaultDomain: [number | string, number | string] = [
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
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between px-5 pt-2">
        <div>
          <h3 className="text-sm font-medium text-neutral-400">{label}</h3>
          <p className="text-xs text-neutral-350">{description}</p>
        </div>
      </div>
      <Chart.Container
        className="h-full min-h-72 w-full select-none px-5 pb-2"
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
                typeof d === 'number'
                  ? d
                  : d === 'dataMin'
                    ? Number(startTimestamp) * 1000
                    : Number(endTimestamp) * 1000
              )
              const granularity = getTimeGranularity(startMs, endMs)

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
            position={{ y: 13 }}
            content={
              zoomState.refAreaLeft && zoomState.refAreaRight ? (
                <Chart.TooltipZoomRange
                  startTime={
                    formatTimestamp(
                      Math.min(Number(zoomState.refAreaLeft), Number(zoomState.refAreaRight)),
                      useLocalTime
                    ).fullTimeString
                  }
                  endTime={
                    formatTimestamp(
                      Math.max(Number(zoomState.refAreaLeft), Number(zoomState.refAreaRight)),
                      useLocalTime
                    ).fullTimeString
                  }
                />
              ) : !onHoverHideTooltip ? (
                <div />
              ) : (
                <Chart.TooltipContent title={tooltipLabel ?? label} />
              )
            }
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-neutral-350)' }}
            tickLine={{ stroke: 'transparent' }}
            axisLine={{ stroke: 'transparent' }}
            orientation="right"
            tickCount={5}
            tickFormatter={(value) => (value === 0 ? '' : value)}
          />
          {children}
          {!isCtrlPressed && zoomState.refAreaLeft && zoomState.refAreaRight ? (
            <ReferenceArea x1={zoomState.refAreaLeft} x2={zoomState.refAreaRight} strokeOpacity={0.3} />
          ) : null}
        </ComposedChart>
      </Chart.Container>
    </div>
  )
}

export default RdsLocalChart
