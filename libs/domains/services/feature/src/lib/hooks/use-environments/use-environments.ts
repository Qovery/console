import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentsProps {
  projectId: string
}

/**
 * This is a simplified version of useEnvironments of `@qovery/domains/environments/feature`
 * Separation of concerns between domains (services and environment) prevent us from reusing
 * the one from `environments` domain.
 * This is not a big deal as query is factorize in data-access
 * */
export function useEnvironments({ projectId }: UseEnvironmentsProps) {
  return useQuery({
    ...queries.environments.list({ projectId }),
    select(environments) {
      environments?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return environments
    },
  })
}
