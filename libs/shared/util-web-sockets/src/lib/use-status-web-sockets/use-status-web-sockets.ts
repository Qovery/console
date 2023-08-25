import { type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { type RunningState } from '@qovery/shared/enums'
import { type ServiceRunningStatus } from '@qovery/shared/interfaces'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { queries } from '@qovery/state/util-queries'

interface WSDeploymentStatus {
  environment: EnvironmentStatus
  stages: {
    applications: Status[]
    containers: Status[]
    databases: Status[]
    jobs: Status[]
  }[]
}

interface WSServiceStatus {
  environments: {
    id: string
    state: RunningState
    applications: ServiceRunningStatus[]
    containers: ServiceRunningStatus[]
    databases: ServiceRunningStatus[]
    jobs: ServiceRunningStatus[]
  }[]
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
  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      environment: environmentId,
      cluster: clusterId,
      project: projectId,
      version: versionId,
    },
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId) && Boolean(environmentId),
    onMessage(queryClient, message: WSDeploymentStatus) {
      const environmentId = message.environment.id
      queryClient.setQueryData(queries.environments.deploymentStatus(environmentId).queryKey, () => message.environment)
      for (const stage of message.stages ?? []) {
        const services = [...stage.applications, ...stage.containers, ...stage.databases, ...stage.jobs]
        for (const serviceDeploymentStatus of services) {
          queryClient.setQueryData(
            queries.services.deploymentStatus(environmentId, serviceDeploymentStatus.id).queryKey,
            () => serviceDeploymentStatus
          )
        }
      }
    },
  })

  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/service/status',
    urlSearchParams: {
      organization: organizationId,
      environment: environmentId,
      cluster: clusterId,
      project: projectId,
    },
    enabled: Boolean(organizationId) && Boolean(clusterId),
    onMessage(queryClient, message: WSServiceStatus) {
      for (const env of message.environments) {
        queryClient.setQueryData(queries.environments.runningStatus(env.id).queryKey, () => ({
          state: env.state,
        }))
        const services = [...env.applications, ...env.containers, ...env.databases, ...env.jobs]
        for (const serviceRunningStatus of services) {
          queryClient.setQueryData(
            queries.services.runningStatus(env.id, serviceRunningStatus.id).queryKey,
            () => serviceRunningStatus
          )
        }
      }
    },
  })
}

export default useStatusWebSockets
