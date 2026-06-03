import { useQuery } from '@tanstack/react-query'
import { type EnvironmentRunningStatusScope } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseRunningStatusProps {
  environmentId?: string
  scope?: EnvironmentRunningStatusScope
}

export function useRunningStatus({ environmentId, scope = 'environment' }: UseRunningStatusProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.runningStatus({ environmentId: environmentId!!, scope }),
    enabled: Boolean(environmentId),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })
}

export default useRunningStatus
