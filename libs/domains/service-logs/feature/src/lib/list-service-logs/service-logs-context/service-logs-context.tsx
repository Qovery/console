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

  // Time format preferences
  updateTimeContextValue: UpdateTimeContextProps
  setUpdateTimeContext: (
    value: UpdateTimeContextProps | ((prev: UpdateTimeContextProps) => UpdateTimeContextProps)
  ) => void

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
  // const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)

  // Loading
  // const [logsIsLoading, setLogsIsLoading] = useState(false)

  // Time format preferences
  const [updateTimeContextValue, setUpdateTimeContext] = useState<UpdateTimeContextProps>({
    utc: false,
  })

  // Live/Historical mode toggle (default to live mode when no dates)
  // const isLiveMode = useMemo(
  //   () => !queryParams.startDate && !queryParams.endDate,
  //   [queryParams.startDate, queryParams.endDate]
  // )

  // const setIsLiveMode = useCallback(
  //   (isLive: boolean) => {
  //     if (isLive) {
  //       // Reset dates to enable live mode
  //       setQueryParams({ startDate: undefined, endDate: undefined })
  //     } else {
  //       // Set current time as default when switching to historical mode
  //       const now = new Date().toISOString()
  //       setQueryParams({ startDate: now, endDate: now })
  //     }
  //   },
  //   [setQueryParams]
  // )

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

      // Time format preferences
      updateTimeContextValue,
      setUpdateTimeContext,

      // Actions
      downloadLogs,
    }),
    [environment, serviceId, serviceStatus, environmentStatus, updateTimeContextValue, downloadLogs]
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
