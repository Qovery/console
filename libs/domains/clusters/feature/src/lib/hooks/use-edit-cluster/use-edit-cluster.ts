import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditCluster() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editCluster, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.list({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your cluster is being edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditCluster
