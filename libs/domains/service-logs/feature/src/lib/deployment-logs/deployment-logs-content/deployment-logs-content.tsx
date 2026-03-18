import { useNavigate, useParams } from '@tanstack/react-router'
import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentStatus,
  type EnvironmentStatusesWithStagesPreCheckStage,
  type Stage,
  type Status,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { useDeploymentHistory } from '@qovery/domains/environments/feature'
import { useService } from '@qovery/domains/services/feature'
import { Banner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { ListDeploymentLogs } from '../../list-deployment-logs/list-deployment-logs'

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
      if (service.terraforms && service.terraforms?.length > 0) {
        for (const terraforms of service.terraforms) {
          if (terraforms.id === serviceId) {
            return terraforms
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
      'terraforms',
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

export function DeploymentLogsContent({
  environment,
  environmentStatus,
  deploymentStages,
  preCheckStage,
}: DeploymentLogsFeatureProps) {
  const { serviceId = '', executionId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  const { data: service, isFetched: isFetchedService } = useService({
    environmentId: environment.id,
    serviceId,
    suspense: true,
  })
  const { data: environmentDeploymentHistory = [] } = useDeploymentHistory({
    environmentId: environment.id,
    suspense: true,
  })

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
    executionId !== lastDeploymentExecutionId &&
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
          color="brand"
          buttonLabel="See latest"
          buttonIconRight="arrow-right"
          onClickButton={() =>
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId',
              params: {
                organizationId: environment.organization.id,
                projectId: environment.project.id,
                environmentId: environment.id,
                serviceId,
                executionId: lastDeploymentExecutionId,
              },
              replace: true,
            })
          }
        >
          A new deployment has been initiated
        </Banner>
      )}
      <ListDeploymentLogs
        environment={environment}
        serviceStatus={serviceStatus}
        environmentStatus={environmentStatus}
        stage={stageFromServiceId}
        preCheckStage={preCheckStage}
      />
    </>
  )
}

export default DeploymentLogsContent
