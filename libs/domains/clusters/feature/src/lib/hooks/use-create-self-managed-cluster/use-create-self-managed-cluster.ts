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
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCreateSelfManagedCluster
