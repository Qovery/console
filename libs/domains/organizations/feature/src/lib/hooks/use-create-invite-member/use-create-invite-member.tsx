import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateInviteMember({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createInviteMember, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.inviteMembers({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your invite member is created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateInviteMember
