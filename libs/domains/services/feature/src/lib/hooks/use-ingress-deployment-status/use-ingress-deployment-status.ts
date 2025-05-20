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
    // TODO: handle errors (404 no deployment, etc...)
  })
}

export default useIngressDeploymentStatus
