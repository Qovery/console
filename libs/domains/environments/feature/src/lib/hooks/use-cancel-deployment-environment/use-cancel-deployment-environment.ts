import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { type EnvironmentStatus } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'
import { getLatestEnvironmentDeploymentId } from '../get-latest-environment-deployment-id'

export function useCancelDeploymentEnvironment({
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

  return useMutation(mutations.cancelDeploymentEnvironment, {
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
      notifyOnSuccess(data: unknown) {
        const { last_deployment_id: deploymentId } = data as EnvironmentStatus
        return {
          title: 'Your environment deployment is cancelling',
          labelAction: 'See pipeline',
          callback: async () => {
            const resolvedDeploymentId = await getLatestEnvironmentDeploymentId(
              queryClient,
              environmentId,
              deploymentId
            )
            if (!resolvedDeploymentId) return

            navigate({
              to: '/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId',
              params: { organizationId, projectId, environmentId, deploymentId: resolvedDeploymentId },
            })
          },
        }
      },
      notifyOnError: true,
    },
  })
}

export default useCancelDeploymentEnvironment
