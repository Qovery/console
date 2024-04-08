import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteAnnotationsGroup() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteAnnotationsGroup, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.annotationsGroups({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your annotations group is deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteAnnotationsGroup
