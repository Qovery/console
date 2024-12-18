import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { ListDeploymentLogs, SidebarPodStatuses } from '@qovery/domains/service-logs/feature'
import { useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Banner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { MetricsWebSocketListener } from '@qovery/shared/util-web-sockets'

// XXX: Prevent web-socket invalidations when re-rendering
const WebSocketListenerMemo = memo(MetricsWebSocketListener)

export interface DeploymentLogsFeatureProps {
  environment: Environment
  deploymentStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
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

export function getStageFromServiceId(
  deploymentStages: DeploymentStageWithServicesStatuses[],
  serviceId: string
): Stage | undefined {
  for (const deploymentStage of deploymentStages) {
    const serviceTypes: (keyof DeploymentStageWithServicesStatuses)[] = [
      'applications',
      'containers',
      'jobs',
      'databases',
      'helms',
    ]

    for (const serviceType of serviceTypes) {
      const services = deploymentStage[serviceType]
      if (Array.isArray(services) && services.some((service) => service.id === serviceId)) {
        return deploymentStage.stage
      }
    }
  }

  return undefined
}

export function DeploymentLogsFeature({
  environment,
  environmentStatus,
  deploymentStages,
  preCheckStage,
}: DeploymentLogsFeatureProps) {
  const { serviceId = '', versionId } = useParams()
  const navigate = useNavigate()

  const { data: service, isFetched: isFetchedService } = useService({ environmentId: environment.id, serviceId })
  const { data: environmentDeploymentHistory = [] } = useDeploymentHistory({ environmentId: environment.id })

  useDocumentTitle(`Deployment logs - ${service?.name ?? 'Loading...'}`)

  const serviceStatus = getServiceStatusesById(deploymentStages, serviceId) as Status

  if (!serviceStatus && isFetchedService)
    return (
      <div className="flex h-full w-full items-center overflow-y-auto bg-neutral-800 px-1 pt-1">
        <div className="h-full w-full border border-neutral-500 bg-neutral-600"></div>
      </div>
    )

  const stageFromServiceId = getStageFromServiceId(deploymentStages ?? [], serviceId)

  const latestDeployment =
    Array.isArray(environmentDeploymentHistory) && environmentDeploymentHistory.length > 0
      ? environmentDeploymentHistory[0]
      : null

  const lastDeploymentStatus = latestDeployment?.status ?? null
  const lastDeploymentExecutionId = latestDeployment?.identifier?.execution_id ?? ''

  const showBannerNew =
    versionId !== lastDeploymentExecutionId &&
    match(lastDeploymentStatus)
      .with(
        'DEPLOYING',
        'DELETING',
        'RESTARTING',
        'BUILDING',
        'STOP_QUEUED',
        'CANCELING',
        'QUEUED',
        'DELETE_QUEUED',
        'DEPLOYMENT_QUEUED',
        () => true
      )
      .otherwise(() => false)

  return (
    <>
      {showBannerNew && (
        <Banner
          color="purple"
          buttonLabel="See latest"
          buttonIconRight="arrow-right"
          onClickButton={() =>
            navigate(
              ENVIRONMENT_LOGS_URL(environment.organization.id, environment.project.id, environment.id) +
                DEPLOYMENT_LOGS_VERSION_URL(serviceId, lastDeploymentExecutionId)
            )
          }
        >
          A new deployment has been initiated
        </Banner>
      )}
      <div className="h-full w-full bg-neutral-900">
        <SidebarPodStatuses
          organizationId={environment.organization.id}
          projectId={environment.project.id}
          service={service}
        >
          <ListDeploymentLogs
            environment={environment}
            serviceStatus={serviceStatus}
            environmentStatus={environmentStatus}
            stage={stageFromServiceId}
            preCheckStage={preCheckStage}
          />
        </SidebarPodStatuses>
        {service && environment && (
          <WebSocketListenerMemo
            organizationId={environment.organization.id}
            clusterId={environment.cluster_id}
            projectId={environment.project.id}
            environmentId={environment.id}
            serviceId={service.id}
            serviceType={service.serviceType}
          />
        )}
      </div>
    </>
  )
}

export default DeploymentLogsFeature
