import { type EnvironmentStatus, type EnvironmentStatusesWithStages, type Status } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

interface WSDeploymentStatus extends EnvironmentStatusesWithStages {
  results?: EnvironmentStatus[]
}

export interface UseClusterServiceDeploymentStatusSocketProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
}

export function useClusterServiceDeploymentStatusSocket({
  organizationId,
  clusterId,
  projectId,
  environmentId,
}: UseClusterServiceDeploymentStatusSocketProps) {
  const onMessage = useCallback(
    (
      queryClient: Parameters<NonNullable<Parameters<typeof useReactQueryWsSubscription>[0]['onMessage']>>[0],
      message: WSDeploymentStatus
    ) => {
      queryClient.setQueryData(queries.environments.deploymentStatus(environmentId).queryKey, () => message.environment)
      queryClient.setQueryData(queries.environments.deploymentStages(environmentId).queryKey, () => message.stages)

      for (const stage of message.stages ?? []) {
        const services: Status[] = [
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
    },
    [environmentId]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
    },
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId) && Boolean(environmentId),
    shouldReconnect: true,
    onMessage,
  })
}

export default useClusterServiceDeploymentStatusSocket
