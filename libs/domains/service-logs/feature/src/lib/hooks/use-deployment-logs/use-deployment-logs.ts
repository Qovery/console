import { type QueryClient } from '@tanstack/react-query'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { ServiceStageIdsContext } from '../../service-stage-ids-context/service-stage-ids-context'

export interface UseDeploymentLogsProps {
  organizationId?: string
  projectId?: string
  environmentId?: string
  serviceId?: string
  versionId?: string
}

export interface EnvironmentLogsId extends EnvironmentLogs {
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
  const navigate = useNavigate()
  const { hash, pathname, search } = useLocation()
  const { data: environment } = useEnvironment({ environmentId })

  // States for controlling log actions, showing new, previous or paused logs
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(false)
  const [pauseLogs, setPauseLogs] = useState(false)
  const [debounceTime, setDebounceTime] = useState(1000)

  const [logs, setLogs] = useState<EnvironmentLogsId[]>([])
  const [messageChunks, setMessageChunks] = useState<EnvironmentLogsId[][]>([])

  const { stageId } = useContext(ServiceStageIdsContext)
  const now = useMemo(() => Date.now(), [])

  const messageHandler = useCallback(
    (_: QueryClient, message: EnvironmentLogs[]) => {
      setNewMessagesAvailable(true)
      setMessageChunks((prevChunks) => {
        const lastChunk = prevChunks[prevChunks.length - 1] || []
        const newChunk = message.map((log, index) => ({ ...log, id: lastChunk.length + index + 1 }))
        if (lastChunk.length < CHUNK_SIZE) {
          return [...prevChunks.slice(0, -1), [...lastChunk, ...newChunk]]
        } else {
          return [...prevChunks, newChunk]
        }
      })
    },
    [setMessageChunks]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: environment?.cluster_id,
      project: projectId,
      environment: environmentId,
      version: versionId,
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

        if (logs.length > 1000) {
          setDebounceTime(100)
        }
      }
    }, debounceTime)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageChunks, pauseLogs])

  // Filter deployment logs by serviceId and stageId
  // Display entries when the name is "delete" or stageId is empty or equal with current stageId
  // Filter by the same transmitter ID and "Environment" or "TaskManager" type
  const logsByServiceId = useMemo(() => {
    return logs
      .filter((currentData: EnvironmentLogsId) => {
        const { stage, transmitter } = currentData.details
        const isDeleteStage = stage?.name === 'delete'
        const isEmptyOrEqualStageId = !stage?.id || stage?.id === stageId
        const isMatchingTransmitter =
          transmitter?.type === 'Environment' || transmitter?.type === 'TaskManager' || transmitter?.id === serviceId

        // Include the entry if any of the following conditions are true:
        // 1. The stage name is "delete".
        // 2. stageId is empty or equal with current stageId.
        // 3. The transmitter matches serviceId and has a type of "Environment" or "TaskManager".
        return (isDeleteStage || isEmptyOrEqualStageId) && isMatchingTransmitter
      })
      .filter((log) => (showPreviousLogs || log.id >= logs.length - CHUNK_SIZE ? true : +log.timestamp > now))
  }, [logs, stageId, serviceId, now, showPreviousLogs])

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
