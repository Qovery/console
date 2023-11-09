import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { type ServiceType } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseCommitsProps {
  serviceId: string
  serviceType?: ServiceType
}

export function useCommits({ serviceId, serviceType }: UseCommitsProps) {
  return useQuery({
    ...queries.services.listCommits({
      serviceId,
      serviceType: serviceType as Extract<ServiceType, 'APPLICATION' | 'JOB' | 'CRON_JOB' | 'LIFECYCLE_JOB' | 'HELM'>,
    }),
    enabled: match(serviceType)
      .with('APPLICATION', 'JOB', 'CRON_JOB', 'LIFECYCLE_JOB', 'HELM', () => true)
      .otherwise(() => false),
  })
}

export default useCommits
