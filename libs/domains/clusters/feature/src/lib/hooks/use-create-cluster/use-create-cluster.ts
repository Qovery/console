import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { showMcpSuggestionToast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useCreateCluster() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCluster, {
    onSuccess(data, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.list({ organizationId }).queryKey,
      })
      showMcpSuggestionToast({ type: 'cluster', name: data.name })
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
