import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

export interface UseOrganizationArgoCdIntegrationsProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useOrganizationArgoCdIntegrations({
  organizationId,
  enabled = true,
  suspense = false,
}: UseOrganizationArgoCdIntegrationsProps) {
  return useQuery({
    ...queries.organizations.argoCdDestinationClusterMappings({ organizationId }),
    enabled: enabled && Boolean(organizationId),
    suspense,
  })
}

export default useOrganizationArgoCdIntegrations
