import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type AnyService, mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCloneService() {
  const queryClient = useQueryClient()
  return useMutation(mutations.cloneService, {
    onSuccess: (result) => {
      const clonedService = {
        ...result,
        serviceType: result.service_type,
      } as AnyService

      // Seed the caches eagerly so consumers can read the cloned service immediately
      // after the mutation, then invalidate to reconcile with the latest backend state
      queryClient.setQueryData(
        queries.services.details({ serviceId: result.id, serviceType: clonedService.serviceType }).queryKey,
        clonedService
      )
      queryClient.setQueryData(
        queries.services.list(result.environment.id).queryKey,
        (currentServices: AnyService[] | undefined) => {
          if (!currentServices) {
            return [clonedService]
          }

          return currentServices.some(({ id }) => id === clonedService.id)
            ? currentServices.map((service) => (service.id === clonedService.id ? clonedService : service))
            : [...currentServices, clonedService]
        }
      )
      queryClient.invalidateQueries({
        queryKey: queries.services.list(result.environment.id).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your service is cloned',
      },
      notifyOnError: true,
    },
  })
}

export default useCloneService
