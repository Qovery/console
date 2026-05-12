import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

type LinkServiceType = Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>

function isLinkServiceType(serviceType?: ServiceType): serviceType is LinkServiceType {
  return serviceType === 'APPLICATION' || serviceType === 'CONTAINER' || serviceType === 'HELM'
}

export interface UseLinksProps {
  serviceId: string
  serviceType?: ServiceType
  suspense?: boolean
}

export function useLinks({ serviceId, serviceType, suspense = false }: UseLinksProps) {
  const enabled = isLinkServiceType(serviceType)

  return useQuery({
    ...queries.services.listLinks({
      serviceId,
      serviceType: enabled ? serviceType : 'APPLICATION',
    }),
    enabled,
    staleTime: 0,
    suspense,
  })
}

export default useLinks
