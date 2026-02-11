import { addMinutes, subMinutes } from 'date-fns'
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BooleanParam, type QueryParamConfig, StringParam, useQueryParam } from 'use-query-params'
import { v4 as uuidv4 } from 'uuid'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { type TimeRangeOption, createTimeRangeHandler } from './time-range'

interface DashboardContextType {
  // Time and timezone states
  useLocalTime: boolean
  setUseLocalTime: (value: boolean) => void
  timeRange: TimeRangeOption
  setTimeRange: (value: TimeRangeOption) => void
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void

  // Computed values
  startTimestamp: string
  endTimestamp: string
  queryTimeRange: string
  subQueryTimeRange: string

  // Handlers
  handleTimeRangeChange: (range: TimeRangeOption) => void
  handleZoomTimeRangeChange: (startTimestamp: number, endTimestamp: number) => void

  // Zoom control
  resetChartZoom: () => void
  registerZoomReset: (resetFn: () => void) => void

  // Zoom state tracking
  isAnyChartZoomed: boolean
  setIsAnyChartZoomed: (isZoomed: boolean) => void

  // Events
  setHideEvents: (value: boolean) => void
  hideEvents: boolean

  // Settings
  expandCharts: boolean
  setExpandCharts: (value: boolean) => void

  // Live update toggle
  isLiveUpdateEnabled: boolean
  setIsLiveUpdateEnabled: (value: boolean) => void

  // Date picker state
  isDatePickerOpen: boolean
  setIsDatePickerOpen: (value: boolean) => void

  // Last dropdown selection
  lastDropdownTimeRange: TimeRangeOption

  // Chart refreshing state
  isAnyChartRefreshing: boolean
  setIsAnyChartRefreshing: (isRefreshing: boolean) => void

  // View mode (aggregated vs pod-level)
  useAggregatedView: boolean
  setUseAggregatedView: (value: boolean) => void
  isPodCountLoading: boolean
  setIsPodCountLoading: (value: boolean) => void

  // Trace ID
  traceId: string
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// TODO: Remove dupplicate timetamp and date values when migrating to new date-picker
// TODO: Session storage navigation cross-service synchronization
export function DashboardProvider({ children }: PropsWithChildren) {
  const [useLocalTime = false, setUseLocalTime] = useQueryParam('useLocalTime', BooleanParam)
  const [timeRange = '1h', setTimeRange] = useQueryParam<TimeRangeOption>(
    'timeRange',
    StringParam as QueryParamConfig<TimeRangeOption, TimeRangeOption>
  )
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const [startDate = oneHourAgo.toISOString(), setStartDate] = useQueryParam('startDate', StringParam)
  const [endDate = now.toISOString(), setEndDate] = useQueryParam('endDate', StringParam)

  // Trace ID for tracing requests (stable across re-renders)
  const [traceId] = useState(() => uuidv4())

  // Actions
  const [hideEvents = false, setHideEvents] = useQueryParam('hideEvents', BooleanParam)
  const [expandCharts = false, setExpandCharts] = useQueryParam('expandCharts', BooleanParam)
  const [isLiveUpdateEnabled = false, setIsLiveUpdateEnabled] = useQueryParam('isLiveUpdateEnabled', BooleanParam)

  // Track the last time range selected from dropdown (not from zoom)
  const [lastDropdownTimeRange, setLastDropdownTimeRange] = useState<TimeRangeOption>('1h')

  // Date picker state - used to pause live updates while open
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Zoom reset functionality
  const [zoomResetFunctions, setZoomResetFunctions] = useState<(() => void)[]>([])

  const registerZoomReset = useCallback((resetFn: () => void) => {
    setZoomResetFunctions((prev) => [...prev, resetFn])
    // Return cleanup function
    return () => {
      setZoomResetFunctions((prev) => prev.filter((fn) => fn !== resetFn))
    }
  }, [])

  const resetChartZoom = useCallback(() => {
    zoomResetFunctions.forEach((resetFn) => resetFn())
    setIsAnyChartZoomed(false) // Reset zoom state when resetting charts
  }, [zoomResetFunctions])

  // Zoom state tracking - simplified to just track boolean state
  const [isAnyChartZoomed, setIsAnyChartZoomed] = useState(false)

  // Chart refreshing state tracking
  const [refreshingCount, setRefreshingCount] = useState(0)
  const isAnyChartRefreshing = refreshingCount > 0

  const setIsAnyChartRefreshing = useCallback((isRefreshing: boolean) => {
    setRefreshingCount((prev) => (isRefreshing ? prev + 1 : Math.max(0, prev - 1)))
  }, [])

  // View mode state (aggregated vs pod-level)
  const [useAggregatedView, setUseAggregatedView] = useState(false)
  const [isPodCountLoading, setIsPodCountLoading] = useState(true)

  const handleTimeRangeChange = useCallback(
    (range: TimeRangeOption) => {
      // Reset zoom first, then change time range
      resetChartZoom()
      // Track this as the last dropdown selection
      setLastDropdownTimeRange(range)
      // Create a new time range handler that doesn't cause circular dependencies
      createTimeRangeHandler(setTimeRange, setStartDate, setEndDate)(range)
    },
    [resetChartZoom]
  )

  const handleZoomTimeRangeChange = useCallback((startTimestamp: number, endTimestamp: number) => {
    // Convert timestamps to ISO strings and update dates
    const startDateISO = new Date(startTimestamp * 1000).toISOString()
    const endDateISO = new Date(endTimestamp * 1000).toISOString()

    setStartDate(startDateISO)
    setEndDate(endDateISO)
    setTimeRange('custom')
  }, [])

  // Adjust dates when startDate and endDate are identical
  // This ensures a valid time range for queries by expanding to a 60-minute range
  // The endDate is capped to the current time to prevent future dates
  useEffect(() => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return

    if (start.getTime() === end.getTime()) {
      const now = new Date()
      const adjustedEnd = addMinutes(end, 30)
      const finalEnd = adjustedEnd > now ? now : adjustedEnd
      const adjustedStart = subMinutes(finalEnd, 60)
      setStartDate(adjustedStart.toISOString())
      setEndDate(finalEnd.toISOString())
    }
  }, [startDate, endDate, setStartDate, setEndDate])

