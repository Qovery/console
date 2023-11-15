import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/organizations/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditBillingInfo() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editBillingInfo, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.organizations.billingInfo({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Credit code added',
      },
      notifyOnError: true,
    },
  })
}

export default useEditBillingInfo
