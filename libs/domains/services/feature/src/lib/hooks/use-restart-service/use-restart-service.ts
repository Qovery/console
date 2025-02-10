import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_URL,
  DEPLOYMENT_LOGS_VERSION_URL,
  ENVIRONMENT_LOGS_URL,
} from '@qovery/shared/routes'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useRestartService({
  organizationId,
  projectId,
  environmentId,
}: {
  organizationId: string
  projectId: string
  environmentId: string
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.restartService, {
    onSuccess(data, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistoryV2({ environmentId }).queryKey,
      })

      if (data.deployment_request_id) {
        toast(
          'SUCCESS',
          'Your service is queuing',
          undefined,
          () =>
            navigate(APPLICATION_URL(organizationId, projectId, environmentId, data.id) + APPLICATION_DEPLOYMENTS_URL),
          undefined,
          'See deployment queue'
        )
      } else {
        toast(
          'SUCCESS',
          'Your service is restarting',
          undefined,
          () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
                DEPLOYMENT_LOGS_VERSION_URL(data.id, data.execution_id)
            ),
          undefined,
          'See deployment logs'
        )
      }
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useRestartService