  const startTimestamp = startDate && convertDatetoTimestamp(startDate).toString()
  const endTimestamp = endDate && convertDatetoTimestamp(endDate).toString()

  // Calculate the effective duration for Prometheus queries (accounts for zoom and custom ranges)
  const queryTimeRange = useMemo(() => {
    // For custom time range or zoomed charts, calculate duration from timestamps
    if ((timeRange === 'custom' || isAnyChartZoomed) && startTimestamp && endTimestamp) {
      return `${Math.floor((parseInt(endTimestamp) - parseInt(startTimestamp)) / 60)}m`
    }
    return timeRange
  }, [timeRange, isAnyChartZoomed, startTimestamp, endTimestamp])

  // Calculate the average over queryTimeRange with a sub-sampling every 5m or 1m
  const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60
  const subQueryTimeRange =
    isAnyChartZoomed && startTimestamp && endTimestamp
      ? parseInt(endTimestamp) - parseInt(startTimestamp) > THREE_DAYS_IN_SECONDS
        ? '5m'
        : '1m'
      : '1m'

  // Update every 30 seconds to match actual scrape_interval
  // use-metrics.tsx: refetchInterval: 30_000ms
  useEffect(() => {
    const isLiveRange = ['5m', '15m', '30m'].includes(timeRange)

    if (!isLiveRange || !isLiveUpdateEnabled || isAnyChartZoomed || isDatePickerOpen) return

    const roundDateToStep = (date: Date, stepSeconds: number): Date => {
      const timestamp = Math.floor(date.getTime() / 1000)
      const rounded = Math.floor(timestamp / stepSeconds) * stepSeconds
      return new Date(rounded * 1000)
    }

    const getStepSeconds = (timeRange: TimeRangeOption) => {
      // Actual scrape_interval = 15s
      switch (timeRange) {
        case '5m':
          return 15 // 15 seconds (match actual scrape_interval)
        case '15m':
          return 30 // 30 seconds (2x scrape_interval)
        case '30m':
          return 60 // 1 minute (4x scrape_interval)
        default:
          return 15
      }
    }

    const updateDates = () => {
      const now = new Date()
      const stepSeconds = getStepSeconds(timeRange)
      const roundedEnd = roundDateToStep(now, stepSeconds)
      setEndDate(roundedEnd.toISOString())

      let roundedStart: Date
      switch (timeRange) {
        case '5m':
          roundedStart = roundDateToStep(new Date(roundedEnd.getTime() - 5 * 60 * 1000), stepSeconds)
          break
        case '15m':
          roundedStart = roundDateToStep(new Date(roundedEnd.getTime() - 15 * 60 * 1000), stepSeconds)
          break
        case '30m':
          roundedStart = roundDateToStep(new Date(roundedEnd.getTime() - 30 * 60 * 1000), stepSeconds)
          break
        default:
          roundedStart = roundDateToStep(new Date(roundedEnd.getTime() - 30 * 60 * 1000), stepSeconds)
      }
      setStartDate(roundedStart.toISOString())
    }

    updateDates()

    const interval = setInterval(updateDates, 30_000) // Update every 30 seconds to match actual scrape_interval
    return () => clearInterval(interval)
  }, [timeRange, isLiveUpdateEnabled, isAnyChartZoomed, isDatePickerOpen])

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      /* Event sidebar hover synchronization */
      /* When hovering over a sidebar event, highlight the corresponding reference line */
      [data-event-key]:hover {
        background-color: var(--color-neutral-150);
      }

      .recharts-reference-line-line {
        cursor: pointer;
      }

      .recharts-reference-line-line.active {
        opacity: 1 !important;
      }

      /* ReferenceLine labels - hidden by default, visible only when active */
      .recharts-reference-line .recharts-text.recharts-label {
        opacity: 0;
      }

      /* Show label when the line has active class */
      .recharts-reference-line-line.active ~ .recharts-text.recharts-label {
        opacity: 1;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const value = useMemo<DashboardContextType>(
    () => ({
      useLocalTime: useLocalTime ?? false,
      hideEvents: hideEvents ?? false,
      expandCharts: expandCharts ?? false,
      startDate: startDate ?? '',
      endDate: endDate ?? '',
      startTimestamp: startTimestamp ?? '',
      endTimestamp: endTimestamp ?? '',
      isLiveUpdateEnabled: isLiveUpdateEnabled ?? false,
      setIsLiveUpdateEnabled,
      setUseLocalTime,
      timeRange,
      setTimeRange,
      setStartDate,
      setEndDate,
      queryTimeRange,
      subQueryTimeRange,
      handleTimeRangeChange,
      handleZoomTimeRangeChange,
      resetChartZoom,
      registerZoomReset,
      isAnyChartZoomed,
      setIsAnyChartZoomed,
      setHideEvents,
      setExpandCharts,
      isDatePickerOpen,
      setIsDatePickerOpen,
      lastDropdownTimeRange,
      isAnyChartRefreshing,
      setIsAnyChartRefreshing,
      useAggregatedView,
      setUseAggregatedView,
      isPodCountLoading,
      setIsPodCountLoading,
      traceId,
    }),
    [
      useLocalTime,
      hideEvents,
      expandCharts,
      startDate,
      endDate,
      startTimestamp,
      endTimestamp,
      isLiveUpdateEnabled,
      setIsLiveUpdateEnabled,
      setUseLocalTime,
      timeRange,
      setTimeRange,
      setStartDate,
      setEndDate,
      queryTimeRange,
      handleTimeRangeChange,
      handleZoomTimeRangeChange,
      resetChartZoom,
      registerZoomReset,
      isAnyChartZoomed,
      setIsAnyChartZoomed,
      setHideEvents,
      setExpandCharts,
      isDatePickerOpen,
      setIsDatePickerOpen,
      lastDropdownTimeRange,
      isAnyChartRefreshing,
      setIsAnyChartRefreshing,
      useAggregatedView,
      setUseAggregatedView,
      isPodCountLoading,
      setIsPodCountLoading,
      subQueryTimeRange,
      traceId,
    ]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within an DashboardProvider')
  }
  return context
}
