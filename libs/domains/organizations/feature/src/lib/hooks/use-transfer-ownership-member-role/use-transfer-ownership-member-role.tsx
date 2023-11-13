import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseTransferOwnershipMemberRoleProps {
  organizationId: string
}

export function useTransferOwnershipMemberRole({ organizationId }: UseTransferOwnershipMemberRoleProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.transferOwnershipMemberRole, {
    onSuccess() {
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
