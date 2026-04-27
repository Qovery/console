import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useSaveArgoCdCredentials() {
  const queryClient = useQueryClient()

  return useMutation(mutations.saveArgoCdCredentials, {
    onSuccess(_, { clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.argoCdCredentials({ clusterId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your ArgoCD integration has been saved',
      },
      notifyOnError: true,
    },
  })
}

export default useSaveArgoCdCredentials
