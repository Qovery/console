import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { type TimeRangeOption, createTimeRangeHandler } from './time-range'

interface ServiceOverviewContextType {
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

  // Calendar
  hasCalendarValue: boolean
  setHasCalendarValue: (value: boolean) => void

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
}

const ServiceOverviewContext = createContext<ServiceOverviewContextType | undefined>(undefined)

export function ServiceOverviewProvider({ children }: PropsWithChildren) {
  const [useLocalTime, setUseLocalTime] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('1h')

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

  // Track the last time range selected from dropdown (not from zoom)
  const [lastDropdownTimeRange, setLastDropdownTimeRange] = useState<TimeRangeOption>('1h')

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const [startDate, setStartDate] = useState(oneHourAgo.toISOString())
  const [endDate, setEndDate] = useState(now.toISOString())

  // Live update toggle - disabled by default
  const [isLiveUpdateEnabled, setIsLiveUpdateEnabled] = useState(false)

  // Date picker state - used to pause live updates while open
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Zoom reset functionality
  const [zoomResetFunctions, setZoomResetFunctions] = useState<(() => void)[]>([])

  // Actions
  const [hideEvents, setHideEvents] = useState(false)
  const [expandCharts, setExpandCharts] = useState(false)

  const [hasCalendarValue, setHasCalendarValue] = useState(false)

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
    setHasCalendarValue(true) // Show custom date range in the UI
  }, [])

  // Update every 30 seconds to match actual scrape_interval
  // use-metrics.tsx: refetchInterval: 30_000ms
  useEffect(() => {
    const isLiveRange = ['5m', '15m', '30m'].includes(timeRange)

    if (!isLiveRange || !isLiveUpdateEnabled || isAnyChartZoomed || isDatePickerOpen || hasCalendarValue) return

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
  }, [timeRange, isLiveUpdateEnabled, isAnyChartZoomed, isDatePickerOpen, hasCalendarValue])

  const startTimestamp = convertDatetoTimestamp(startDate).toString()
  const endTimestamp = convertDatetoTimestamp(endDate).toString()

  // Calculate the effective duration for Prometheus queries (accounts for zoom)
  const queryTimeRange =
    isAnyChartZoomed && startTimestamp && endTimestamp
      ? `${Math.floor((parseInt(endTimestamp) - parseInt(startTimestamp)) / 60)}m`
      : timeRange

  // Calculate the average over queryTimeRange with a sub-sampling every 5m or 1m
  const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60
  const subQueryTimeRange =
    isAnyChartZoomed && startTimestamp && endTimestamp
      ? parseInt(endTimestamp) - parseInt(startTimestamp) > THREE_DAYS_IN_SECONDS
        ? '5m'
        : '1m'
      : '1m'

  const value = useMemo<ServiceOverviewContextType>(
    () => ({
      useLocalTime,
      setUseLocalTime,
      timeRange,
      setTimeRange,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      startTimestamp,
      endTimestamp,
      queryTimeRange,
      subQueryTimeRange,
      handleTimeRangeChange,
      handleZoomTimeRangeChange,
      resetChartZoom,
      registerZoomReset,
      isAnyChartZoomed,
      setIsAnyChartZoomed,
      setHideEvents,
      hideEvents,
      expandCharts,
      setExpandCharts,
      hasCalendarValue,
      setHasCalendarValue,
      isLiveUpdateEnabled,
      setIsLiveUpdateEnabled,
      isDatePickerOpen,
      setIsDatePickerOpen,
      lastDropdownTimeRange,
      isAnyChartRefreshing,
      setIsAnyChartRefreshing,
    }),
    [
      useLocalTime,
      timeRange,
      startDate,
      endDate,
      startTimestamp,
      endTimestamp,
      queryTimeRange,
      handleTimeRangeChange,
      handleZoomTimeRangeChange,
      resetChartZoom,
      registerZoomReset,
      isAnyChartZoomed,
      setIsAnyChartZoomed,
      setHideEvents,
      hideEvents,
      expandCharts,
      setExpandCharts,
      hasCalendarValue,
      setHasCalendarValue,
      isLiveUpdateEnabled,
      setIsLiveUpdateEnabled,
      isDatePickerOpen,
      setIsDatePickerOpen,
      lastDropdownTimeRange,
      isAnyChartRefreshing,
      setIsAnyChartRefreshing,
      subQueryTimeRange,
    ]
  )

  return <ServiceOverviewContext.Provider value={value}>{children}</ServiceOverviewContext.Provider>
}

export function useServiceOverviewContext() {
  const context = useContext(ServiceOverviewContext)
  if (context === undefined) {
    throw new Error('useServiceOverviewContext must be used within an ServiceOverviewProvider')
  }
  return context
}
