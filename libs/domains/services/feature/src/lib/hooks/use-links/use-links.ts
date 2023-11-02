import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseLinksProps {
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'>
}

export function useLinks({ serviceId, serviceType }: UseLinksProps) {
  return useQuery({
    ...queries.services.listLinks({ serviceId, serviceType }),
  })
}

export default useLinks
