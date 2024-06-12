import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditLabelsGroup() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editLabelsGroup, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.labelsGroups({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title:
          'Your labels group has been edited. You need to redeploy your services using it for your changes to be applied.',
      },
      notifyOnError: true,
    },
  })
}

export default useEditLabelsGroup
