import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteCustomDomain() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteCustomDomain, {
    onSuccess(_, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.customDomains({ serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.listLinks({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your domain is being deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteCustomDomain
