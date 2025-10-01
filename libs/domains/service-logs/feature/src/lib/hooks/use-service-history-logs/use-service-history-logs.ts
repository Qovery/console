import { useQuery } from '@tanstack/react-query'
import { subMinutes } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryParams } from 'use-query-params'
import { type ServiceLog, normalizeServiceLog, serviceLogs } from '@qovery/domains/service-logs/data-access'
import { queryParamsServiceLogs } from '../../list-service-logs/service-logs-context/service-logs-context'

export interface UseServiceHistoryLogsProps {
  clusterId: string
  serviceId: string
  enabled?: boolean
}

const LOGS_PER_BATCH = 200

export function useServiceHistoryLogs({ clusterId, serviceId, enabled = false }: UseServiceHistoryLogsProps) {
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)

  const [accumulatedLogs, setAccumulatedLogs] = useState<ServiceLog[]>([])
  const [currentEndDate, setCurrentEndDate] = useState<Date | null>(null)
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)

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
    }),
    [queryParams.level, queryParams.instance, queryParams.message, queryParams.search, queryParams.version]
  )

  const {
    data: logs = [],
    isFetched: isFetchedLogs,
    isLoading: isLoadingLogs,
  } = useQuery({
    keepPreviousData: true,
    ...serviceLogs.serviceLogs({
      clusterId,
      serviceId,
      startDate,
      endDate: currentEndDate ?? undefined,
      filters,
      direction: 'backward',
      limit: LOGS_PER_BATCH,
    }),
    enabled: Boolean(clusterId) && Boolean(serviceId) && Boolean(currentEndDate) && enabled,
  })

  const {
    data: nginxLogs = [],
    isFetched: isNginxFetched,
    isLoading: isNginxLoading,
  } = useQuery({
    keepPreviousData: true,
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
    enabled: Boolean(clusterId) && Boolean(serviceId) && Boolean(currentEndDate) && enabled,
  })

  const isFetched = isFetchedLogs || isNginxFetched

  // Accumulate logs when new data arrives
  useEffect(() => {
    if (isFetched && logs.length > 0) {
      setAccumulatedLogs((prev) => {
        const existingTimestamps = new Set(prev.map((log) => log.timestamp))
        const newLogs = logs.filter((log) => !existingTimestamps.has(log.timestamp))
        const newNginxLogs = nginxLogs.filter((log) => !existingTimestamps.has(log.timestamp))
        return [...newLogs, ...newNginxLogs, ...prev]
      })
      setIsPaginationLoading(false)
    }
  }, [isFetched, logs, nginxLogs])

  // Check if we have no more logs to load
  useEffect(() => {
    if (isFetched && logs.length === 0 && isPaginationLoading) {
      setHasMoreLogs(false)
      setIsPaginationLoading(false)
    }
  }, [isFetched, logs.length, isPaginationLoading])

  const loadPreviousLogs = useCallback(async () => {
    if (accumulatedLogs.length === 0 || !hasMoreLogs || isPaginationLoading) return
    setIsPaginationLoading(true)

    try {
      const timestampValue = accumulatedLogs[0]?.timestamp
      if (!timestampValue) return

      const timestampNum = typeof timestampValue === 'string' ? parseInt(timestampValue, 10) : timestampValue

      // Use the oldest log timestamp as the new end date (minus 1ms to avoid duplicates)
      const newEndDate = new Date(timestampNum - 1)
      setCurrentEndDate(newEndDate)

      // XXX: This is a workaround to avoid the pagination loading state from being stuck
      setTimeout(() => {
        setIsPaginationLoading(false)
      }, 10000)
    } catch (error) {
      setIsPaginationLoading(false)
      console.error('Error in loadPreviousLogs:', error)
    }
  }, [accumulatedLogs, hasMoreLogs, isPaginationLoading])

  const normalizedLogs = useMemo(() => {
    return accumulatedLogs.map(normalizeServiceLog).sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
  }, [accumulatedLogs])

  // Reset when query params change significantly
  useEffect(() => {
    setCurrentEndDate(endDate || null)
    setHasMoreLogs(true)
    setAccumulatedLogs([])
    setIsPaginationLoading(false)
  }, [clusterId, serviceId, startDate, endDate, queryParams])

  // Set hasMoreLogs appropriately when we first get data
  useEffect(() => {
    if (isFetched && logs.length > 0 && accumulatedLogs.length === logs.length) {
      setHasMoreLogs(logs.length === LOGS_PER_BATCH)
    }
  }, [isFetched, logs.length, accumulatedLogs.length])

  return {
    data: normalizedLogs,
    isFetched,
    isLoading: isLoadingLogs || isNginxLoading || isPaginationLoading,
    loadPreviousLogs,
    hasMoreLogs,
  }
}

export default useServiceHistoryLogs
