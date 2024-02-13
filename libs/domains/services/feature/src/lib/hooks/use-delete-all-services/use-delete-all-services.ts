import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { queries } from '@qovery/state/util-queries'

export function useDeleteAllServices() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.deleteAllServices, {
    onSuccess(_, { environment, payload }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environment.id).queryKey,
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
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const {
          environment: {
            id: environmentId,
            organization: { id: organizationId },
            project: { id: projectId },
          },
        } = variables as Parameters<typeof mutations.deleteAllServices>[0]
        return {
          title: 'Your services are being updated',
          labelAction: 'See Deployment Logs',
          callback() {
            navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId))
          },
        }
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteAllServices
