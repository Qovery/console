import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_URL,
  ENVIRONMENT_LOGS_URL,
  ENVIRONMENT_STAGES_URL,
} from '@qovery/shared/routes'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useUninstallService({
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

  return useMutation(mutations.uninstallService, {
    onSuccess(data, { serviceId, serviceType }) {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory({ serviceId, serviceType }).queryKey,
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
        // XXX: Waiting for the fix of https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1434
        // to implement the correct deployment redirection using `execution_id`
        toast(
          'SUCCESS',
          'Your service is uninstalling',
          undefined,
          () => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL()),
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

export default useUninstallService
