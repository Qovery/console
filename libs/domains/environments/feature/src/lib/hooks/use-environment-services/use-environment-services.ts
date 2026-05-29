import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvironmentServicesProps {
  environmentId?: string
}

export function useEnvironmentServices({ environmentId }: UseEnvironmentServicesProps) {
  return useQuery({
    ...queries.services.list(environmentId!),
    enabled: Boolean(environmentId),
  })
}

export default useEnvironmentServices
