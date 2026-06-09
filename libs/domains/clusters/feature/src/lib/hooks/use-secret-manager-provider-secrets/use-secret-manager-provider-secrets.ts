import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterProps {
  secretManagerAccessId: string
  namePrefix?: string
  enabled?: boolean
  suspense?: boolean
  retry?: boolean | number
}

export function useSecretManagerProviderSecrets({
  secretManagerAccessId,
  namePrefix,
  enabled = true,
  suspense = false,
  retry,
}: UseClusterProps) {
  return useQuery({
    ...queries.clusters.listSecretManagerSecretsFromProvider({ secretManagerAccessId, namePrefix }),
    enabled: Boolean(secretManagerAccessId) && enabled,
    suspense,
    retry,
  })
}
