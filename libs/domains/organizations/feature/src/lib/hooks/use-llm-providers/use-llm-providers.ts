import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLlmProvidersProps {
  organizationId: string
  suspense?: boolean
  enabled?: boolean
}

export function useLlmProviders({ organizationId, suspense = false, enabled = true }: UseLlmProvidersProps) {
  return useQuery({
    ...queries.organizations.llmProviders({ organizationId }),
    suspense,
    enabled,
  })
}
