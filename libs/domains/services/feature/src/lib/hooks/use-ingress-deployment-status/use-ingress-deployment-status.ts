import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'
import { queries } from '@qovery/state/util-queries'

export interface UseIngressDeploymentStatusProps {
  serviceId: string
  serviceType: ServiceType
}

export function useIngressDeploymentStatus({ serviceId, serviceType }: UseIngressDeploymentStatusProps) {
  return useQuery({
    ...queries.services.ingressDeploymentStatus({
      serviceType: serviceType as Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>,
      serviceId,
    }),
    enabled: match(serviceType)
      .with('APPLICATION', 'CONTAINER', 'HELM', () => true)
      .otherwise(() => false),
    retry: false, // If we get an error, we don't want to retry as it will very likely fail again and just increase the loading time of the "domains" settings page
    staleTime: 0,
  })
}

export default useIngressDeploymentStatus
