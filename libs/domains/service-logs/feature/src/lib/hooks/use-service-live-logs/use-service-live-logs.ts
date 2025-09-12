import { type QueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryParams } from 'use-query-params'
import { type ServiceLog, buildLokiQuery } from '@qovery/domains/service-logs/data-access'
import { useDebounce } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { queryParamsServiceLogs } from '../../list-service-logs/service-logs-context/service-logs-context'

export interface UseServiceLiveLogsProps {
  clusterId?: string
  serviceId?: string
  enabled?: boolean
}

export type LogType = 'INFRA' | 'SERVICE'

const DEBOUNCE_TIME = 400

// This hook simplifies the process of fetching and managing service logs data
export function useServiceLiveLogs({ clusterId, serviceId, enabled = false }: UseServiceLiveLogsProps) {
  const { organizationId, projectId, environmentId } = useParams()
  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const serviceMessagesMap = useRef<Map<string, ServiceLog[]>>(new Map())

  // States for controlling log actions, showing new, previous or paused logs
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)

  const [enabledNginx, setEnabledNginx] = useState(false)
  const [debouncedServiceMessages] = useState<ServiceLog[]>([])

  // XXX: Need to use custom useDebounce like method due to ref usage
  useEffect(() => {
    const handler = setTimeout(() => {
      // setDebouncedServiceMessages([...serviceMessagesMap.current.values()])
    }, DEBOUNCE_TIME)

    return () => {
      clearTimeout(handler)
    }
  }, [serviceMessagesMap.current.size])

  // const infraMessageHandler = useCallback(
  //   (_: QueryClient, message: ServiceInfraLogResponseDto) => {
  //     setNewMessagesAvailable(true)
  //     setInfraMessages((prevMessages) => [...prevMessages, { ...message, type: 'INFRA', id: logCounter.current++ }])
  //   },
  //   [setInfraMessages]
  // )

  const serviceMessageHandler = useCallback((_: QueryClient, log: ServiceLog) => {
    console.log('log', log)
    // setNewMessagesAvailable(true)
    // const msgKey = `SERVICE-${message.created_at}-${message.container_name}-${message.pod_name}-${message.message}`
    // serviceMessagesMap.current.set(message.timestamp, message)
  }, [])

  // Dynamic query based on query parameters
  const dynamicQuery = useMemo(() => {
    if (!serviceId) return ''

    return buildLokiQuery({
      serviceId,
      level: queryParams.level || undefined,
      pod: queryParams.podName || undefined,
      message: queryParams.message || undefined,
      version: queryParams.version || undefined,
    })
  }, [serviceId, queryParams.level, queryParams.podName, queryParams.message, queryParams.version])

  // Websocket subscription for service logs with dynamic query
  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/logs',
    urlSearchParams: {
      organization: organizationId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      cluster: clusterId,
      query: dynamicQuery,
    },
    enabled: Boolean(clusterId) && Boolean(serviceId) && enabled && Boolean(dynamicQuery),
    onMessage: serviceMessageHandler,
  })

  const data = useMemo(() => {
    return debouncedServiceMessages
  }, [debouncedServiceMessages])

  const debouncedLogs = useDebounce(data, DEBOUNCE_TIME)
  const pausedDataLogs = useMemo(() => debouncedLogs, [debouncedLogs])

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
