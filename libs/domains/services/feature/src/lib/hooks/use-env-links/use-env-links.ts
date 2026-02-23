import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseEnvLinksProps {
  environmentId: string
  enabled?: boolean
}

export function useEnvLinks({ environmentId, enabled = true }: UseEnvLinksProps) {
  return useQuery({
    ...queries.environments.listLinks({
      environmentId,
    }),
    enabled,
  })
}
