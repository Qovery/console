import { DatabaseModeEnum, type Log } from 'qovery-typescript-axios'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById } from '@qovery/domains/application'
import { selectDatabaseById } from '@qovery/domains/database'
import { useAuth } from '@qovery/shared/auth'
import { type ApplicationEntity, type DatabaseEntity, type LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type RootState } from '@qovery/state/store'
import _PodLogs from '../../ui/pod-logs/pod-logs'

export interface PodLogsFeatureProps {
  clusterId: string
}

const PodLogs = memo(_PodLogs)

export function PodLogsFeature(props: PodLogsFeatureProps) {
  const { clusterId } = props
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('not loaded')
  const [messageChunks, setMessageChunks] = useState<Log[][]>([])
  const [messageNGINXChunks, setMessageNGINXChunks] = useState<Log[][]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [nginxLogs, setNginxLogs] = useState<Log[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)
  const [enabledNginx, setEnabledNginx] = useState<boolean>(false)
  const chunkSize = 500
  const [debounceTime] = useState(500)
  const logCounter = useRef(0)

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, serviceId)
  )
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, serviceId))

  useDocumentTitle(`Live logs ${application || database ? `- ${application?.name || database?.name}` : '- Loading...'}`)

  const { getAccessTokenSilently } = useAuth()
  const disabledLogs = database?.mode !== DatabaseModeEnum.MANAGED

  const applicationLogsUrl: () => Promise<string> = useCallback(async () => {
    const token = await getAccessTokenSilently()
    const url = `wss://ws.qovery.com/service/logs?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}&service=${serviceId}&bearer_token=${token}`

    return Promise.resolve(url)
  }, [organizationId, clusterId, projectId, environmentId, serviceId, getAccessTokenSilently])

  const nginxLogsUrl: () => Promise<string> = useCallback(async () => {
    const token = await getAccessTokenSilently()
    const url = `wss://ws.qovery.com/infra/logs?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}&service=${serviceId}&infra_component_type=NGINX&bearer_token=${token}`

    return Promise.resolve(url)
  }, [organizationId, clusterId, projectId, environmentId, serviceId, getAccessTokenSilently])

  const onMessageHandler = useCallback((message: MessageEvent) => {
    setMessageChunks((prevChunks) => {
      const lastChunk = prevChunks[prevChunks.length - 1] || []
      if (lastChunk.length < chunkSize) {
        return [...prevChunks.slice(0, -1), [...lastChunk, { ...JSON.parse(message?.data), id: logCounter.current++ }]]
      } else {
        return [...prevChunks, [{ ...JSON.parse(message?.data), id: logCounter.current++ }]]
      }
    })
  }, [])

  const onNginxMessageHandler = useCallback((message: MessageEvent) => {
    setMessageNGINXChunks((prevChunks) => {
      const lastChunk = prevChunks[prevChunks.length - 1] || []
      if (lastChunk.length < chunkSize) {
        return [...prevChunks.slice(0, -1), [...lastChunk, { ...JSON.parse(message?.data), id: logCounter.current++ }]]
      } else {
        return [...prevChunks, [{ ...JSON.parse(message?.data), id: logCounter.current++ }]]
      }
    })
  }, [])
  useWebSocket(
    applicationLogsUrl,
    {
      onMessage: onMessageHandler,
    },
    disabledLogs
  )

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
      }
    }, debounceTime)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageChunks, pauseStatusLogs, debounceTime])

  useEffect(() => {
    if (messageNGINXChunks.length === 0 || pauseStatusLogs) return
    const timerId = setTimeout(() => {
      if (!pauseStatusLogs) {
        setMessageNGINXChunks((prevChunks) => prevChunks.slice(1))
        setNginxLogs((prevLogs) => [...prevLogs, ...messageNGINXChunks[0]])
      }
    }, debounceTime)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageNGINXChunks, pauseStatusLogs, debounceTime])

  // reset pod logs
  useEffect(() => {
    setLogs([])
    setMessageChunks([])
    setPauseStatusLogs(false)
    setLoadingStatus('not loaded')
    setNginxLogs([])
    setMessageNGINXChunks([])
    setEnabledNginx && setEnabledNginx(false)
  }, [serviceId, setEnabledNginx])

  const logsSorted = useMemo<Log[]>(() => {
    return enabledNginx && nginxLogs
      ? [...logs, ...nginxLogs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      : logs
  }, [enabledNginx, nginxLogs, logs])

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
