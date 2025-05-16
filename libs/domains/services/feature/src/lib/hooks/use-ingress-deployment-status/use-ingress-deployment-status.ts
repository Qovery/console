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
      serviceType,
      serviceId,
    }),
    enabled: match(serviceType)
      .with('APPLICATION', 'CONTAINER', 'HELM', () => true)
      .otherwise(() => false), // TODO check if serviceType is valid and defined
    // TODO: handle errors (404 no deployment, etc...)
  })
}

export default useIngressDeploymentStatus
