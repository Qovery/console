import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useAddCreditCard() {
  const queryClient = useQueryClient()

  return useMutation(mutations.addCreditCard, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.creditCards({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Credit card successfully added',
      },
      notifyOnError: {
        title: 'Error while adding credit card',
      },
    },
  })
}

export default useAddCreditCard
