import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useRestartAllServices() {
  const queryClient = useQueryClient()

  return useMutation(mutations.restartAllServices, {
    onSuccess(_, { environmentId, payload }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      for (const serviceId of payload.applicationIds ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'APPLICATION' }).queryKey,
        })
      }
      for (const serviceId of payload.containerIds ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'CONTAINER' }).queryKey,
        })
      }
      for (const serviceId of payload.databaseIds ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'DATABASE' }).queryKey,
        })
      }
      // TODO : invalidate helm ids
    },
  })
}

export default useRestartAllServices
