import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteCustomRole() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteCustomRole, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.availableRoles({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your custom role is deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteCustomRole
