import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCancelDeploymentEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.cancelDeploymentEnvironment, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment deployment is cancelling',
      },
      notifyOnError: true,
    },
  })
}

export default useCancelDeploymentEnvironment
