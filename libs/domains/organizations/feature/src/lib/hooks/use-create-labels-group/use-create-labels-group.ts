import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateLabelsGroup() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createLabelsGroup, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.labelsGroups({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your labels group has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateLabelsGroup
