import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Status } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'
import { useNavigateToEnvironmentPipeline } from '../use-navigate-to-environment-pipeline'

export function useDeployEnvironment({
  organizationId,
  projectId,
  environmentId,
}: {
  organizationId: string
  projectId: string
  environmentId: string
}) {
  const queryClient = useQueryClient()
  const navigateToEnvironmentPipeline = useNavigateToEnvironmentPipeline()

  return useMutation(mutations.deployEnvironment, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistory({ environmentId }).queryKey,
      })
      // NOTE: Sub-optimal because API doesn't directly provide impacted services but mitigated by short lived deployment history cache
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory._def,
      })
    },
    meta: {
      notifyOnSuccess(data: unknown) {
        const { execution_id: deploymentId } = data as Status
        return {
          title: 'Your environment is redeploying',
          labelAction: 'See pipeline',
          callback: () => navigateToEnvironmentPipeline({ organizationId, projectId, environmentId, deploymentId }),
        }
      },
      notifyOnError: true,
    },
  })
}

export default useDeployEnvironment
