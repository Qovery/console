import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseLinksProps {
  serviceId: string
  serviceType?: ServiceType
}

export function useLinks({ serviceId, serviceType }: UseLinksProps) {
  return useQuery({
    ...queries.services.listLinks({
      serviceId,
      serviceType: serviceType as Extract<ServiceType, 'APPLICATION' | 'CONTAINER' | 'HELM'>,
    }),
    enabled: match(serviceType)
      .with('APPLICATION', 'CONTAINER', 'HELM', () => true)
      .otherwise(() => false),
  })
}

export default useLinks
