import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BooleanParam, type QueryParamConfig, StringParam, useQueryParam } from 'use-query-params'
import { v4 as uuidv4 } from 'uuid'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { type TimeRangeOption, createTimeRangeHandler } from '../../service-overview/util-filter/time-range'

interface RdsManagedDbContextType {
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

  // Trace ID
  traceId: string
}

const RdsManagedDbContext = createContext<RdsManagedDbContextType | undefined>(undefined)

export function RdsManagedDbProvider({ children }: PropsWithChildren) {
  const [useLocalTime = false, setUseLocalTime] = useQueryParam('useLocalTime', BooleanParam)
  const [timeRange = '1h', setTimeRange] = useQueryParam<TimeRangeOption>(
    'timeRange',
    StringParam as QueryParamConfig<TimeRangeOption, TimeRangeOption>
  )
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const [startDate = oneHourAgo.toISOString(), setStartDate] = useQueryParam('startDate', StringParam)
  const [endDate = now.toISOString(), setEndDate] = useQueryParam('endDate', StringParam)

  // Trace ID for tracing requests
  const traceId = uuidv4()

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
    setIsAnyChartZoomed(false)
  }, [zoomResetFunctions])

  // Zoom state tracking
  const [isAnyChartZoomed, setIsAnyChartZoomed] = useState(false)

  // Chart refreshing state tracking
  const [refreshingCount, setRefreshingCount] = useState(0)
  const isAnyChartRefreshing = refreshingCount > 0

  const setIsAnyChartRefreshing = useCallback((isRefreshing: boolean) => {
    setRefreshingCount((prev) => (isRefreshing ? prev + 1 : Math.max(0, prev - 1)))
  }, [])

  const handleTimeRangeChange = useCallback(
    (range: TimeRangeOption) => {
      resetChartZoom()
      setLastDropdownTimeRange(range)
      createTimeRangeHandler(setTimeRange, setStartDate, setEndDate)(range)
    },
    [resetChartZoom]
  )

  const handleZoomTimeRangeChange = useCallback((startTimestamp: number, endTimestamp: number) => {
    const startDateISO = new Date(startTimestamp * 1000).toISOString()
    const endDateISO = new Date(endTimestamp * 1000).toISOString()

    setStartDate(startDateISO)
    setEndDate(endDateISO)
    setTimeRange('custom')
  }, [])

  const startTimestamp = startDate && convertDatetoTimestamp(startDate).toString()
  const endTimestamp = endDate && convertDatetoTimestamp(endDate).toString()

  const queryTimeRange =
    isAnyChartZoomed && startTimestamp && endTimestamp
      ? `${Math.floor((parseInt(endTimestamp) - parseInt(startTimestamp)) / 60)}m`
      : timeRange

  const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60
  const subQueryTimeRange =
    isAnyChartZoomed && startTimestamp && endTimestamp
      ? parseInt(endTimestamp) - parseInt(startTimestamp) > THREE_DAYS_IN_SECONDS
        ? '5m'
        : '1m'
      : '1m'

  useEffect(() => {
    const isLiveRange = ['5m', '15m', '30m'].includes(timeRange)

    if (!isLiveRange || !isLiveUpdateEnabled || isAnyChartZoomed || isDatePickerOpen) return

    const roundDateToStep = (date: Date, stepSeconds: number): Date => {
      const timestamp = Math.floor(date.getTime() / 1000)
      const rounded = Math.floor(timestamp / stepSeconds) * stepSeconds
      return new Date(rounded * 1000)
    }

    const getStepSeconds = (timeRange: TimeRangeOption) => {
      switch (timeRange) {
        case '5m':
          return 15
        case '15m':
          return 30
        case '30m':
          return 60
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

    const interval = setInterval(updateDates, 30_000)
    return () => clearInterval(interval)
  }, [timeRange, isLiveUpdateEnabled, isAnyChartZoomed, isDatePickerOpen])

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      [data-event-key]:hover {
        background-color: var(--color-neutral-150);
      }

      .recharts-reference-line-line {
        cursor: pointer;
      }

      .recharts-reference-line-line.active {
        opacity: 1 !important;
      }

      .recharts-reference-line .recharts-text.recharts-label {
        opacity: 0;
      }

      .recharts-reference-line-line.active ~ .recharts-text.recharts-label {
        opacity: 1;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const value = useMemo<RdsManagedDbContextType>(
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
      subQueryTimeRange,
      traceId,
    ]
  )

  return <RdsManagedDbContext.Provider value={value}>{children}</RdsManagedDbContext.Provider>
}

export function useRdsManagedDbContext() {
  const context = useContext(RdsManagedDbContext)
  if (context === undefined) {
    throw new Error('useRdsManagedDbContext must be used within an RdsManagedDbProvider')
  }
  return context
}
