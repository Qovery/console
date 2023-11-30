import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/service-helm/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateHelmService() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createHelmService, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.list(environmentId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your Helm service has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateHelmService
