import { useQuery } from '@tanstack/react-query'
import { observability } from '@qovery/domains/observability/data-access'

export interface UseIngressNameProps {
  clusterId: string
  serviceId: string
}

export function useIngressName({ clusterId, serviceId }: UseIngressNameProps) {
  return useQuery({
    ...observability.ingressName({ clusterId, serviceId }),
    enabled: Boolean(clusterId && serviceId),
  })
}

export default useIngressName
