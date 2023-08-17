import { type EnvironmentStatus, type Status } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type RunningState } from '@qovery/shared/enums'
import { ServiceRunningStatus } from '@qovery/shared/interfaces'
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

export function useStatusWebSockets() {
  const { organizationId = '', projectId = '', environmentId = '', versionId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      environment: environment?.id,
      cluster: environment?.cluster_id,
      project: projectId,
      version: versionId,
    },
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
      environment: environment?.id,
      cluster: environment?.cluster_id,
      project: projectId,
    },
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
