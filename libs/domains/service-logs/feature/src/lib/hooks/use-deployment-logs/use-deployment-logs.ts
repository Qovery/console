import { type QueryClient } from '@tanstack/react-query'
import { useLocation } from '@tanstack/react-router'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ServiceStageIdsContext } from '../../service-stage-ids-context/service-stage-ids-context'
import { useDeploymentHistory } from '../use-deployment-history/use-deployment-history'

export interface UseDeploymentLogsProps {
  organizationId?: string
  projectId?: string
  environmentId?: string
  serviceId?: string
  executionId?: string
}

export interface EnvironmentLogIds extends EnvironmentLogs {
  // Needed for row UI indicator
  id: number
}

const CHUNK_SIZE = 500

// This hook simplifies the process of fetching and managing deployment logs data
export function useDeploymentLogs({
  organizationId,
  projectId,
  environmentId,
  serviceId,
  executionId,
}: UseDeploymentLogsProps) {
  const { hash } = useLocation()
  const { data: deploymentHistory = [] } = useDeploymentHistory({ environmentId: environmentId ?? '', suspense: true })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  // States for controlling log actions, showing new, previous or paused logs
  const [bufferedLogsCount, setBufferedLogsCount] = useState(0)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [isScrollPaused, setIsScrollPaused] = useState(false)
  const isScrollPausedRef = useRef(false)
  const [debounceTime, setDebounceTime] = useState(1000)

  const setPauseLogs = useCallback((paused: boolean | ((prev: boolean) => boolean)) => {
    setIsScrollPaused((prev) => {
      const next = typeof paused === 'function' ? paused(prev) : paused
      isScrollPausedRef.current = next
      if (!next) setBufferedLogsCount(0)
      return next
    })
  }, [])

  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [messageChunks, setMessageChunks] = useState<EnvironmentLogs[][]>([])

  const { stageId } = useContext(ServiceStageIdsContext)
  const now = useMemo(() => Date.now(), [])

  const messageHandler = useCallback(
    (_: QueryClient, message: EnvironmentLogs[]) => {
      if (isScrollPausedRef.current) setBufferedLogsCount((c) => c + message.length)
      setMessageChunks((prevChunks) => {
        const lastChunk = prevChunks[prevChunks.length - 1] || []
        if (lastChunk.length < CHUNK_SIZE) {
          return [...prevChunks.slice(0, -1), [...lastChunk, ...message]]
        } else {
          return [...prevChunks, [...message]]
        }
      })
    },
    [setMessageChunks]
  )

  // XXX: If we don't have a version, it works like WS otherwise, it works like a REST API
  const isLatestVersion = deploymentHistory[0]?.identifier.execution_id === executionId

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: isLatestVersion ? undefined : executionId,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  // If there are no logs, set the flush delay to 0, otherwise use the debounce time
  const flushDelay = logs.length === 0 ? 0 : debounceTime

  useEffect(() => {
    if (messageChunks.length === 0) return

    const timerId = setTimeout(() => {
      setMessageChunks((prevChunks) => prevChunks.slice(1))
      setLogs((prevLogs) => {
        const combinedLogs = [...prevLogs, ...messageChunks[0]]

        if (!hash && combinedLogs.length > 1000) {
          setDebounceTime(100)
        }

        return [...new Map(combinedLogs.map((item) => [item['timestamp'], item])).values()]
      })
    }, flushDelay)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageChunks, hash, flushDelay])

  // Filter deployment logs by serviceId and stageId
  // Display entries when the name is "delete" or stageId is empty or equal with current stageId
  // Filter by the same transmitter ID and "Environment" or "TaskManager" type
  const logsByServiceId = useMemo(
    () =>
      logs
        .filter((currentData: EnvironmentLogs) => {
          const { stage, transmitter } = currentData.details
          const isDeleteStage = stage?.name === 'delete'
          const isEmptyOrEqualStageId = !stage?.id || stage?.id === stageId

          const isMatchingTransmitter =
            transmitter?.type === 'Environment' || transmitter?.type === 'TaskManager' || transmitter?.id === serviceId

          // Include the entry if any of the following conditions are true:
          // 1. The stage name is "delete".
          // 2. stageId is empty or equal with current stageId.
          // 3. The transmitter matches serviceId or has a type of "Environment" or "TaskManager".
          // 4. Don't have step PreCheck
          return (isDeleteStage || isEmptyOrEqualStageId) && isMatchingTransmitter && stage?.step !== 'PreCheck'
        })
        .map((log, index) => ({ ...log, id: index + 1 }))
        .filter((log, index, array) =>
          showPreviousLogs || index >= array.length - CHUNK_SIZE ? true : +log.timestamp > now
        ) as EnvironmentLogIds[],
    [logs, stageId, serviceId, now, showPreviousLogs]
  )

  return {
    data: logsByServiceId,
    bufferedLogsCount,
    isScrollPaused,
    setPauseLogs,
    showPreviousLogs,
    setShowPreviousLogs,
  }
}

export default useDeploymentLogs
