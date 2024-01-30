import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditCustomRole() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editCustomRole, {
    onSuccess(_, { organizationId, customRoleId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.customRole({ organizationId, customRoleId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.organizations.availableRoles({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your custom role is edited',
      },
      notifyOnError: true,
    },
  })
}

export default useEditCustomRole
