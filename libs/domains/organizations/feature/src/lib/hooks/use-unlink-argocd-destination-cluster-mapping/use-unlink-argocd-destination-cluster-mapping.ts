import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useUnlinkArgoCdDestinationClusterMapping() {
  const queryClient = useQueryClient()

  return useMutation(mutations.unlinkArgoCdDestinationClusterMapping, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.argoCdDestinationClusterMappings({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'The ArgoCD cluster mapping has been unlinked',
      },
      notifyOnError: true,
    },
  })
}

export default useUnlinkArgoCdDestinationClusterMapping
