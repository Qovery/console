import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/clusters/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteArgoCdCredentials({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteArgoCdCredentials, {
    onSuccess(_, { clusterId }) {
      queryClient.invalidateQueries({
        queryKey: queries.clusters.argoCdCredentials({ clusterId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.argoCdDestinationClusterMappings({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your ArgoCD integration has been deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteArgoCdCredentials
