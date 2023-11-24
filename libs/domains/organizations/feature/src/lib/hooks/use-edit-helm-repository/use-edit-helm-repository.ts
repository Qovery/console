import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditHelmRepository() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editHelmRepository, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.helmRepositories({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your helm repository has been edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditHelmRepository
