import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterProps {
  secretManagerAccessId: string
  enabled?: boolean
  suspense?: boolean
}

export function useSecretManagerAssociatedServices({
  secretManagerAccessId,
  enabled = true,
  suspense = false,
}: UseClusterProps) {
  return useQuery({
    ...queries.clusters.listSecretManagerAssociatedServices({ secretManagerAccessId }),
    enabled: Boolean(secretManagerAccessId) && enabled,
    suspense,
  })
}
