import { type QueryClient } from '@tanstack/react-query'
import { type ServiceInfraLogResponseDto, type ServiceLogResponseDto } from 'qovery-ws-typescript-axios'
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

export type LogType = 'INFRA' | 'SERVICE'

const POD_NAME_KEY = 'pod_name'
const DEBOUNCE_TIME = 400
const OFFSET = 20

// This hook simplifies the process of fetching and managing service logs data
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

  // States for controlling log actions, showing new, previous or paused logs
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)

  const [enabledNginx, setEnabledNginx] = useState(false)
  const [infraMessages, setInfraMessages] = useState<Array<ServiceInfraLogResponseDto & { type: LogType; id: number }>>(
    []
  )
  const [serviceMessages, setServiceMessages] = useState<Array<ServiceLogResponseDto & { type: LogType; id: number }>>(
    []
  )
  const debouncedServiceMessages = useDebounce(serviceMessages, DEBOUNCE_TIME)
  const now = useMemo(() => Date.now(), [])

  const infraMessageHandler = useCallback(
    (_: QueryClient, message: ServiceInfraLogResponseDto) => {
      setNewMessagesAvailable(true)
      setInfraMessages((prevMessages) => [...prevMessages, { ...message, type: 'INFRA', id: logCounter.current++ }])
    },
    [setInfraMessages]
  )

  const serviceMessageHandler = useCallback(
    (_: QueryClient, message: ServiceLogResponseDto) => {
      setNewMessagesAvailable(true)
      setServiceMessages((prevMessages) => [...prevMessages, { ...message, type: 'SERVICE', id: logCounter.current++ }])
    },
    [setServiceMessages]
  )

  // Websocket subscription for service logs based on `pod_name`
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

  // Websocket subscription for NGINX service logs
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/infra/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      infra_component_type: 'NGINX',
    },
    enabled:
      Boolean(organizationId) &&
      Boolean(clusterId) &&
      Boolean(projectId) &&
      Boolean(environmentId) &&
      Boolean(serviceId) &&
      // enabledLogs &&
      enabledNginx,
    onMessage: infraMessageHandler,
  })

  const debouncedInfraMessages = useDebounce(infraMessages, DEBOUNCE_TIME)

  const data = useMemo(() => {
    return debouncedServiceMessages
      .concat(
        enabledNginx
          ? debouncedInfraMessages.map((message) => ({ version: '', pod_name: '', container_name: '', ...message }))
          : []
      )
      .filter((log, index, array) =>
        showPreviousLogs || array.length - 1 - OFFSET <= index ? true : log.created_at > now
      )
      .sort((a, b) => (a.created_at && b.created_at ? a.created_at - b.created_at : 0))
  }, [debouncedServiceMessages, debouncedInfraMessages, enabledNginx, showPreviousLogs, now])

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
    enabledNginx,
    setEnabledNginx,
  }
}

export default useServiceLogs
