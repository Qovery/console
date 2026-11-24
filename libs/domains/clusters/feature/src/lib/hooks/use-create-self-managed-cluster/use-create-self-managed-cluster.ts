import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateSelfManagedCluster() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createSelfManagedCluster, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.list({ organizationId }).queryKey,
      })
    },
    // The request can hold a registry password: do not keep it in the mutation cache once the flow is closed.
    cacheTime: 0,
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateSelfManagedCluster
