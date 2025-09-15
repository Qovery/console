import { type ColumnFiltersState } from '@tanstack/react-table'
import download from 'downloadjs'
import { type Environment, type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'
import { type NormalizedServiceLog } from '@qovery/domains/service-logs/data-access'

interface UpdateTimeContextProps {
  utc: boolean
  setUpdateTimeContext?: (data: { utc: boolean }) => void
}

interface ServiceLogsContextType {
  // Service info
  environment: Environment
  serviceId: string
  serviceStatus: Status
  environmentStatus?: EnvironmentStatus

  // Date/Time management
  isOpenTimestamp: boolean
  setStartDate: (date?: Date) => void
  setEndDate: (date?: Date) => void
  setIsOpenTimestamp: (open: boolean) => void
  clearDate: () => void

  // Time format preferences
  updateTimeContextValue: UpdateTimeContextProps
  setUpdateTimeContext: (
    value: UpdateTimeContextProps | ((prev: UpdateTimeContextProps) => UpdateTimeContextProps)
  ) => void

  // Live/Historical mode toggle
  isLiveMode: boolean
  setIsLiveMode: (isLive: boolean) => void

  // Actions
  downloadLogs: (logs: NormalizedServiceLog[]) => void
}

export const queryParamsServiceLogs = {
  startDate: StringParam,
  endDate: StringParam,
  instance: StringParam,
  container: StringParam,
  version: StringParam,
  message: StringParam,
  level: StringParam,
}

export const ServiceLogsContext = createContext<ServiceLogsContextType | undefined>(undefined)

interface ServiceLogsProviderProps extends PropsWithChildren {
  environment: Environment
  serviceId: string
  serviceStatus: Status
  environmentStatus?: EnvironmentStatus
}

export function ServiceLogsProvider({
  children,
  environment,
  serviceId,
  serviceStatus,
  environmentStatus,
}: ServiceLogsProviderProps) {
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)

  // Date/Time states
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)

  // Time format preferences
  const [updateTimeContextValue, setUpdateTimeContext] = useState<UpdateTimeContextProps>({
    utc: false,
  })

  // Live/Historical mode toggle (default to live mode when no dates)
  const isLiveMode = !queryParams.startDate && !queryParams.endDate

  // Actions
  const setStartDate = useCallback(
    (date?: Date) => {
      setQueryParams({ startDate: date?.toISOString() })
    },
    [setQueryParams]
  )

  const setEndDate = useCallback(
    (date?: Date) => {
      setQueryParams({ endDate: date?.toISOString() })
    },
    [setQueryParams]
  )

  const clearDate = useCallback(() => {
    setQueryParams({
      startDate: undefined,
      endDate: undefined,
    })
  }, [setQueryParams])

  const setIsLiveMode = useCallback(
    (isLive: boolean) => {
      if (isLive) {
        // Reset dates to enable live mode
        setQueryParams({ startDate: undefined, endDate: undefined })
      } else {
        // Set current time as default when switching to historical mode
        const now = new Date().toISOString()
        setQueryParams({ startDate: now, endDate: now })
      }
    },
    [setQueryParams]
  )

  const downloadLogs = useCallback((logs: NormalizedServiceLog[]) => {
    download(JSON.stringify(logs), `data-${Date.now()}.json`, 'text/json;charset=utf-8')
  }, [])

  const value = useMemo<ServiceLogsContextType>(
    () => ({
      // Service info
      environment,
      serviceId,
      serviceStatus,
      environmentStatus,

      // Date/Time management
      isOpenTimestamp,
      setStartDate,
      setEndDate,
      setIsOpenTimestamp,
      clearDate,

      // Time format preferences
      updateTimeContextValue,
      setUpdateTimeContext,

      // Live/Historical mode toggle
      isLiveMode,
      setIsLiveMode,

      // Actions
      downloadLogs,
    }),
    [
      environment,
      serviceId,
      serviceStatus,
      environmentStatus,
      isOpenTimestamp,
      setStartDate,
      setEndDate,
      clearDate,
      updateTimeContextValue,
      isLiveMode,
      setIsLiveMode,
      downloadLogs,
    ]
  )

  return <ServiceLogsContext.Provider value={value}>{children}</ServiceLogsContext.Provider>
}

export function useServiceLogsContext() {
  const context = useContext(ServiceLogsContext)
  if (context === undefined) {
    throw new Error('useServiceLogsContext must be used within a ServiceLogsProvider')
  }
  return context
}
