import { type QueryClient } from '@tanstack/react-query'
import { useParams, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type NormalizedServiceLog,
  buildLokiQuery,
  normalizeWebSocketLog,
} from '@qovery/domains/service-logs/data-access'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UseServiceLiveLogsProps {
  clusterId?: string
  serviceId?: string
  enabled?: boolean
}

const DEBOUNCE_TIME = 400
const LIMIT = 200

export function useServiceLiveLogs({ clusterId, serviceId, enabled = false }: UseServiceLiveLogsProps) {
  const { organizationId, projectId, environmentId } = useParams({ strict: false })
  const queryParams = useSearch({ strict: false })

  const serviceLogsBuffer = useRef<NormalizedServiceLog[]>([])
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [bufferedLogsCount, setBufferedLogsCount] = useState(0)
  const [isScrollPaused, setIsScrollPaused] = useState(false)
  const isScrollPausedRef = useRef(false)
  const [isFetched, setIsFetched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [debouncedLogs, setDebouncedLogs] = useState<NormalizedServiceLog[]>([])

  const setPauseLogs = useCallback((paused: boolean | ((prev: boolean) => boolean)) => {
    setIsScrollPaused((prev) => {
      const next = typeof paused === 'function' ? paused(prev) : paused
      isScrollPausedRef.current = next
      if (!next) setBufferedLogsCount(0)
      return next
    })
  }, [])

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
      if (isScrollPausedRef.current) setBufferedLogsCount((c) => c + 1)
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
      if (isScrollPausedRef.current) setBufferedLogsCount((c) => c + 1)
      const normalizedLog = normalizeWebSocketLog(log)

      // Temporary fix to show NGINX logs as unknown to avoid UI issues
      serviceLogsBuffer.current.push({ ...normalizedLog, level: 'unknown' })
      scheduleFlush()
    },
    [scheduleFlush]
  )

  const onLogHandlerEnvoy = useCallback(
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
      if (isScrollPausedRef.current) setBufferedLogsCount((c) => c + 1)
      const normalizedLog = normalizeWebSocketLog(log)

      // Temporary fix to show Envoy logs as unknown to avoid UI issues
      serviceLogsBuffer.current.push({ ...normalizedLog, level: 'unknown' })
      scheduleFlush()
    },
    [scheduleFlush]
  )

  const onCloseHandler = useCallback((_: QueryClient) => {
    setDebouncedLogs([])
    serviceLogsBuffer.current = []
    setBufferedLogsCount(0)
    setIsFetched(true)
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
      search: queryParams.search || undefined,
      deploymentId: queryParams.deploymentId || undefined,
    })
  }, [
    serviceId,
    queryParams.level,
    queryParams.instance,
    queryParams.container,
    queryParams.message,
    queryParams.version,
    queryParams.search,
    queryParams.deploymentId,
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
        search: queryParams.search || undefined,
        version: queryParams.version || undefined,
      },
      'nginx'
    )
  }, [
    serviceId,
    queryParams.level,
    queryParams.instance,
    queryParams.container,
    queryParams.message,
    queryParams.search,
    queryParams.version,
  ])

  const dynamicQueryEnvoy = useMemo(() => {
    if (!serviceId) return ''

    return buildLokiQuery(
      {
        serviceId,
        level: queryParams.level || undefined,
        instance: queryParams.instance || undefined,
        container: queryParams.container || undefined,
        message: queryParams.message || undefined,
        search: queryParams.search || undefined,
        version: queryParams.version || undefined,
      },
      'envoy'
    )
  }, [
    serviceId,
    queryParams.level,
    queryParams.instance,
    queryParams.container,
    queryParams.message,
    queryParams.search,
    queryParams.version,
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

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/logs',
    urlSearchParams: {
      organization: organizationId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      cluster: clusterId,
      query: dynamicQueryEnvoy,
      limit: LIMIT.toString(),
    },
    enabled:
      Boolean(clusterId) && Boolean(serviceId) && Boolean(dynamicQueryEnvoy) && Boolean(queryParams.envoy) && enabled,
    onMessage: onLogHandlerEnvoy,
    onClose: onCloseHandler,
    onOpen: onOpenHandler,
  })

  const pausedDataLogs = useMemo(
    () => debouncedLogs.sort((a, b) => Number(a?.timestamp) - Number(b?.timestamp)),
    [debouncedLogs]
  )

  return {
    data: isScrollPaused ? pausedDataLogs : debouncedLogs,
    isScrollPaused,
    setPauseLogs,
    bufferedLogsCount,
    isFetched,
    isLoading,
  }
}

export default useServiceLiveLogs
