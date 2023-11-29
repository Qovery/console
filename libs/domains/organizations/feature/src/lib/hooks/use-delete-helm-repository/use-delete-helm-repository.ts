import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteHelmRepository() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteHelmRepository, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.helmRepositories({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your helm repository has been deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteHelmRepository
