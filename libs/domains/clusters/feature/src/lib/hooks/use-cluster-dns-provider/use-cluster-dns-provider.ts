import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterDnsProviderProps {
  clusterId: string
  enabled?: boolean
}

export function useClusterDnsProvider({ clusterId, enabled = true }: UseClusterDnsProviderProps) {
  return useQuery({
    ...queries.clusters.dnsProvider({ clusterId }),
    enabled: enabled && Boolean(clusterId),
  })
}
