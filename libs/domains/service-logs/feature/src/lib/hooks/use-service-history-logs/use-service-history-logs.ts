import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { normalizeServiceLog, serviceLogs } from '@qovery/domains/service-logs/data-access'
import { queryParamsServiceLogs } from '../../list-service-logs/service-logs-context/service-logs-context'

export interface UseServiceHistoryLogsProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

export function useServiceHistoryLogs({ clusterId, serviceId, enabled = false }: UseServiceHistoryLogsProps) {
  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const [showPreviousLogs, setShowPreviousLogs] = useState(false)

  const [enabledNginx, setEnabledNginx] = useState(false)

  const startDate = useMemo(
    () => (queryParams.startDate ? new Date(queryParams.startDate) : undefined),
    [queryParams.startDate]
  )

  const endDate = useMemo(
    () => (queryParams.endDate ? new Date(queryParams.endDate) : undefined),
    [queryParams.endDate]
  )

  // Build filters from query parameters
  const filters = useMemo(
    () => ({
      level: queryParams.level || undefined,
      instance: queryParams.instance || undefined,
      container: queryParams.container || undefined,
      message: queryParams.message || undefined,
      version: queryParams.version || undefined,
    }),
    [queryParams.level, queryParams.instance, queryParams.container, queryParams.message, queryParams.version]
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
    enabled:
      Boolean(clusterId) &&
      Boolean(serviceId) &&
      Boolean(queryParams.startDate) &&
      Boolean(queryParams.endDate) &&
      enabled,
  })

  const logs = useMemo(() => {
    return serviceLogsData.map(normalizeServiceLog)
  }, [serviceLogsData])

  return {
    data: logs,
    showPreviousLogs,
    setShowPreviousLogs,
    enabledNginx,
    setEnabledNginx,
  }
}

export default useServiceHistoryLogs
