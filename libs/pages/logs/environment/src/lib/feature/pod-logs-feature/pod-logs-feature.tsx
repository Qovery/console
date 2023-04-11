import { Log } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
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

export interface PodLogsFeatureProps {
  setServiceId: (id: string) => void
  clusterId: string
}

export function PodLogsFeature(props: PodLogsFeatureProps) {
  const { clusterId, setServiceId } = props
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('not loaded')
  const [logs, setLogs] = useState<Log[]>([])
  const [pauseLogs, setPauseLogs] = useState<Log[]>([])
  const [nginxLogs, setNginxLogs] = useState<Log[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)
  const [enabledNginx, setEnabledNginx] = useState<boolean>(false)

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

  useWebSocket(applicationLogsUrl, {
    onMessage: (message) => {
      setLoadingStatus('loaded')

      if (pauseStatusLogs) {
        setPauseLogs((prev: Log[]) => [...prev, JSON.parse(message?.data)])
      } else {
        setLogs((prev: Log[]) => [...prev, ...pauseLogs, JSON.parse(message?.data)])
        setPauseLogs([])
      }
    },
  })

  useWebSocket(
    nginxLogsUrl,
    {
      onMessage: (message) => {
        if (pauseStatusLogs) {
          setPauseLogs((prev: Log[]) => [...prev, JSON.parse(message?.data)])
        } else {
          setNginxLogs((prev: Log[]) => [...prev, ...pauseLogs, JSON.parse(message?.data)])
          setPauseLogs([])
        }
      },
    },
    enabledNginx
  )

  // reset pod logs by serviceId
  useEffect(() => {
    setServiceId(serviceId)
    setLogs([])
    setPauseLogs([])
    setPauseStatusLogs(false)
    setLoadingStatus('not loaded')
    setNginxLogs([])
    setEnabledNginx && setEnabledNginx(false)
  }, [setServiceId, serviceId, setEnabledNginx])

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
