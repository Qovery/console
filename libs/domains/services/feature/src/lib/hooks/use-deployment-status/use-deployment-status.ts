import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'
import useListStatuses from '../use-list-statuses/use-list-statuses'

export interface UseDeploymentStatusProps {
  environmentId?: string
  serviceId?: string
}

export function useDeploymentStatus({ environmentId, serviceId }: UseDeploymentStatusProps) {
  const webSocketResult = useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.services.deploymentStatus(environmentId!!, serviceId!!),
    enabled: Boolean(environmentId) && Boolean(serviceId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  // NOTE: Deployment status by WS isn't enough because WS can something return no message.
  // We need to fallback on service status, unfortunately we have to play with endpoints to get
  // a service status without knowing its type (eg. application, container ...)
  const { data: environmentStatus, ...rest } = useListStatuses({ environmentId })
  const serviceStatuses = [
    ...(environmentStatus?.applications ?? []),
    ...(environmentStatus?.containers ?? []),
    ...(environmentStatus?.databases ?? []),
    ...(environmentStatus?.jobs ?? []),
  ]
  return webSocketResult.data
    ? webSocketResult
    : {
        data: serviceStatuses.find(({ id }) => id === serviceId),
        ...rest,
      }
}

export default useDeploymentStatus
