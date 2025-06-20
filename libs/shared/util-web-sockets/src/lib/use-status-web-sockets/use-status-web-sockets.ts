import * as Sentry from '@sentry/react'
import { type EnvironmentStatus, type EnvironmentStatusesWithStages } from 'qovery-typescript-axios'
import { type ServiceStatusDto } from 'qovery-ws-typescript-axios'
import { useEffect, useRef } from 'react'
import { v7 as uuidv7 } from 'uuid'
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
  const firstMessageReceived = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const externalRequestId = uuidv7()

  useEffect(() => {
    return () => {
      // Cleanup if component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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
    shouldReconnect: true,
    onOpen(_, event) {
      timeoutRef.current = setTimeout(() => {
        if (!firstMessageReceived.current) {
          Sentry.captureMessage(`No WS message received from /service/status after 6s - id: ${externalRequestId}`, {
            level: 'error',
            tags: {
              organizationId: organizationId ?? 'unknown',
              environmentId: environmentId ?? 'unknown',
              projectId: projectId ?? 'unknown',
              clusterId,
              externalRequestId,
              event: JSON.stringify(event),
            },
          })
        }
      }, 20_000)
    },
    onMessage(queryClient, message: ServiceStatusDto) {
      if (!firstMessageReceived.current) {
        firstMessageReceived.current = true
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }

      for (const env of message.environments) {
        queryClient.setQueryData(queries.environments.runningStatus(env.id).queryKey, () => ({
          state: env.state,
        }))
        // NOTE: we have to force this reset change because of the way the socket works.
        // You can have information about an application (eg. if it's stopping)
        // But you can also lose the information about this application (eg. it it's stopped it won't appear in the socket result)
        queryClient.resetQueries([...queries.services.runningStatus._def, env.id])
        const services = [...env.applications, ...env.containers, ...env.databases, ...env.jobs, ...env.helms]
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
