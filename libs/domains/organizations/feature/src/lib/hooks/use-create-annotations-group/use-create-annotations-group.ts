import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateAnnotationsGroup() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createAnnotationsGroup, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.annotationsGroups({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your annotations group has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateAnnotationsGroup
