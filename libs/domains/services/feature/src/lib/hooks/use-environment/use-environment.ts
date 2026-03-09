import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentProps {
  environmentId: string
}

/**
 * This is a simplified version of useEnvironment of `@qovery/domains/environments/feature`
 * Separation of concerns between domains (services and environment) prevent us from reusing
 * the one from `environments` domain.
 * This is not a big deal as query is factorize in data-access
 * */
export function useEnvironment({ environmentId }: UseEnvironmentProps) {
  return useQuery({
    ...queries.environments.details({ environmentId: environmentId }),
    enabled: Boolean(environmentId),
  })
}
