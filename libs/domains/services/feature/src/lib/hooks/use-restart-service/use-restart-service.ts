import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { mutations } from '@qovery/domains/services/data-access'
import { ENVIRONMENT_LOGS_URL, ENVIRONMENT_STAGES_URL } from '@qovery/shared/routes'
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
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments',
              params: {
                organizationId,
                projectId,
                environmentId,
                serviceId: data.id,
              },
            }),
          'See deployment queue'
        )
      } else {
        // XXX: Waiting for the fix of https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1434
        // to implement the correct deployment redirection using `execution_id`
        toast(
          'SUCCESS',
          'Your service is restarting',
          undefined,
          () =>
            navigate({
              // TODO new-nav: This should redirect to the deployment details page that we don't have yet (should redirect to '/stages' aka pipeline view, but without the executionId)
              to: ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + ENVIRONMENT_STAGES_URL(),
            }),
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
