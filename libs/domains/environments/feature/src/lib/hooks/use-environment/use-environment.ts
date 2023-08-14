import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentDetailProps {
  environmentId?: string
}

export function useEnvironment({ environmentId }: UseEnvironmentDetailProps) {
  return useQuery({
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    ...queries.environments.detail(environmentId!!),
    enabled: Boolean(environmentId),
  })
}

export default useEnvironment
