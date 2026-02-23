import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface useEnvironmentLinksProps {
  environmentId: string
  enabled?: boolean
}

export function useEnvironmentLinks({ environmentId, enabled = true }: useEnvironmentLinksProps) {
  return useQuery({
    ...queries.environments.listLinks({
      environmentId,
    }),
    enabled,
  })
}
