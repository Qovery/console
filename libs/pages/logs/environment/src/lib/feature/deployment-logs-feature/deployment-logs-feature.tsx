import equal from 'fast-deep-equal'
import { EnvironmentLogs } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationById } from '@qovery/domains/application'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, DeploymentService, LoadingStatus } from '@qovery/shared/interfaces'
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

  const { refetch, data: environmentDeploymentHistory } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, serviceId),
    equal
  )

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('not loaded')
  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [pauseLogs, setPauseLogs] = useState<EnvironmentLogs[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)

  useDocumentTitle(`Deployment logs ${loadingStatus === 'loaded' ? `- ${application?.name}` : '- Loading...'}`)

  const hideDeploymentLogsBoolean: boolean =
    !environmentDeploymentHistory ||
    !mergeDeploymentServices([environmentDeploymentHistory[0]]).some(
      (service: DeploymentService) => service.id === serviceId
    )

  useEffect(() => {
    if (hideDeploymentLogsBoolean) setLoadingStatus('loaded')
  }, [setLoadingStatus, hideDeploymentLogsBoolean])

  // reset deployment logs by serviceId
  useEffect(() => {
    setLoadingStatus('not loaded')
    setLogs([])
    setServiceId(serviceId)
  }, [setServiceId, serviceId])

  // fetch application deployments because if not currently deployed display a message
  useEffect(() => {
    const fetchEnv = () => refetch()
    !environmentDeploymentHistory && fetchEnv()
    const pullDeployments = setInterval(() => refetch(), 2500)

    return () => clearInterval(pullDeployments)
  }, [environmentDeploymentHistory, refetch, environmentId, projectId])

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

        if (pauseStatusLogs) {
          setPauseLogs((prev: EnvironmentLogs[]) => [...prev, ...JSON.parse(message?.data)])
        } else {
          setLogs((prev: EnvironmentLogs[]) => [...prev, ...pauseLogs, ...JSON.parse(message?.data)])
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
      applicationStatus={application?.status?.state}
      hideDeploymentLogs={hideDeploymentLogsBoolean}
    />
  )
}

export default DeploymentLogsFeature
