import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseArgoCdCredentialsProps {
  clusterId: string
  enabled?: boolean
  suspense?: boolean
}

export function useArgoCdCredentials({ clusterId, enabled, suspense = false }: UseArgoCdCredentialsProps) {
  return useQuery({
    ...queries.clusters.argoCdCredentials({ clusterId }),
    enabled,
    suspense,
  })
}

export default useArgoCdCredentials
