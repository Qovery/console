import { type PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
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

  // Handlers
  handleTimeRangeChange: (range: TimeRangeOption) => void
  handleZoomTimeRangeChange: (startTimestamp: number, endTimestamp: number) => void

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
}

const ServiceOverviewContext = createContext<ServiceOverviewContextType | undefined>(undefined)

export function ServiceOverviewProvider({ children }: PropsWithChildren) {
  const [useLocalTime, setUseLocalTime] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30m')

  const now = new Date()
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

  const [startDate, setStartDate] = useState(thirtyMinutesAgo.toISOString())
  const [endDate, setEndDate] = useState(now.toISOString())

  const handleTimeRangeChange = createTimeRangeHandler(setTimeRange, setStartDate, setEndDate)

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

    if (!isLiveRange) return

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
  }, [timeRange])

  const startTimestamp = convertDatetoTimestamp(startDate).toString()
  const endTimestamp = convertDatetoTimestamp(endDate).toString()

  const [hideEvents, setHideEvents] = useState(false)
  const [expandCharts, setExpandCharts] = useState(false)

  const [hasCalendarValue, setHasCalendarValue] = useState(false)

  const [hoveredEventKey, setHoveredEventKey] = useState<string | null>(null)

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
    setHideEvents,
    hideEvents,
    expandCharts,
    setExpandCharts,
    hasCalendarValue,
    setHasCalendarValue,
    hoveredEventKey,
    setHoveredEventKey,
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
