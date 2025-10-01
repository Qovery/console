import { type QueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryParams } from 'use-query-params'
import {
  type NormalizedServiceLog,
  buildLokiQuery,
  normalizeWebSocketLog,
} from '@qovery/domains/service-logs/data-access'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { queryParamsServiceLogs } from '../../list-service-logs/service-logs-context/service-logs-context'

export interface UseServiceLiveLogsProps {
  clusterId?: string
  serviceId?: string
  enabled?: boolean
}

const DEBOUNCE_TIME = 400
const LIMIT = 200

export function useServiceLiveLogs({ clusterId, serviceId, enabled = false }: UseServiceLiveLogsProps) {
  const { organizationId, projectId, environmentId } = useParams()
  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const serviceLogsBuffer = useRef<NormalizedServiceLog[]>([])
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [newLogsAvailable, setNewLogsAvailable] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)
  const [isFetched, setIsFetched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [enabledNginx, setEnabledNginx] = useState(false)
  const [debouncedLogs, setDebouncedLogs] = useState<NormalizedServiceLog[]>([])

  const flushBufferedLogs = useCallback(() => {
    if (serviceLogsBuffer.current.length > 0) {
      setDebouncedLogs((prev) => [...prev, ...serviceLogsBuffer.current])
      serviceLogsBuffer.current = []
      setIsFetched(true)
      setIsLoading(false)
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      flushBufferedLogs()
    }, DEBOUNCE_TIME)
  }, [flushBufferedLogs])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const onLogHandler = useCallback(
    (
      _: QueryClient,
      log: {
        created_at?: number
        message?: string
        pod_name?: string
        container_name?: string
        version?: string
      }
    ) => {
      setNewLogsAvailable(true)
      const normalizedLog = normalizeWebSocketLog(log)
      serviceLogsBuffer.current.push(normalizedLog)
      scheduleFlush()
    },
    [scheduleFlush]
  )

  const onLogHandlerNginx = useCallback(
    (
      _: QueryClient,
      log: {
        created_at?: number
        message?: string
        pod_name?: string
        container_name?: string
        version?: string
      }
    ) => {
      setNewLogsAvailable(true)
      const normalizedLog = normalizeWebSocketLog(log)

      serviceLogsBuffer.current.push(normalizedLog)
      scheduleFlush()
    },
    [scheduleFlush]
  )

  const onCloseHandler = useCallback((_: QueryClient) => {
    setDebouncedLogs([])
    serviceLogsBuffer.current = []
    setNewLogsAvailable(false)
    setIsFetched(false)
    setIsLoading(false)
  }, [])

  const onOpenHandler = useCallback(() => {
    setIsLoading(true)
  }, [])

  const dynamicQuery = useMemo(() => {
    if (!serviceId) return ''

    return buildLokiQuery({
      serviceId,
      level: queryParams.level || undefined,
      instance: queryParams.instance || undefined,
      container: queryParams.container || undefined,
      message: queryParams.message || undefined,
      version: queryParams.version || undefined,
    })
  }, [
    serviceId,
    queryParams.level,
    queryParams.instance,
    queryParams.container,
    queryParams.message,
    queryParams.version,
  ])

  const dynamicQueryNginx = useMemo(() => {
    if (!serviceId) return ''

    return buildLokiQuery(
      {
        serviceId,
        level: queryParams.level || undefined,
        instance: queryParams.instance || undefined,
        container: queryParams.container || undefined,
        message: queryParams.message || undefined,
        version: queryParams.version || undefined,
      },
      Boolean(queryParams.nginx)
    )
  }, [
    serviceId,
    queryParams.level,
    queryParams.instance,
    queryParams.container,
    queryParams.message,
    queryParams.version,
    queryParams.nginx,
  ])

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/logs',
    urlSearchParams: {
      organization: organizationId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      cluster: clusterId,
      query: dynamicQuery,
      limit: LIMIT.toString(),
    },
    enabled: Boolean(clusterId) && Boolean(serviceId) && Boolean(dynamicQuery) && enabled,
    onMessage: onLogHandler,
    onClose: onCloseHandler,
    onOpen: onOpenHandler,
  })

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/logs',
    urlSearchParams: {
      organization: organizationId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      cluster: clusterId,
      query: dynamicQueryNginx,
      limit: LIMIT.toString(),
    },
    enabled:
      Boolean(clusterId) && Boolean(serviceId) && Boolean(dynamicQueryNginx) && Boolean(queryParams.nginx) && enabled,
    onMessage: onLogHandlerNginx,
    onClose: onCloseHandler,
    onOpen: onOpenHandler,
  })

  const pausedDataLogs = useMemo(
    () => debouncedLogs.sort((a, b) => Number(a?.timestamp) - Number(b?.timestamp)),
    [debouncedLogs]
  )

  return {
    data: pauseLogs ? pausedDataLogs : debouncedLogs,
    pauseLogs,
    setPauseLogs,
    setNewLogsAvailable,
    newLogsAvailable,
    enabledNginx,
    setEnabledNginx,
    isFetched,
    isLoading,
  }
}

export default useServiceLiveLogs
