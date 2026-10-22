import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Member } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteMember, {
    async onSuccess(_, { organizationId, userId }) {
      const queryKey = queries.organizations.members({ organizationId }).queryKey
      // The members list is backed by the Auth0 user search index, which is eventually consistent:
      // refetching right after the deletion still returns the removed member.
      // Remove it from the cache instead of invalidating: the entry stays fresh for staleTime, giving the index
      // time to catch up, and the next mount/focus/reconnect after that reconciles it with the backend.
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData<Member[]>(queryKey, (members) => members?.filter((member) => member.id !== userId))
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
