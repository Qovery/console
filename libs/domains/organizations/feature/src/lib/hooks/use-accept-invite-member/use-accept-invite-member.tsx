import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useAcceptInviteMember() {
  const queryClient = useQueryClient()

  return useMutation(mutations.acceptInviteMember, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.inviteMembers({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Invitation accepted',
      },
      notifyOnError: true,
    },
  })
}

export default useAcceptInviteMember
