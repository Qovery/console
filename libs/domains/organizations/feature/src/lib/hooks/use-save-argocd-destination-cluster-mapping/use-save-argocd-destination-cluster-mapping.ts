import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useSaveArgoCdDestinationClusterMapping() {
  const queryClient = useQueryClient()

  return useMutation(mutations.saveArgoCdDestinationClusterMapping, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.argoCdDestinationClusterMappings({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'The ArgoCD cluster mapping has been saved',
      },
      notifyOnError: true,
    },
  })
}

export default useSaveArgoCdDestinationClusterMapping
