import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentProps {
  environmentId?: string
  suspense?: boolean
}

export function useEnvironment({ environmentId, suspense = false }: UseEnvironmentProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.details({ environmentId: environmentId!! }),
    enabled: Boolean(environmentId),
    suspense,
  })
}

export default useEnvironment
