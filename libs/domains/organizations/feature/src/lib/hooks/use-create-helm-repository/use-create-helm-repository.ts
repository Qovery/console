import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateHelmRepository() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createHelmRepository, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.helmRepositories({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your helm repository has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateHelmRepository
