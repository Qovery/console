import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mutations } from '@qovery/domains/services/data-access'
import { queries } from '@qovery/state/util-queries'

/**
 * This is a mostly a copy paste from version of useCancelDeploymentEnvironment of `@qovery/domains/environments/feature`
 * Separation of concerns between domains (services and environment) prevent us from reusing
 * the one from `environments` domain.
 * This is a limitation from our current API which do not let us cancel only one service.
 * It probably gonna evolve over time and that's why it's acceptable at the moment.
 **/
export function useCancelDeploymentService({ projectId, logsLink }: { projectId: string; logsLink?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(mutations.cancelDeploymentService, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistory({ environmentId }).queryKey,
      })
      // NOTE: Sub-optimal because API doesn't directly provides impacted services but mitigated by short lived deployment history cache
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory._def,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment deployment is cancelling',
        ...(logsLink
          ? {
              labelAction: 'See Deployment Logs',
              callback: () => navigate(logsLink),
            }
          : {}),
      },
      notifyOnError: true,
    },
  })
}

export default useCancelDeploymentService
