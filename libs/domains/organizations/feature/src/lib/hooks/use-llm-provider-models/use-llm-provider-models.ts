import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseLlmProviderModelsProps {
  llmProviderId: string
  enabled?: boolean
}

export function useLlmProviderModels({ llmProviderId, enabled = true }: UseLlmProviderModelsProps) {
  return useQuery({
    ...queries.organizations.llmProviderModels({ llmProviderId }),
    enabled: enabled && Boolean(llmProviderId),
  })
}
