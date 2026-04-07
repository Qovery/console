import {
  type ApplicationStatusDto,
  type DatabaseStatusDto,
  type ServiceStatusDto,
  type TerraformStatusDto,
} from 'qovery-ws-typescript-axios'
import { useCallback, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { queries, useReactQueryWsSubscription } from '@qovery/state/util-queries'

export interface UseClusterServiceRunningStatusSocketProps {
  organizationId: string
  clusterId: string
  projectId: string
}

export function useClusterServiceRunningStatusSocket({
  organizationId,
  clusterId,
  projectId,
}: UseClusterServiceRunningStatusSocketProps) {
  const [externalRequestId] = useState(() => uuidv7())

  const onOpen = useCallback(
    (queryClient: Parameters<NonNullable<Parameters<typeof useReactQueryWsSubscription>[0]['onOpen']>>[0]) => {
      queryClient.setQueryData(queries.environments.checkRunningStatusClosed(clusterId).queryKey, {
        clusterId,
        reason: '',
      })
    },
    [clusterId]
  )

  const onMessage = useCallback(
    (
      queryClient: Parameters<NonNullable<Parameters<typeof useReactQueryWsSubscription>[0]['onMessage']>>[0],
      message: ServiceStatusDto
    ) => {
      queryClient.setQueryData(queries.environments.checkRunningStatusClosed(clusterId).queryKey, {
        clusterId,
        reason: '',
      })

      for (const environment of message.environments) {
        queryClient.setQueryData(queries.environments.runningStatus(environment.id).queryKey, () => ({
          state: environment.state,
        }))

        queryClient.resetQueries([...queries.services.runningStatus._def, environment.id])

        const services: (ApplicationStatusDto | DatabaseStatusDto | TerraformStatusDto)[] = [
          ...environment.applications,
          ...environment.containers,
          ...environment.databases,
          ...environment.jobs,
          ...environment.helms,
          ...environment.terraform,
        ]

        for (const serviceRunningStatus of services) {
          queryClient.setQueryData(
            queries.services.runningStatus(environment.id, serviceRunningStatus.id).queryKey,
            () => serviceRunningStatus
          )
        }
      }
    },
    [clusterId]
  )

  const onClose = useCallback(
    (
      queryClient: Parameters<NonNullable<Parameters<typeof useReactQueryWsSubscription>[0]['onClose']>>[0],
      event: CloseEvent
    ) => {
      const isNotFound = event.reason.includes('NotFound') || event.reason.includes('not found')

      if (isNotFound && clusterId) {
        queryClient.setQueryData(queries.environments.checkRunningStatusClosed(clusterId).queryKey, {
          clusterId,
          reason: event.reason,
        })
      }
    },
    [clusterId]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/status',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      external_request_id: externalRequestId,
    },
    enabled: Boolean(organizationId) && Boolean(clusterId) && Boolean(projectId),
    shouldReconnect: true,
    onOpen,
    onMessage,
    onClose,
  })
}
