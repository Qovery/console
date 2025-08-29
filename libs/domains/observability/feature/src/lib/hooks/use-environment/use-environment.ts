import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentProps {
  environmentId?: string
}

export function useEnvironment({ environmentId }: UseEnvironmentProps) {
  return useQuery({
    ...queries.environments.details({ environmentId: environmentId || '' }),
    enabled: Boolean(environmentId),
  })
}

export default useEnvironment
