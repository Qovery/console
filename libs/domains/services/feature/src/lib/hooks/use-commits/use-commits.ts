import { useQuery } from '@tanstack/react-query'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCommitsProps {
  serviceId: string
  serviceType: Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB'>
}

export function useCommits({ serviceId, serviceType }: UseCommitsProps) {
  return useQuery({
    ...queries.services.listCommits({ serviceId, serviceType }),
  })
}

export default useCommits
