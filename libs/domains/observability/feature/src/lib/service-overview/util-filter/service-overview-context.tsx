import { type PropsWithChildren, createContext, useContext, useState } from 'react'
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

  // Events
  setHideEvents: (value: boolean) => void
  hideEvents: boolean
}

const ServiceOverviewContext = createContext<ServiceOverviewContextType | undefined>(undefined)

export function ServiceOverviewProvider({ children }: PropsWithChildren) {
  const [useLocalTime, setUseLocalTime] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('1h')

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const [startDate, setStartDate] = useState(oneHourAgo.toISOString())
  const [endDate, setEndDate] = useState(now.toISOString())

  const handleTimeRangeChange = createTimeRangeHandler(setTimeRange, setStartDate, setEndDate)

  const startTimestamp = convertDatetoTimestamp(startDate).toString()
  const endTimestamp = convertDatetoTimestamp(endDate).toString()

  const [hideEvents, setHideEvents] = useState(false)

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
    setHideEvents,
    hideEvents,
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
