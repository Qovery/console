import { useQueryClient } from '@tanstack/react-query'
import { type EnvironmentStatus, type EnvironmentStatusesWithStages } from 'qovery-typescript-axios'
import {
  type ApplicationStatusDto,
  type ArgoCdAppStatusDto,
  type DatabaseStatusDto,
  type ServiceStatusDto,
  type TerraformStatusDto,
} from 'qovery-ws-typescript-axios'
import { useEffect, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { queries } from '@qovery/state/util-queries'

interface WSDeploymentStatus extends EnvironmentStatusesWithStages {
  // WS return results if we didn't set an environmentId
  results?: EnvironmentStatus[]
}

export interface UseDeploymentStatusWebSocketProps {
  organizationId: string
  clusterId: string
  projectId?: string
  environmentId?: string
  versionId?: string
}

export type UseRunningStatusWebSocketProps = Omit<UseDeploymentStatusWebSocketProps, 'versionId'>

export function useDeploymentStatusWebSocket({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  versionId,
}: UseDeploymentStatusWebSocketProps) {
  const wsEnabled = Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId)

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/deployment/status',
    urlSearchParams: {
      organization: organizationId,
      environment: environmentId,
      cluster: clusterId,
      project: projectId,
      version: versionId,
    },
    enabled: wsEnabled,
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
}

export function useRunningStatusWebSocket({
  organizationId,
  clusterId,
  projectId,
  environmentId,
}: UseRunningStatusWebSocketProps) {
  const [externalRequestId] = useState(() => uuidv7())
  const queryClient = useQueryClient()
  const wsEnabled = Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId)

  // NOTE: remove running status cache when the environment is changed to avoid stale data
  // @see https://qovery.atlassian.net/browse/QOV-1886
  useEffect(() => {
    return () => {
      if (environmentId) {
        queryClient.removeQueries({
          queryKey: queries.environments.runningStatus({ environmentId, scope: 'environment' }).queryKey,
          exact: true,
        })
      }
    }
  }, [environmentId, queryClient])

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
    enabled: wsEnabled,
    onMessage(queryClient, message: ServiceStatusDto) {
      for (const env of message.environments) {
        queryClient.setQueryData(
          environmentId
            ? queries.environments.runningStatus({
                environmentId: env.id,
                scope: 'environment',
              }).queryKey
            : queries.environments.runningStatus({
                environmentId: env.id,
                scope: 'project',
                clusterId,
                projectId,
              }).queryKey,
          () => ({
            state: env.state,
          })
        )
        // NOTE: we have to force this reset change because of the way the socket works.
        // You can have information about an service (eg. if it's stopping)
        queryClient.resetQueries([...queries.services.runningStatus._def, env.id])
        const services: (ApplicationStatusDto | ArgoCdAppStatusDto | DatabaseStatusDto | TerraformStatusDto)[] = [
          ...env.applications,
          ...env.containers,
          ...env.databases,
          ...env.jobs,
          ...env.helms,
          ...env.argocd_apps,
          ...env.terraform,
        ]
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
