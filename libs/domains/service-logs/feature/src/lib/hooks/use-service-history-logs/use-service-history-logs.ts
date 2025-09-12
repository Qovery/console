import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { serviceLogs } from '@qovery/domains/service-logs/data-access'
import { useDebounce } from '@qovery/shared/util-hooks'
import { queryParamsServiceLogs } from '../../list-service-logs/service-logs-context/service-logs-context'

export interface UseServiceHistoryLogsProps {
  clusterId: string
  serviceId: string
  startDate?: Date
  endDate?: Date
  enabled?: boolean
}

export type LogType = 'INFRA' | 'SERVICE'

const DEBOUNCE_TIME = 400

export function useServiceHistoryLogs({
  clusterId,
  serviceId,
  startDate,
  endDate,
  enabled = false,
}: UseServiceHistoryLogsProps) {
  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  // States for controlling log actions, showing new, previous or paused logs
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)

  const [enabledNginx, setEnabledNginx] = useState(false)

  // Build filters from query parameters
  const filters = useMemo(
    () => ({
      level: queryParams.level || undefined,
      pod: queryParams.podName || undefined,
      message: queryParams.message || undefined,
      version: queryParams.version || undefined,
    }),
    [queryParams.level, queryParams.podName, queryParams.message, queryParams.version]
  )

  // Fetch service logs using useQuery instead of websocket
  const { data: serviceLogsData = [] } = useQuery({
    ...serviceLogs.serviceLogs({
      clusterId,
      serviceId,
      startDate,
      endDate,
      filters,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && Boolean(startDate) && Boolean(endDate) && enabled,
  })

  // const data = useMemo(() => {
  //   // Convert serviceLogsData to the expected format and combine with infra messages
  //   const serviceLogsFormatted: FormattedServiceLog[] = serviceLogsData.map((log: ServiceLogResponseDto) => ({
  //     ...log,
  //     type: 'SERVICE' as LogType,
  //     id: logCounter.current++,
  //   }))

  //   // Check if there are new messages available
  //   if (serviceLogsData.length > 0) {
  //     setNewMessagesAvailable(true)
  //   }

  //   return serviceLogsFormatted
  //     .filter((log: FormattedServiceLog, index: number, array: FormattedServiceLog[]) =>
  //       showPreviousLogs || array.length - 1 - OFFSET <= index ? true : log.created_at > now
  //     )
  //     .sort((a: FormattedServiceLog, b: FormattedServiceLog) =>
  //       a.created_at && b.created_at ? a.created_at - b.created_at : 0
  //     )
  // }, [serviceLogsData, showPreviousLogs, now])

  const debouncedLogs = useDebounce(serviceLogsData, DEBOUNCE_TIME)
  const pausedDataLogs = useMemo(() => debouncedLogs, [debouncedLogs])

  // console.log('debouncedLogs', debouncedLogs)
  console.log('history logs', debouncedLogs)

  return {
    data: pauseLogs ? pausedDataLogs : debouncedLogs,
    pauseLogs,
    setPauseLogs,
    setNewMessagesAvailable,
    newMessagesAvailable,
    showPreviousLogs,
    setShowPreviousLogs,
    enabledNginx,
    setEnabledNginx,
  }
}

export default useServiceHistoryLogs
