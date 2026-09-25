import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type EnvironmentStatus } from 'qovery-typescript-axios'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'
import { useNavigateToEnvironmentPipeline } from '../use-navigate-to-environment-pipeline'

export function useStopEnvironment({
  organizationId,
  projectId,
  environmentId,
  notifyOnSuccess = true,
}: {
  organizationId?: string
  projectId: string
  environmentId?: string
  notifyOnSuccess?: boolean
}) {
  const queryClient = useQueryClient()
  const navigateToEnvironmentPipeline = useNavigateToEnvironmentPipeline()

  return useMutation(mutations.stopEnvironment, {
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
      notifyOnSuccess: notifyOnSuccess
        ? (data: unknown) => {
            const { last_deployment_id: deploymentId } = data as EnvironmentStatus
            return {
              title: 'Your environment is being stopped',
              ...(organizationId && environmentId
                ? {
                    labelAction: 'See pipeline',
                    callback: () =>
                      navigateToEnvironmentPipeline({ organizationId, projectId, environmentId, deploymentId }),
                  }
                : {}),
            }
          }
        : false,
      notifyOnError: true,
    },
  })
}

export default useStopEnvironment
