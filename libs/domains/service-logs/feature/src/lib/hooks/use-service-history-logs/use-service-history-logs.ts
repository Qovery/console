import { useQuery } from '@tanstack/react-query'
import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { serviceLogs } from '@qovery/domains/service-logs/data-access'
import { useDebounce } from '@qovery/shared/util-hooks'

export interface UseServiceLogsProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
  enabled?: boolean
}

export type LogType = 'INFRA' | 'SERVICE'

// Type for formatted service logs
type FormattedServiceLog = ServiceLogResponseDto & { type: LogType; id: number }

const POD_NAME_KEY = 'pod_name'
const DEBOUNCE_TIME = 400
const OFFSET = 20

export function useServiceHistoryLogs({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  enabled = false,
}: UseServiceLogsProps) {
  const logCounter = useRef(0)
  const [searchParams] = useSearchParams()

  // States for controlling log actions, showing new, previous or paused logs
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)

  const [enabledNginx, setEnabledNginx] = useState(false)

  const now = useMemo(() => Date.now(), [])

  // Fetch service logs using useQuery instead of websocket
  const { data: serviceLogsData = [] } = useQuery({
    ...serviceLogs.serviceLogs({
      clusterId,
      serviceId,
      query: 'test',
    }),
    enabled:
      Boolean(organizationId) &&
      Boolean(clusterId) &&
      Boolean(projectId) &&
      Boolean(environmentId) &&
      Boolean(serviceId) &&
      enabled,
  })

  const data = useMemo(() => {
    // Convert serviceLogsData to the expected format and combine with infra messages
    const serviceLogsFormatted: FormattedServiceLog[] = serviceLogsData.map((log: ServiceLogResponseDto) => ({
      ...log,
      type: 'SERVICE' as LogType,
      id: logCounter.current++,
    }))

    // Check if there are new messages available
    if (serviceLogsData.length > 0) {
      setNewMessagesAvailable(true)
    }

    return serviceLogsFormatted
      .filter((log: FormattedServiceLog, index: number, array: FormattedServiceLog[]) =>
        showPreviousLogs || array.length - 1 - OFFSET <= index ? true : log.created_at > now
      )
      .sort((a: FormattedServiceLog, b: FormattedServiceLog) =>
        a.created_at && b.created_at ? a.created_at - b.created_at : 0
      )
  }, [serviceLogsData, showPreviousLogs, now])

  const debouncedLogs = useDebounce(data, DEBOUNCE_TIME)
  const pausedDataLogs = useMemo(() => debouncedLogs, [pauseLogs])

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
