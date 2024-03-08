import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStopEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

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
      notifyOnSuccess: {
        title: 'Your environment is being stopped',
      },
      notifyOnError: true,
    },
  })
}

export default useStopEnvironment
