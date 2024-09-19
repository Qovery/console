import { type DeploymentStageWithServicesStatuses, type Environment, type Status } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { ListDeploymentLogs } from '@qovery/domains/service-logs/feature'
import { useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { LinkLogs } from '../pod-logs-feature/pod-logs-feature'

export interface DeploymentLogsFeatureProps {
  environment: Environment
  statusStages?: DeploymentStageWithServicesStatuses[]
}

export function getServiceStatusesById(services?: DeploymentStageWithServicesStatuses[], serviceId = '') {
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
      if (service.helms && service.helms?.length > 0) {
        for (const helms of service.helms) {
          if (helms.id === serviceId) {
            return helms
          }
        }
      }
    }
  }
  return null
}

export function DeploymentLogsFeature({ environment, statusStages }: DeploymentLogsFeatureProps) {
  const { organizationId = '', projectId = '', serviceId = '' } = useParams()

  const { data: service, isFetched: isFetchedService } = useService({ environmentId: environment.id, serviceId })
  const { data: deploymentHistoryEnvironment = [] } = useDeploymentHistory({ environmentId: environment.id })

  useDocumentTitle(`Deployment logs - ${service?.name ?? 'Loading...'}`)

  const serviceStatus = getServiceStatusesById(statusStages, serviceId) as Status

  if (!serviceStatus && isFetchedService)
    return (
      <div className="flex h-full w-full items-center overflow-y-auto bg-neutral-900 px-1 pt-1">
        <div className="h-full w-full border border-neutral-500 bg-neutral-650"></div>
      </div>
    )

  return (
    <div className="w-full">
      <div className="flex w-full items-center overflow-y-auto bg-neutral-900 px-1 pt-1">
        <LinkLogs
          title="Deployment logs"
          url={ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id) + DEPLOYMENT_LOGS_URL(serviceId)}
          statusChip={false}
        />
        <LinkLogs
          title="Service logs"
          url={ENVIRONMENT_LOGS_URL(organizationId, projectId, environment.id) + SERVICE_LOGS_URL(serviceId)}
          statusChip={match(service)
            .with({ serviceType: 'DATABASE' }, (db) => db.mode === 'CONTAINER')
            .otherwise(() => true)}
        />
      </div>
      <ListDeploymentLogs
        environment={environment}
        deploymentHistoryEnvironment={deploymentHistoryEnvironment}
        serviceStatus={serviceStatus}
      />
    </div>
  )

  // return (
  //   serviceStatus && (
  //     <DeploymentLogs
  //       loadingStatus={loadingStatusDeploymentLogs}
  //       logs={logsByServiceId}
  //       errors={errors}
  //       pauseStatusLogs={pauseStatusLogs}
  //       setPauseStatusLogs={setPauseStatusLogs}
  //       service={service}
  //       serviceStatus={serviceStatus as Status}
  //       hideDeploymentLogs={hideDeploymentLogsBoolean}
  //       dataDeploymentHistory={deploymentHistory}
  //       isDeploymentProgressing={isDeploymentProgressing}
  //       showPreviousLogs={showPreviousLogs}
  //       setShowPreviousLogs={setShowPreviousLogs}
  //       newMessagesAvailable={newMessagesAvailable}
  //       setNewMessagesAvailable={setNewMessagesAvailable}
  //     />
  //   )
  // )
}

export default DeploymentLogsFeature
