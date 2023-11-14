import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteInviteMember({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteInviteMember, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.inviteMembers({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your invite member is deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteInviteMember
