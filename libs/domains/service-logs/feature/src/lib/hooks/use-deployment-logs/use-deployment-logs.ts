import { type QueryClient } from '@tanstack/react-query'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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
  versionId?: string
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
  versionId,
}: UseDeploymentLogsProps) {
  const { hash } = useLocation()
  const { data: deploymentHistory = [] } = useDeploymentHistory({ environmentId: environmentId ?? '' })
  const { data: environment } = useEnvironment({ environmentId })

  // States for controlling log actions, showing new, previous or paused logs
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)
  const [debounceTime, setDebounceTime] = useState(1000)

  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [messageChunks, setMessageChunks] = useState<EnvironmentLogs[][]>([])

  const { stageId } = useContext(ServiceStageIdsContext)
  const now = useMemo(() => Date.now(), [])

  const messageHandler = useCallback(
    (_: QueryClient, message: EnvironmentLogs[]) => {
      setNewMessagesAvailable(true)
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
  const isLatestVersion = deploymentHistory[0]?.identifier.execution_id === versionId

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: isLatestVersion ? undefined : versionId,
    },
    enabled:
      Boolean(organizationId) && Boolean(environment?.cluster_id) && Boolean(projectId) && Boolean(environmentId),
    onMessage: messageHandler,
  })

  useEffect(() => {
    if (messageChunks.length === 0 || pauseLogs) return

    const timerId = setTimeout(() => {
      if (!pauseLogs) {
        setMessageChunks((prevChunks) => prevChunks.slice(1))
        setLogs((prevLogs) => {
          const combinedLogs = [...prevLogs, ...messageChunks[0]]
          return [...new Map(combinedLogs.map((item) => [item['timestamp'], item])).values()]
        })

        if (!hash && logs.length > 1000) {
          setDebounceTime(100)
        }
      }
    }, debounceTime)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageChunks, pauseLogs, hash])

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
    setNewMessagesAvailable,
    newMessagesAvailable,
    pauseLogs,
    setPauseLogs,
    showPreviousLogs,
    setShowPreviousLogs,
  }
}

export default useDeploymentLogs
