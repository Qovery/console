import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteMember, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.members({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your member is deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteMember
