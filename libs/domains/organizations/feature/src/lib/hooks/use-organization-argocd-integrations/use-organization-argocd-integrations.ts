import { useQueries } from '@tanstack/react-query'
import { type ArgoCdInstanceMappingResponse, type Cluster } from 'qovery-typescript-axios'
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
  const [clustersQuery, mappingsQuery] = useQueries({
    queries: [
      {
        ...queries.clusters.list({ organizationId }),
        select(clusters: Cluster[] | undefined) {
          return [...(clusters ?? [])].sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
        },
        enabled,
        suspense,
      },
      {
        ...queries.organizations.argoCdDestinationClusterMappings({ organizationId }),
        enabled: enabled && Boolean(organizationId),
        suspense,
      },
    ],
  })

  return {
    data: (mappingsQuery.data ?? []) as ArgoCdInstanceMappingResponse[],
    organizationClusters: (clustersQuery.data ?? []) as Cluster[],
    isLoading: clustersQuery.isLoading || mappingsQuery.isLoading,
  }
}

export default useOrganizationArgoCdIntegrations
