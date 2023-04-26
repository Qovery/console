import { Log } from 'qovery-typescript-axios'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById } from '@qovery/domains/application'
import { selectDatabaseById } from '@qovery/domains/database'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import PodLogs from '../../ui/pod-logs/pod-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'

export interface PodLogsFeatureProps {
  clusterId: string
}

export function PodLogsFeature(props: PodLogsFeatureProps) {
  const { clusterId } = props
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()
  const { updateServiceId } = useContext(ServiceStageIdsContext)

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('not loaded')
  const [messageChunks, setMessageChunks] = useState<Log[][]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [nginxLogs, setNginxLogs] = useState<Log[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)
  const [enabledNginx, setEnabledNginx] = useState<boolean>(false)
  const chunkSize = 500
  const [debounceTime, setDebounceTime] = useState(1000)

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, serviceId)
  )
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, serviceId))

  useDocumentTitle(`Live logs ${application ? `- ${application?.name || database?.name}` : '- Loading...'}`)

  const { getAccessTokenSilently } = useAuth()

  const applicationLogsUrl: () => Promise<string> = useCallback(async () => {
    const token = await getAccessTokenSilently()
    const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}&service=${serviceId}&bearer_token=${token}`

    return new Promise((resolve) => resolve(url))
  }, [organizationId, clusterId, projectId, environmentId, serviceId, getAccessTokenSilently])

  const nginxLogsUrl: () => Promise<string> = useCallback(async () => {
    const token = await getAccessTokenSilently()
    const url = `wss://ws.qovery.com/infra/logs?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}&service=${serviceId}&infra_component_type=NGINX&bearer_token=${token}`

    return new Promise((resolve) => resolve(url))
  }, [organizationId, clusterId, projectId, environmentId, serviceId, getAccessTokenSilently])

  const onMessageHandler = useCallback((message: MessageEvent) => {
    setMessageChunks((prevChunks) => {
      const lastChunk = prevChunks[prevChunks.length - 1] || []
      if (lastChunk.length < chunkSize) {
        return [...prevChunks.slice(0, -1), [...lastChunk, JSON.parse(message?.data)]]
      } else {
        return [...prevChunks, [JSON.parse(message?.data)]]
      }
    })
  }, [])

  const onNginxMessageHandler = useCallback((message: MessageEvent) => {
    setMessageChunks((prevChunks) => {
      const lastChunk = prevChunks[prevChunks.length - 1] || []
      if (lastChunk.length < chunkSize) {
        return [...prevChunks.slice(0, -1), [...lastChunk, JSON.parse(message?.data)]]
      } else {
        return [...prevChunks, [JSON.parse(message?.data)]]
      }
    })
  }, [])
  useWebSocket(applicationLogsUrl, {
    onMessage: onMessageHandler,
  })

  useWebSocket(
    nginxLogsUrl,
    {
      onMessage: onNginxMessageHandler,
    },
    enabledNginx
  )

  useEffect(() => {
    if (messageChunks.length === 0 || pauseStatusLogs) return
    const timerId = setTimeout(() => {
      setLoadingStatus('loaded')
      if (!pauseStatusLogs) {
        setMessageChunks((prevChunks) => prevChunks.slice(1))
        setLogs((prevLogs) => [...prevLogs, ...messageChunks[0]])

        if (logs.length > 1000) {
          setDebounceTime(100)
        }
      }
    }, debounceTime)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageChunks, pauseStatusLogs])

  // update serviceId
  useEffect(() => {
    updateServiceId(serviceId)
  }, [updateServiceId, serviceId])

  // reset pod logs
  useEffect(() => {
    setLogs([])
    setPauseStatusLogs(false)
    setLoadingStatus('not loaded')
    setNginxLogs([])
    setEnabledNginx && setEnabledNginx(false)
  }, [serviceId, setEnabledNginx])

  const logsSorted =
    enabledNginx && nginxLogs
      ? [...logs, ...nginxLogs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      : logs

  return (
    <PodLogs
      service={application || database}
      loadingStatus={loadingStatus}
      logs={logsSorted as Log[]}
      pauseStatusLogs={pauseStatusLogs}
      setPauseStatusLogs={setPauseStatusLogs}
      enabledNginx={enabledNginx}
      setEnabledNginx={setEnabledNginx}
      countNginx={nginxLogs?.length}
    />
  )
}

export default PodLogsFeature
