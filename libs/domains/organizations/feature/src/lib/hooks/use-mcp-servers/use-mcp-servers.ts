import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseMcpServersProps {
  organizationId: string
  suspense?: boolean
  enabled?: boolean
}

export function useMcpServers({ organizationId, suspense = false, enabled = true }: UseMcpServersProps) {
  return useQuery({
    ...queries.organizations.mcpServers({ organizationId }),
    suspense,
    enabled,
  })
}
