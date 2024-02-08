import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { queries } from '@qovery/state/util-queries'

export function useRestartAllServices() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.restartAllServices, {
    onSuccess(_, { environment, payload }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environment.id).queryKey,
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
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const {
          environment: {
            id: environmentId,
            organization: { id: organizationId },
            project: { id: projectId },
          },
        } = variables as Parameters<typeof mutations.restartAllServices>[0]
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

export default useRestartAllServices
