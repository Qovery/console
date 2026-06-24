import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { showMcpSuggestionToast } from '@qovery/shared/mcp-suggestion/feature'
import { queries } from '@qovery/state/util-queries'

export function useCreateCluster() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCluster, {
    onSuccess(data, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.list({ organizationId }).queryKey,
      })
      showMcpSuggestionToast({ type: 'cluster', name: data.name, clusterType: data.cloud_provider })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your cluster is being created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateCluster
