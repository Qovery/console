import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { OrganizationEventTargetType, type OrganizationEventResponse } from 'qovery-typescript-axios'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { useService } from '@qovery/domains/services/feature'
import { useEvents } from '../../hooks/use-events/use-events'
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

  // Hovered event
  hoveredEventKey: string | null
  setHoveredEventKey: (value: string | null) => void
  hoveredEventKeyDebounced: string | null

  // Live update toggle
  isLiveUpdateEnabled: boolean
  setIsLiveUpdateEnabled: (value: boolean) => void

  // Date picker state
  isDatePickerOpen: boolean
  setIsDatePickerOpen: (value: boolean) => void

  // Events (centralized)
  events: OrganizationEventResponse[] | undefined
  eventsLoading: boolean
}

const ServiceOverviewContext = createContext<ServiceOverviewContextType | undefined>(undefined)

export function ServiceOverviewProvider({ children }: PropsWithChildren) {
  const { organizationId = '', applicationId = '' } = useParams()
  const [useLocalTime, setUseLocalTime] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30m')

  const now = new Date()
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

  const [startDate, setStartDate] = useState(thirtyMinutesAgo.toISOString())
  const [endDate, setEndDate] = useState(now.toISOString())

  // Live update toggle - disabled by default
  const [isLiveUpdateEnabled, setIsLiveUpdateEnabled] = useState(false)

  // Date picker state - used to pause live updates while open
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Zoom reset functionality
  const [zoomResetFunctions, setZoomResetFunctions] = useState<(() => void)[]>([])

  const registerZoomReset = (resetFn: () => void) => {
    setZoomResetFunctions((prev) => [...prev, resetFn])
    // Return cleanup function
    return () => {
      setZoomResetFunctions((prev) => prev.filter((fn) => fn !== resetFn))
    }
  }

  const resetChartZoom = () => {
    zoomResetFunctions.forEach((resetFn) => resetFn())
    setIsAnyChartZoomed(false) // Reset zoom state when resetting charts
  }

  // Zoom state tracking - optimized to prevent unnecessary re-renders
  const [isAnyChartZoomed, setIsAnyChartZoomed] = useState(false)
  
  // Performance optimization: Debounce zoom state changes to prevent cascading re-renders
  const setIsAnyChartZoomedDebounced = useCallback((isZoomed: boolean) => {
    // Only update if the value actually changed
    if (isAnyChartZoomed !== isZoomed) {
      setIsAnyChartZoomed(isZoomed)
    }
  }, [isAnyChartZoomed])

  const handleTimeRangeChange = (range: TimeRangeOption) => {
    // Reset zoom first, then change time range
    resetChartZoom()
    // Create a new time range handler that doesn't cause circular dependencies
    createTimeRangeHandler(setTimeRange, setStartDate, setEndDate)(range)
  }

  const handleZoomTimeRangeChange = (startTimestamp: number, endTimestamp: number) => {
    // Convert timestamps to ISO strings and update dates
    const startDateISO = new Date(startTimestamp * 1000).toISOString()
    const endDateISO = new Date(endTimestamp * 1000).toISOString()

    setStartDate(startDateISO)
    setEndDate(endDateISO)
    setHasCalendarValue(true) // Show custom date range in the UI
  }

  // Update every 15 seconds to match actual scrape_interval
  // use-metrics.tsx: refetchInterval: 15_000ms
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

    const interval = setInterval(updateDates, 15_000) // Update every 15 seconds to match actual scrape_interval
    return () => clearInterval(interval)
  }, [timeRange, isLiveUpdateEnabled, isAnyChartZoomed, isDatePickerOpen])

  const startTimestamp = convertDatetoTimestamp(startDate).toString()
  const endTimestamp = convertDatetoTimestamp(endDate).toString()

  // Centralized events fetch - single API call for all charts
  const { data: service } = useService({ serviceId: applicationId })
  const { 
    data: events, 
    isLoading: eventsLoading 
  } = useEvents({
    organizationId,
    serviceId: applicationId,
    targetType:
      service?.service_type === 'CONTAINER'
        ? OrganizationEventTargetType.CONTAINER
        : OrganizationEventTargetType.APPLICATION,
    toTimestamp: endTimestamp,
    fromTimestamp: startTimestamp,
  })

  const [hideEvents, setHideEvents] = useState(false)
  const [expandCharts, setExpandCharts] = useState(false)

  const [hasCalendarValue, setHasCalendarValue] = useState(false)

  const [hoveredEventKey, setHoveredEventKey] = useState<string | null>(null)

  // Debounce hover state changes to prevent excessive re-renders
  const [hoveredEventKeyDebounced, setHoveredEventKeyDebounced] = useState<string | null>(null)
  
  // Use a timeout to debounce hover state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHoveredEventKeyDebounced(hoveredEventKey)
    }, 16) // ~1 frame delay for smoother interaction

    return () => clearTimeout(timeoutId)
  }, [hoveredEventKey])

  const value: ServiceOverviewContextType = {
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
    handleTimeRangeChange,
    handleZoomTimeRangeChange,
    resetChartZoom,
    registerZoomReset,
    isAnyChartZoomed,
    setIsAnyChartZoomed: setIsAnyChartZoomedDebounced,
    setHideEvents,
    hideEvents,
    expandCharts,
    setExpandCharts,
    hasCalendarValue,
    setHasCalendarValue,
    hoveredEventKey,
    setHoveredEventKey,
    hoveredEventKeyDebounced,
    isLiveUpdateEnabled,
    setIsLiveUpdateEnabled,
    isDatePickerOpen,
    setIsDatePickerOpen,
    events,
    eventsLoading,
  }

  return <ServiceOverviewContext.Provider value={value}>{children}</ServiceOverviewContext.Provider>
}

export function useServiceOverviewContext() {
  const context = useContext(ServiceOverviewContext)
  if (context === undefined) {
    throw new Error('useServiceOverviewContext must be used within an ServiceOverviewProvider')
  }
  return context
}
