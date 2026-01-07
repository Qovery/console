import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface Config {
  id: string
  title: string
  created_at: string
  updated_at: string
  organization_id: string
}

export const useAICopilotConfig = ({ organizationId }: { organizationId: string }) => {
  return useQuery({
    ...queries.devopsCopilot.config({ organizationId }),
    enabled: !!organizationId, // Don't fetch until organizationId is available
  })
}
