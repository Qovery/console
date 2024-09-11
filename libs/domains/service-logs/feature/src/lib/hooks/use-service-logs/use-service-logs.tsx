import { type QueryClient } from '@tanstack/react-query'
import { type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UseServiceLogsProps {
  organizationId?: string
  clusterId?: string
  projectId?: string
  environmentId?: string
  serviceId?: string
  enabled?: boolean
}

const POD_NAME_KEY = 'pod_name'
const DEBOUNCE_TIME = 400
const OFFSET = 20

export function useServiceLogs({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  enabled = false,
}: UseServiceLogsProps) {
  const logCounter = useRef(0)
  const [searchParams] = useSearchParams()
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [serviceMessages, setServiceMessages] = useState<Array<ServiceLogResponseDto & { id: number }>>([])
  const [pauseLogs, setPauseLogs] = useState(false)
  const debouncedServiceMessages = useDebounce(serviceMessages, DEBOUNCE_TIME)
  const now = useMemo(() => Date.now(), [])

  const serviceMessageHandler = useCallback(
    (_: QueryClient, message: ServiceLogResponseDto) => {
      setNewMessagesAvailable(true)
      setServiceMessages((prevMessages) => [...prevMessages, { ...message, id: logCounter.current++ }])
    },
    [setServiceMessages]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      pod_name: searchParams.get(POD_NAME_KEY) ?? undefined,
    },
    enabled:
      Boolean(organizationId) &&
      Boolean(clusterId) &&
      Boolean(projectId) &&
      Boolean(environmentId) &&
      Boolean(serviceId) &&
      enabled,
    onMessage: serviceMessageHandler,
  })

  const data = useMemo(() => {
    return (
      debouncedServiceMessages
        //   .concat(
        //     enabledNginx
        //       ? debouncedInfraMessages.map((message) => ({ version: '', pod_name: '', container_name: '', ...message }))
        //       : []
        //   )
        .filter((log, index, array) =>
          showPreviousLogs || array.length - 1 - OFFSET <= index ? true : log.created_at > now
        )
        .sort((a, b) => (a.created_at && b.created_at ? a.created_at - b.created_at : 0))
    )
  }, [debouncedServiceMessages])

  const debouncedLogs = useDebounce(data, DEBOUNCE_TIME)
  const pausedDataLogs = useMemo(() => debouncedLogs, [pauseLogs])

  return {
    data: pauseLogs ? pausedDataLogs : debouncedLogs,
    isLoading: false,
    pauseLogs,
    setPauseLogs,
    setNewMessagesAvailable,
    newMessagesAvailable,
    serviceMessages,
    showPreviousLogs,
    setShowPreviousLogs,
  }
}

export default useServiceLogs
