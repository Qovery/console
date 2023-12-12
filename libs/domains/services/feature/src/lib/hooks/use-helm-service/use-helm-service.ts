import { useQuery } from '@tanstack/react-query'
import { type Helm } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseHelmServiceProps {
  serviceId?: string
}

export function useHelmService({ serviceId }: UseHelmServiceProps) {
  return useQuery({
    ...queries.services.details({ serviceId: serviceId!, serviceType: 'HELM' }),
    select: (data) => data as Helm,
  })
}

export default useHelmService
