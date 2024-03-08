import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeployEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deployEnvironment, {
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
        title: 'Your environment is redeploying',
      },
      notifyOnError: true,
    },
  })
}

export default useDeployEnvironment
