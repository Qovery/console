import { DeploymentStageWithServicesStatuses, EnvironmentLogs, Status } from 'qovery-typescript-axios'
import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationById } from '@qovery/domains/application'
import { selectDatabaseById } from '@qovery/domains/database'
import { ApplicationEntity, DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/utils'
import { RootState } from '@qovery/state/store'
import DeploymentLogs from '../../ui/deployment-logs/deployment-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'

export interface DeploymentLogsFeatureProps {
  logs: EnvironmentLogs[]
  pauseStatusLogs: boolean
  loadingStatus: LoadingStatus
  setPauseStatusLogs: (pause: boolean) => void
  statusStages?: DeploymentStageWithServicesStatuses[]
}

export function getServiceStatuesById(services?: DeploymentStageWithServicesStatuses[], serviceId = '') {
  if (services) {
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
  }
  return null
}

export function DeploymentLogsFeature(props: DeploymentLogsFeatureProps) {
  const { logs, loadingStatus, pauseStatusLogs, setPauseStatusLogs, statusStages } = props
  const { serviceId = '' } = useParams()
  const { stageId, updateServiceId } = useContext(ServiceStageIdsContext)

  const application = useSelector<RootState, ApplicationEntity | undefined>((state) =>
    selectApplicationById(state, serviceId)
  )
  const database = useSelector<RootState, DatabaseEntity | undefined>((state) => selectDatabaseById(state, serviceId))

  useDocumentTitle(
    `Deployment logs ${loadingStatus === 'loaded' ? `- ${application?.name || database?.name}` : '- Loading...'}`
  )

  const hideDeploymentLogsBoolean = !(getServiceStatuesById(statusStages, serviceId) as Status)?.is_part_last_deployment

  // reset deployment logs by serviceId
  useEffect(() => {
    updateServiceId(serviceId)
  }, [updateServiceId, serviceId])

  // deployment logs by serviceId and stageId
  // display when name is delete or stageId is empty
  const logsByServiceId = logs.filter(
    (currentData: EnvironmentLogs) =>
      (currentData.details.stage?.id === stageId ||
        !currentData.details.stage?.id ||
        currentData.details.stage.name === 'delete') &&
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
      serviceDeploymentStatus={(getServiceStatuesById(statusStages, serviceId) as Status)?.service_deployment_status}
      hideDeploymentLogs={hideDeploymentLogsBoolean}
    />
  )
}

export default DeploymentLogsFeature
