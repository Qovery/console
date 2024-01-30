import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateCustomRole() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createCustomRole, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.availableRoles({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your custom role is created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateCustomRole
