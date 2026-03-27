import equal from 'fast-deep-equal'
import { type EnvironmentStatus, type EnvironmentStatusesWithStages } from 'qovery-typescript-axios'
import {
  type ApplicationStatusDto,
  type DatabaseStatusDto,
  type ServiceActionDetailsDto,
  type ServiceStatusDto,
  type TerraformStatusDto,
} from 'qovery-ws-typescript-axios'
import { v7 as uuidv7 } from 'uuid'
import { type RunningState } from '@qovery/shared/enums'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { queries } from '@qovery/state/util-queries'

interface WSDeploymentStatus extends EnvironmentStatusesWithStages {
  // WS return results if we didn't set an environmentId
  results?: EnvironmentStatus[]
}

export interface UseStatusWebSocketsProps {
  organizationId: string
  clusterId: string
  projectId?: string
  environmentId?: string
  versionId?: string
}

export function useStatusWebSockets({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  versionId,
}: UseStatusWebSocketsProps) {
  const externalRequestId = uuidv7()

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      environment: environmentId,
      cluster: clusterId,
      project: projectId,
      version: versionId,
    },
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId),
    shouldReconnect: true,
    onMessage(queryClient, message: WSDeploymentStatus) {
      if (environmentId) {
        queryClient.setQueryData(
          queries.environments.deploymentStatus(environmentId).queryKey,
          () => message.environment
        )
        queryClient.setQueryData(queries.environments.deploymentStages(environmentId).queryKey, () => message.stages)
        for (const stage of message.stages ?? []) {
          const services = [
            ...(stage.applications ?? []),
            ...(stage.containers ?? []),
            ...(stage.databases ?? []),
            ...(stage.jobs ?? []),
            ...(stage.helms ?? []),
            ...(stage.terraforms ?? []),
          ]
          for (const serviceDeploymentStatus of services) {
            queryClient.setQueryData(
              queries.services.deploymentStatus(environmentId, serviceDeploymentStatus.id).queryKey,
              () => serviceDeploymentStatus
            )
          }
        }
      } else {
        // NOTE: set deploymentStatus data if we didn't have environmentId (organizationId + clusterId + projectId are required)
        for (const environment of message.results ?? []) {
          const environmentId = environment.id
          queryClient.setQueryData(queries.environments.deploymentStatus(environmentId).queryKey, () => environment)
        }
      }
    },
  })

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/status',
    urlSearchParams: {
      organization: organizationId,
      environment: environmentId,
      cluster: clusterId,
      project: projectId,
      external_request_id: externalRequestId,
    },
    // NOTE: projectId is not required by the API but it limits WS messages when cluster handles my environments / services
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId),
    onMessage(queryClient, message: ServiceStatusDto) {
      for (const env of message.environments) {
        // Setting the environment status only if it has changed
        const currentEnvironmentStatus:
          | { state: RunningState; triggered_action: ServiceActionDetailsDto | undefined }
          | undefined = queryClient.getQueryData(queries.environments.runningStatus(env.id).queryKey)
        if (env.state !== currentEnvironmentStatus?.state) {
          queryClient.setQueryData(queries.environments.runningStatus(env.id).queryKey, () => ({
            state: env.state,
          }))
        }

        const services: (ApplicationStatusDto | DatabaseStatusDto | TerraformStatusDto)[] = [
          ...env.applications,
          ...env.containers,
          ...env.databases,
          ...env.jobs,
          ...env.helms,
          ...env.terraform,
        ]
        for (const serviceRunningStatus of services) {
          // Setting the service status only if it has changed
          const currentServiceStatus = queryClient.getQueryData(
            queries.services.runningStatus(env.id, serviceRunningStatus.id).queryKey
          )
          if (!equal(serviceRunningStatus, currentServiceStatus)) {
            queryClient.setQueryData(
              queries.services.runningStatus(env.id, serviceRunningStatus.id).queryKey,
              () => serviceRunningStatus
            )
          }
        }
      }
    },
  })
}

export default useStatusWebSockets
