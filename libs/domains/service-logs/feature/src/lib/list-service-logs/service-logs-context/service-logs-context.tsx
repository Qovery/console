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
  podName: StringParam,
  containerName: StringParam,
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

  // Filtering states - derived from queryParams
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = []
    if (queryParams.podName) filters.push({ id: 'pod_name', value: queryParams.podName })
    if (queryParams.version) filters.push({ id: 'version', value: queryParams.version })
    if (queryParams.message) filters.push({ id: 'message', value: queryParams.message })
    return filters
  }, [queryParams.podName, queryParams.version, queryParams.message])

  // Time format preferences
  const [updateTimeContextValue, setUpdateTimeContext] = useState<UpdateTimeContextProps>({
    utc: false,
  })

  // Live/Historical mode toggle (default to live mode when no dates)
  const isLiveMode = !queryParams.startDate && !queryParams.endDate

  // Log streaming control states - managed internally now
  const [pauseLogs, setPauseLogs] = useState(false)
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)

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

  const setColumnFilters = useCallback(
    (filters: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
      const newFilters = typeof filters === 'function' ? filters(columnFilters) : filters
      const updates: Record<string, string | undefined> = {}

      updates['podName'] = (newFilters.find((f) => f.id === 'pod_name')?.value as string) || undefined
      updates['version'] = (newFilters.find((f) => f.id === 'version')?.value as string) || undefined
      updates['message'] = (newFilters.find((f) => f.id === 'message')?.value as string) || undefined

      setQueryParams(updates)
    },
    [columnFilters, setQueryParams]
  )

  const toggleColumnFilter = useCallback(
    (id: string, value: string) => {
      const existingFilter = columnFilters.find((f) => f.id === id)
      const paramKey = id === 'pod_name' ? 'podName' : id

      if (existingFilter) {
        setQueryParams({ [paramKey]: undefined })
      } else {
        setQueryParams({ [paramKey]: value.trim() })
      }
    },
    [columnFilters, setQueryParams]
  )

  const clearColumnFilter = useCallback(
    (filterId: string) => {
      const paramKey = filterId === 'pod_name' ? 'podName' : filterId
      setQueryParams({ [paramKey]: undefined })
    },
    [setQueryParams]
  )

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

  const isFilterActive = useCallback(
    (id: string, value: string) => columnFilters.some((f) => f.id === id && f.value === value),
    [columnFilters]
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

      // Filtering
      columnFilters,
      setColumnFilters,
      toggleColumnFilter,
      clearColumnFilter,
      isFilterActive,

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
      columnFilters,
      setColumnFilters,
      toggleColumnFilter,
      clearColumnFilter,
      isFilterActive,
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
