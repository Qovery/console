import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations, organizations } from '@qovery/domains/organizations/data-access'

export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation(mutations.changePlan, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: organizations.details({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: organizations.currentCost({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Plan updated successfully',
      },
      notifyOnError: true,
    },
  })
}

export default useChangePlan
