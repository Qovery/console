import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditMemberRole() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editMemberRole, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.members({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Member role updated',
        description: 'Target user needs to relog or wait a few minutes to make it work.',
      },
      notifyOnError: true,
    },
  })
}

export default useEditMemberRole
