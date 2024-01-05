import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeployService({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deployService, {
    onSuccess(_, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey,
      })
      // NOTE: This is to invalidate deployed git_commit_id cache
      queryClient.invalidateQueries({
        queryKey: queries.services.details({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is deploying',
      },
      notifyOnError: true,
    },
  })
}

export default useDeployService
