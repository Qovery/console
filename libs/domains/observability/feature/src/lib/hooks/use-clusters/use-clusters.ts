import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClustersProps {
  organizationId: string
  enabled?: boolean
}

export function useClusters({ organizationId, enabled }: UseClustersProps) {
  return useQuery({
    ...queries.clusters.list({ organizationId }),
    select(clusters) {
      clusters?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return clusters
    },
    enabled,
  })
}

export default useClusters
