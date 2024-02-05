import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClustersProps {
  organizationId: string
}

export function useClusters({ organizationId }: UseClustersProps) {
  return useQuery({
    ...queries.clusters.list({ organizationId }),
    select(clusters) {
      clusters?.sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      return clusters
    },
  })
}

export default useClusters
