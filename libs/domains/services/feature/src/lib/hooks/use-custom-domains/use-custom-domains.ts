import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'
import { queries } from '@qovery/state/util-queries'

export interface UseCustomDomainsProps {
  serviceId: string
  serviceType: ServiceType
}

export function useCustomDomains({ serviceId, serviceType }: UseCustomDomainsProps) {
  return useQuery({
    ...queries.services.customDomains({
      serviceId,
      serviceType: serviceType as Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>,
    }),
    select(data) {
      return data?.sort((a, b) => a.domain.localeCompare(b.domain))
    },
    enabled: match(serviceType)
      .with('APPLICATION', 'CONTAINER', 'HELM', () => true)
      .otherwise(() => false),
  })
}

export default useCustomDomains
