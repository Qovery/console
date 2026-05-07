import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

type CustomDomainServiceType = Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>

function isCustomDomainServiceType(serviceType?: ServiceType): serviceType is CustomDomainServiceType {
  return serviceType === 'APPLICATION' || serviceType === 'CONTAINER' || serviceType === 'HELM'
}

export interface UseCheckCustomDomainsProps {
  serviceId: string
  serviceType?: ServiceType
}

export function useCheckCustomDomains({ serviceId, serviceType }: UseCheckCustomDomainsProps) {
  const enabled = isCustomDomainServiceType(serviceType)

  return useQuery({
    ...queries.services.checkCustomDomains({
      serviceId,
      serviceType: enabled ? serviceType : 'APPLICATION',
    }),
    enabled,
  })
}

export default useCheckCustomDomains
