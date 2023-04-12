import { EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById } from '@qovery/domains/application'
import { selectDatabaseById } from '@qovery/domains/database'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, DatabaseEntity, DeploymentService, LoadingStatus } from '@qovery/shared/interfaces'
import { mergeDeploymentServices, useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import DeploymentLogs from '../../ui/deployment-logs/deployment-logs'

export interface DeploymentLogsFeatureProps {
  clusterId: string
  setServiceId: (id: string) => void
}

export function DeploymentLogsFeature(props: DeploymentLogsFeatureProps) {
  const { clusterId, setServiceId } = props
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()

  const { data: environmentDeploymentHistory } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, serviceId)
  )
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, serviceId))

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('not loaded')
  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [pauseLogs, setPauseLogs] = useState<EnvironmentLogs[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)

  useDocumentTitle(
    `Deployment logs ${loadingStatus === 'loaded' ? `- ${application?.name || database?.name}` : '- Loading...'}`
  )

  const hideDeploymentLogsBoolean =
    loadingStatus === 'loaded' &&
    (!environmentDeploymentHistory ||
      !mergeDeploymentServices([environmentDeploymentHistory[0]]).some(
        (service: DeploymentService) => service.id === serviceId
      ))

  useEffect(() => {
    if (hideDeploymentLogsBoolean) setLoadingStatus('loaded')
  }, [setLoadingStatus, hideDeploymentLogsBoolean])

  // reset deployment logs by serviceId
  useEffect(() => {
    setServiceId(serviceId)
  }, [setServiceId, serviceId])

  const { getAccessTokenSilently } = useAuth()

  const deploymentLogsUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/deployment/logs?organization=${organizationId}&cluster=${clusterId}&project=${projectId}&environment=${environmentId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, clusterId, projectId, environmentId, getAccessTokenSilently])

  useWebSocket(
    deploymentLogsUrl,
    {
      onMessage: (message) => {
        setLoadingStatus('loaded')

        const newLog = JSON.parse(message?.data)

        if (pauseStatusLogs) {
          setPauseLogs((prev: EnvironmentLogs[]) => [...prev, ...newLog])
        } else {
          setLogs((prev: EnvironmentLogs[]) => {
            // return unique log by timestamp
            return [...new Map([...prev, ...pauseLogs, ...newLog].map((item) => [item['timestamp'], item])).values()]
          })
          setPauseLogs([])
        }
      },
    },
    !hideDeploymentLogsBoolean
  )

  const errors = logs
    .map((log: EnvironmentLogs, index: number) => ({
      index: index,
      errors: log.error,
    }))
    .filter((log) => log.errors)

  return (
    <DeploymentLogs
      loadingStatus={loadingStatus}
      // filter by same transmitter id and environment type
      logs={logs.filter(
        (currentData: EnvironmentLogs) =>
          currentData.details.transmitter?.type === 'Environment' || currentData.details.transmitter?.id === serviceId
      )}
      errors={errors}
      pauseStatusLogs={pauseStatusLogs}
      setPauseStatusLogs={setPauseStatusLogs}
      serviceRunningStatus={application?.running_status || database?.running_status}
      serviceDeploymentStatus={
        application?.status?.service_deployment_status || database?.status?.service_deployment_status
      }
      hideDeploymentLogs={hideDeploymentLogsBoolean}
    />
  )
}

export default DeploymentLogsFeature
