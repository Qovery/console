import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'
import { queries } from '@qovery/state/util-queries'

export interface UseCheckCustomDomainsProps {
  serviceId: string
  serviceType: ServiceType
}

export function useCheckCustomDomains({ serviceId, serviceType }: UseCheckCustomDomainsProps) {
  return useQuery({
    ...queries.services.checkCustomDomains({
      serviceId,
      serviceType: serviceType as Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>,
    }),
    enabled: match(serviceType)
      .with('APPLICATION', 'CONTAINER', 'HELM', () => true)
      .otherwise(() => false),
  })
}

export default useCheckCustomDomains
