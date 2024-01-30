import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useTransferOwnershipMemberRole() {
  const queryClient = useQueryClient()

  return useMutation(mutations.transferOwnershipMemberRole, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.members({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Ownership transferred successfully',
      },
      notifyOnError: true,
    },
  })
}

export default useTransferOwnershipMemberRole
