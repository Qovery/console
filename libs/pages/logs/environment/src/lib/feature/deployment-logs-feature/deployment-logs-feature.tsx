import { DeploymentStageWithServicesStatuses, EnvironmentLogs, Status } from 'qovery-typescript-axios'
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
import DeploymentLogs from '../../ui/deployment-logs/deployment-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'

export interface DeploymentLogsFeatureProps {
  clusterId: string
  statusStages?: DeploymentStageWithServicesStatuses[]
}

export function getServiceStatuesById(services: DeploymentStageWithServicesStatuses[], serviceId = '') {
  for (const service of services) {
    if (service.stage?.id === serviceId) {
      return service
    }
    if (service.applications && service.applications?.length > 0) {
      for (const application of service.applications) {
        if (application.id === serviceId) {
          return application
        }
      }
    }
    if (service.jobs && service.jobs?.length > 0) {
      for (const job of service.jobs) {
        if (job.id === serviceId) {
          return job
        }
      }
    }
    if (service.databases && service.databases?.length > 0) {
      for (const database of service.databases) {
        if (database.id === serviceId) {
          return database
        }
      }
    }
    if (service.containers && service.containers?.length > 0) {
      for (const container of service.containers) {
        if (container.id === serviceId) {
          return container
        }
      }
    }
  }
  return null
}

export function DeploymentLogsFeature(props: DeploymentLogsFeatureProps) {
  const { clusterId, statusStages } = props
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()
  const { stageId, updateServiceId } = useContext(ServiceStageIdsContext)

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
    statusStages &&
    !(getServiceStatuesById(statusStages, serviceId) as Status).is_part_last_deployment

  useEffect(() => {
    if (hideDeploymentLogsBoolean) setLoadingStatus('loaded')
  }, [setLoadingStatus, hideDeploymentLogsBoolean])

  // reset deployment logs by serviceId
  useEffect(() => {
    updateServiceId(serviceId)
  }, [updateServiceId, serviceId])

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

  const logsByServiceId = logs.filter(
    (currentData: EnvironmentLogs) =>
      (currentData.details.stage?.id === stageId || !currentData.details.stage?.id) &&
      (currentData.details.transmitter?.type === 'Environment' || currentData.details.transmitter?.id === serviceId)
  )

  const errors = logsByServiceId
    .map((log: EnvironmentLogs, index: number) => ({
      index: index,
      errors: log.error,
    }))
    .filter((log) => log.errors)

  return (
    <DeploymentLogs
      loadingStatus={loadingStatus}
      // filter by same transmitter id and environment type
      logs={logsByServiceId}
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
