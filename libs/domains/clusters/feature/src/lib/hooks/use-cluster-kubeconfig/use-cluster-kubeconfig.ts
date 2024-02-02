import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface UseClusterKubeconfigProps {
  organizationId: string
  clusterId: string
}

export function useClusterKubeconfig({ organizationId, clusterId }: UseClusterKubeconfigProps) {
  return useQuery({
    ...queries.clusters.kubeconfig({ organizationId, clusterId }),
  })
}

export default useClusterKubeconfig
