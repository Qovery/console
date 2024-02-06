import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseStopAllServicesProps {
  organizationId: string
  projectId: string
}

export function useStopAllServices() {
  const queryClient = useQueryClient()

  return useMutation(mutations.stopAllServices, {
    onSuccess(_, { environmentId, payload }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      for (const serviceId of payload.application_ids ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'APPLICATION' }).queryKey,
        })
      }
      for (const serviceId of payload.container_ids ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'CONTAINER' }).queryKey,
        })
      }
      for (const serviceId of payload.database_ids ?? []) {
        queryClient.invalidateQueries({
          queryKey: queries.services.details({ serviceId, serviceType: 'DATABASE' }).queryKey,
        })
      }
      for (const serviceId of payload.helm_ids ?? []) {
        if (serviceId) {
          queryClient.invalidateQueries({
            queryKey: queries.services.details({ serviceId, serviceType: 'HELM' }).queryKey,
          })
        }
      }
      for (const serviceId of payload.job_ids ?? []) {
        if (serviceId) {
          queryClient.invalidateQueries({
            queryKey: queries.services.details({ serviceId, serviceType: 'JOB' }).queryKey,
          })
        }
      }
    },
  })
}

export default useStopAllServices
