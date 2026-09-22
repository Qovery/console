import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteCreditCard({ notifyOnError = true } = {}) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteCreditCard, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.creditCards({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Credit card successfully removed',
      },
      notifyOnError: notifyOnError ? { title: 'Error while removing credit card' } : false,
    },
  })
}

export default useDeleteCreditCard
