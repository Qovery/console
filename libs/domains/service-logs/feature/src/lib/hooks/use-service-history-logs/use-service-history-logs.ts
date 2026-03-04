import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { type ServiceLog, normalizeServiceLog, serviceLogs } from '@qovery/domains/service-logs/data-access'
import { queries } from '@qovery/state/util-queries'
import { queryParamsServiceLogs } from '../../list-service-logs/service-logs-context/service-logs-context'

export interface UseServiceHistoryLogsProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

const LOGS_PER_BATCH = 200
// Use nanosecond timestamps for pagination to avoid skipping logs that share the same millisecond
const NS_PER_MS = BigInt(1000000)
const ZERO_NS = BigInt(0)
const ONE_NS = BigInt(1)

const toTimestampNs = (date?: Date) => (date ? (BigInt(date.getTime()) * NS_PER_MS).toString() : undefined)

const getLogTimestampNs = (log: ServiceLog) => {
  if (log.timestampNs) {
    return BigInt(log.timestampNs)
  }

  return BigInt(log.timestamp) * NS_PER_MS
}

const getLogKey = (log: ServiceLog) => `${log.timestampNs ?? log.timestamp}|${log.message}`

const compareTimestamps = (a: bigint, b: bigint) => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export function useServiceHistoryLogs({ clusterId, serviceId, enabled = false }: UseServiceHistoryLogsProps) {
  const queryClient = useQueryClient()
  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const [accumulatedLogs, setAccumulatedLogs] = useState<ServiceLog[]>([])
  const [currentEndTimestampNs, setCurrentEndTimestampNs] = useState<string | null>(null)
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [resetCounter, setResetCounter] = useState(0)

  const isHistoryMode = useMemo(() => {
    if (queryParams.mode === 'history') return true
    if (queryParams.mode === 'live') return false
    return Boolean(queryParams.startDate || queryParams.endDate)
  }, [queryParams.mode, queryParams.startDate, queryParams.endDate])

  const startDate = useMemo(
    () => (queryParams.startDate ? new Date(queryParams.startDate) : undefined),
    [queryParams.startDate]
  )

  const endDate = useMemo(
    () => (queryParams.endDate ? new Date(queryParams.endDate) : undefined),
    [queryParams.endDate]
  )

  const startTimestampNs = useMemo(() => toTimestampNs(startDate), [startDate])
  const endTimestampNsFromParams = useMemo(() => toTimestampNs(endDate), [endDate])

  const filters = useMemo(
    () => ({
      level: queryParams.level || undefined,
      instance: queryParams.instance || undefined,
      message: queryParams.message || undefined,
      search: queryParams.search || undefined,
      version: queryParams.version || undefined,
      deploymentId: queryParams.deploymentId || undefined,
    }),
    [
      queryParams.level,
      queryParams.instance,
      queryParams.message,
      queryParams.search,
      queryParams.version,
      queryParams.deploymentId,
    ]
  )

  const {
    data: logs = [],
    isFetched: isFetchedLogs,
    isFetching: isLoadingLogs,
    refetch: refetchLogs,
  } = useQuery({
    ...serviceLogs.serviceLogs({
      clusterId,
      serviceId,
      startDate,
      endDate,
      startTimestampNs,
      endTimestampNs: currentEndTimestampNs ?? endTimestampNsFromParams,
      filters,
      direction: 'backward',
      limit: LOGS_PER_BATCH,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && isHistoryMode && enabled,
  })

  const {
    data: nginxLogs = [],
    isFetched: isNginxFetched,
    isFetching: isNginxLoading,
    refetch: refetchNginxLogs,
  } = useQuery({
    ...serviceLogs.serviceLogs({
      clusterId,
      serviceId,
      startDate,
      endDate,
      startTimestampNs,
      endTimestampNs: currentEndTimestampNs ?? endTimestampNsFromParams,
      filters,
      direction: 'backward',
      limit: LOGS_PER_BATCH,
      logType: 'nginx',
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && isHistoryMode && Boolean(queryParams.nginx) && enabled,
  })

  const {
    data: envoyLogs = [],
    isFetched: isEnvoyFetched,
    isFetching: isEnvoyLoading,
    refetch: refetchEnvoyLogs,
  } = useQuery({
    ...serviceLogs.serviceLogs({
      clusterId,
      serviceId,
      startDate,
      endDate,
      startTimestampNs,
      endTimestampNs: currentEndTimestampNs ?? endTimestampNsFromParams,
      filters,
      direction: 'backward',
      limit: LOGS_PER_BATCH,
      logType: 'envoy',
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && isHistoryMode && Boolean(queryParams.envoy) && enabled,
  })

  const isFetched = useMemo(
    () => isFetchedLogs || isNginxFetched || isEnvoyFetched,
    [isFetchedLogs, isNginxFetched, isEnvoyFetched]
  )

  useEffect(() => {
    if (isFetched && (logs.length > 0 || nginxLogs.length > 0 || envoyLogs.length > 0)) {
      setAccumulatedLogs((prev) => {
        const existingKeys = new Set(prev.map(getLogKey))
        const newLogs = logs.filter((log) => !existingKeys.has(getLogKey(log)))
        const newNginxLogs = nginxLogs.filter((log) => !existingKeys.has(getLogKey(log)))
        const newEnvoyLogs = envoyLogs.filter((log) => !existingKeys.has(getLogKey(log)))
        return [...newLogs, ...newNginxLogs, ...newEnvoyLogs, ...prev]
      })
      setIsPaginationLoading(false)
    }
  }, [isFetched, logs, nginxLogs, envoyLogs, resetCounter])

  useEffect(() => {
    if (isFetched && isPaginationLoading) {
      if (logs.length === 0 && nginxLogs.length === 0 && envoyLogs.length === 0) {
        setHasMoreLogs(false)
        setIsPaginationLoading(false)
        return
      }

      if (logs.length > 0 || nginxLogs.length > 0 || envoyLogs.length > 0) {
        const existingKeys = new Set(accumulatedLogs.map(getLogKey))
        const hasNewAppLogs = logs.some((log) => !existingKeys.has(getLogKey(log)))
        const hasNewNginxLogs = nginxLogs.some((log) => !existingKeys.has(getLogKey(log)))
        const hasNewEnvoyLogs = envoyLogs.some((log) => !existingKeys.has(getLogKey(log)))

        if (!hasNewAppLogs && !hasNewNginxLogs && !hasNewEnvoyLogs) {
          setHasMoreLogs(false)
          setIsPaginationLoading(false)
        }
      }
    }
  }, [isFetched, logs, nginxLogs, envoyLogs, accumulatedLogs, isPaginationLoading])

  const refetch = useCallback(() => {
    refetchLogs()
    if (queryParams.nginx) {
      refetchNginxLogs()
    }
    if (queryParams.envoy) {
      refetchEnvoyLogs()
    }
  }, [refetchLogs, refetchNginxLogs, refetchEnvoyLogs, queryParams.nginx, queryParams.envoy])

  const loadPreviousLogs = useCallback(async () => {
    if (accumulatedLogs.length === 0 || !hasMoreLogs || isPaginationLoading) return

    setIsPaginationLoading(true)

    try {
      const uniqueTimestamps = Array.from(new Set(accumulatedLogs.map((log) => getLogTimestampNs(log)))).sort(
        compareTimestamps
      )

      if (uniqueTimestamps.length === 0) {
        setIsPaginationLoading(false)
        return
      }

      const oldestTimestamp = uniqueTimestamps[0]
      // Step back one nanosecond so we fetch strictly older logs without missing same-ms entries.
      const newEndTimestampNs = oldestTimestamp > ZERO_NS ? oldestTimestamp - ONE_NS : ZERO_NS

      setCurrentEndTimestampNs(newEndTimestampNs.toString())

      setTimeout(() => {
        refetch()
      }, 100)
    } catch (error) {
      setIsPaginationLoading(false)
    }
  }, [accumulatedLogs, hasMoreLogs, isPaginationLoading, refetch])

  const normalizedLogs = useMemo(() => {
    const uniqLogsByTimestamp = Array.from(new Map(accumulatedLogs.map((log) => [getLogKey(log), log])).values())
    return uniqLogsByTimestamp
      .sort((a, b) => compareTimestamps(getLogTimestampNs(a), getLogTimestampNs(b)))
      .map(normalizeServiceLog)
  }, [accumulatedLogs])

  useEffect(() => {
    setCurrentEndTimestampNs(endTimestampNsFromParams ?? null)
    setHasMoreLogs(true)
    setAccumulatedLogs([])
    setIsPaginationLoading(false)
    setResetCounter((prev) => prev + 1)

    queryClient.invalidateQueries({
      queryKey: queries.serviceLogs.serviceLogs._def,
    })
  }, [clusterId, serviceId, startDate, endDate, filters, queryClient, endTimestampNsFromParams])

  useEffect(() => {
    if (isFetched && logs.length > 0 && accumulatedLogs.length === logs.length) {
      setHasMoreLogs(logs.length === LOGS_PER_BATCH)
    }
  }, [isFetched, logs.length, accumulatedLogs.length])

  const isLoading = useMemo(
    () => isLoadingLogs || isNginxLoading || isEnvoyLoading || isPaginationLoading,
    [isLoadingLogs, isNginxLoading, isEnvoyLoading, isPaginationLoading]
  )

  return {
    data: normalizedLogs,
    refetch,
    isFetched,
    isLoading,
    loadPreviousLogs,
    hasMoreLogs,
  }
}

export default useServiceHistoryLogs
