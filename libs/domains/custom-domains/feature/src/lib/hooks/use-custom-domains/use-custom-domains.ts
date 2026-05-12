import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

type CustomDomainServiceType = Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>

function isCustomDomainServiceType(serviceType?: ServiceType): serviceType is CustomDomainServiceType {
  return serviceType === 'APPLICATION' || serviceType === 'CONTAINER' || serviceType === 'HELM'
}

export interface UseCustomDomainsProps {
  serviceId: string
  serviceType?: ServiceType
  suspense?: boolean
}

export function useCustomDomains({ serviceId, serviceType, suspense = false }: UseCustomDomainsProps) {
  const enabled = isCustomDomainServiceType(serviceType)

  return useQuery({
    ...queries.services.customDomains({
      serviceId,
      serviceType: enabled ? serviceType : 'APPLICATION',
    }),
    select(data) {
      return data?.sort((a, b) => a.domain.localeCompare(b.domain))
    },
    enabled,
    suspense,
  })
}

export default useCustomDomains
