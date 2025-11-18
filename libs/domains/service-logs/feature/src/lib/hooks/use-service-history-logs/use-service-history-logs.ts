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

export function useServiceHistoryLogs({ clusterId, serviceId, enabled = false }: UseServiceHistoryLogsProps) {
  const queryClient = useQueryClient()
  const [queryParams] = useQueryParams(queryParamsServiceLogs)

  const [accumulatedLogs, setAccumulatedLogs] = useState<ServiceLog[]>([])
  const [currentEndDate, setCurrentEndDate] = useState<Date | null>(null)
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

  useEffect(() => {
    if (endDate && !currentEndDate) {
      setCurrentEndDate(endDate)
      setAccumulatedLogs([])
    }
  }, [endDate, currentEndDate])

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
      endDate: currentEndDate ?? undefined,
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
      endDate: currentEndDate ?? undefined,
      filters,
      direction: 'backward',
      limit: LOGS_PER_BATCH,
      isNginx: Boolean(queryParams.nginx) ?? false,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && isHistoryMode && enabled,
  })

  const isFetched = isFetchedLogs || isNginxFetched

  useEffect(() => {
    if (isFetched && (logs.length > 0 || nginxLogs.length > 0)) {
      setAccumulatedLogs((prev) => {
        const existingKeys = new Set(prev.map((log) => `${log.timestamp}|${log.message}`))
        const newLogs = logs.filter((log) => !existingKeys.has(`${log.timestamp}|${log.message}`))
        const newNginxLogs = nginxLogs.filter((log) => !existingKeys.has(`${log.timestamp}|${log.message}`))
        return [...newLogs, ...newNginxLogs, ...prev]
      })
      setIsPaginationLoading(false)
    }
  }, [isFetched, logs, nginxLogs, resetCounter])

  useEffect(() => {
    if (isFetched && isPaginationLoading) {
      if (logs.length === 0 && nginxLogs.length === 0) {
        setHasMoreLogs(false)
        setIsPaginationLoading(false)
        return
      }

      if (logs.length > 0 || nginxLogs.length > 0) {
        const existingKeys = new Set(accumulatedLogs.map((log) => `${log.timestamp}|${log.message}`))
        const hasNewAppLogs = logs.some((log) => !existingKeys.has(`${log.timestamp}|${log.message}`))
        const hasNewNginxLogs = nginxLogs.some((log) => !existingKeys.has(`${log.timestamp}|${log.message}`))

        if (!hasNewAppLogs && !hasNewNginxLogs) {
          setHasMoreLogs(false)
          setIsPaginationLoading(false)
        }
      }
    }
  }, [isFetched, logs, nginxLogs, accumulatedLogs, isPaginationLoading])

  const loadPreviousLogs = useCallback(async () => {
    if (accumulatedLogs.length === 0 || !hasMoreLogs || isPaginationLoading) return

    setIsPaginationLoading(true)

    try {
      const uniqueTimestamps = Array.from(
        new Set(
          accumulatedLogs.map((log) =>
            typeof log.timestamp === 'string' ? parseInt(log.timestamp, 10) : log.timestamp
          )
        )
      ).sort((a, b) => a - b)

      if (uniqueTimestamps.length === 0) {
        setIsPaginationLoading(false)
        return
      }

      const oldestTimestamp = uniqueTimestamps[0]
      const timeOffset = uniqueTimestamps.length === 1 ? 1000 : 1
      const newEndDate = new Date(oldestTimestamp - timeOffset)

      setCurrentEndDate(newEndDate)

      setTimeout(() => {
        refetchLogs()
        if (queryParams.nginx) {
          refetchNginxLogs()
        }
      }, 100)
    } catch (error) {
      setIsPaginationLoading(false)
    }
  }, [accumulatedLogs, hasMoreLogs, isPaginationLoading, refetchLogs, refetchNginxLogs, queryParams.nginx])

  const normalizedLogs = useMemo(() => {
    const uniqLogsByTimestamp = Array.from(
      new Map(accumulatedLogs.map((log) => [`${log.timestamp}|${log.message}`, log])).values()
    )
    return uniqLogsByTimestamp.map(normalizeServiceLog).sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
  }, [accumulatedLogs])

  useEffect(() => {
    setCurrentEndDate(endDate || null)
    setHasMoreLogs(true)
    setAccumulatedLogs([])
    setIsPaginationLoading(false)
    setResetCounter((prev) => prev + 1)

    queryClient.invalidateQueries({
      queryKey: queries.serviceLogs.serviceLogs._def,
    })
  }, [clusterId, serviceId, startDate, endDate, filters, queryClient])

  useEffect(() => {
    if (isFetched && logs.length > 0 && accumulatedLogs.length === logs.length) {
      setHasMoreLogs(logs.length === LOGS_PER_BATCH)
    }
  }, [isFetched, logs.length, accumulatedLogs.length])

  const refetch = useCallback(() => {
    refetchLogs()
    if (queryParams.nginx) {
      refetchNginxLogs()
    }
  }, [refetchLogs, refetchNginxLogs, queryParams.nginx])

  return {
    data: normalizedLogs,
    refetch,
    isFetched,
    isLoading: isLoadingLogs || isNginxLoading || isPaginationLoading,
    loadPreviousLogs,
    hasMoreLogs,
  }
}

export default useServiceHistoryLogs
