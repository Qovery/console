import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useStopService({
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

  return useMutation(mutations.stopService, {
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
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments',
              params: {
                organizationId,
                projectId,
                environmentId,
                serviceId: data.id,
              },
            }),
          undefined,
          'See deployment queue'
        )
      } else {
        // XXX: Waiting for the fix of https://qovery.atlassian.net/jira/software/projects/FRT/boards/23?selectedIssue=FRT-1434
        // to implement the correct deployment redirection using `execution_id`
        toast(
          'SUCCESS',
          'Your service is stopping',
          undefined,
          () =>
            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId',
              params: {
                organizationId,
                projectId,
                environmentId,
                deploymentId: 'latest',
              },
            }),
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

export default useStopService
