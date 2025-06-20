import { type PropsWithChildren, createContext, useContext, useState } from 'react'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import { type TimeRangeOption, createTimeRangeHandler } from './time-range-utils'

interface ObservabilityContextType {
  // Admin and debugging states
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
  customQuery: string | undefined
  setCustomQuery: (value: string | undefined) => void
  customApiEndpoint: string
  setCustomApiEndpoint: (value: string) => void

  // Selection states
  clusterId: string
  setClusterId: (value: string) => void
  serviceId: string
  setServiceId: (value: string) => void

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
}

const ObservabilityContext = createContext<ObservabilityContextType | undefined>(undefined)

export function ObservabilityProvider({ children }: PropsWithChildren) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [clusterId, setClusterId] = useState('3f50657b-1162-4dde-b706-4d5e937f3c09')
  const [serviceId, setServiceId] = useState('02085927-12dd-40ef-a155-8f1583ffc7a3')
  const [customQuery, setCustomQuery] = useState<string | undefined>(undefined)
  const [customApiEndpoint, setCustomApiEndpoint] = useState('api/v1/query_range')
  const [useLocalTime, setUseLocalTime] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('live')
  const [startDate, setStartDate] = useState(new Date('2025-07-27T10:00:00Z').toISOString())
  const [endDate, setEndDate] = useState(new Date('2025-07-27T12:00:00Z').toISOString())

  const handleTimeRangeChange = createTimeRangeHandler(setTimeRange, setStartDate, setEndDate)

  const startTimestamp = convertDatetoTimestamp(startDate).toString()
  const endTimestamp = convertDatetoTimestamp(endDate).toString()

  const value: ObservabilityContextType = {
    isAdmin,
    setIsAdmin,
    customQuery,
    setCustomQuery,
    customApiEndpoint,
    setCustomApiEndpoint,
    clusterId,
    setClusterId,
    serviceId,
    setServiceId,
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
  }

  return <ObservabilityContext.Provider value={value}>{children}</ObservabilityContext.Provider>
}

export function useObservabilityContext() {
  const context = useContext(ObservabilityContext)
  if (context === undefined) {
    throw new Error('useObservabilityContext must be used within an ObservabilityProvider')
  }
  return context
}
