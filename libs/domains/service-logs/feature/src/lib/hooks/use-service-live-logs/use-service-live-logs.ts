import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { serviceLogs } from '@qovery/domains/service-logs/data-access'
import { useDebounce } from '@qovery/shared/util-hooks'

export interface UseServiceLiveLogsProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
  enabled?: boolean
}

export type LogType = 'INFRA' | 'SERVICE'

const POD_NAME_KEY = 'pod_name'
const DEBOUNCE_TIME = 400
const OFFSET = 20

// This hook simplifies the process of fetching and managing service logs data
export function useServiceLiveLogs({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  enabled = false,
}: UseServiceLiveLogsProps) {
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
    }),
    enabled,
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
  const pausedDataLogs = useMemo(() => debouncedLogs, [pauseLogs])

  // console.log('debouncedLogs', debouncedLogs)

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

export default useServiceLiveLogs
