import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClustersProps {
  organizationId: string
  enabled?: boolean
  suspense?: boolean
}

export function useClusters({ organizationId, enabled, suspense = false }: UseClustersProps) {
  return useQuery({
    ...queries.clusters.list({ organizationId }),
    select(clusters) {
      clusters?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return clusters
    },
    enabled,
    suspense,
  })
}

export default useClusters
