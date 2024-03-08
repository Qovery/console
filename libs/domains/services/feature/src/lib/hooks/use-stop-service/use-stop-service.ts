import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStopService({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.stopService, {
    onSuccess(_, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory({ serviceId, serviceType }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is stopping',
      },
      notifyOnError: true,
    },
  })
}

export default useStopService
