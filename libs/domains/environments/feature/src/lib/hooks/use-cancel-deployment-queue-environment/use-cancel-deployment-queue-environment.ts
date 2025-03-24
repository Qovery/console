import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useCancelDeploymentQueueEnvironment({ environmentId }: { environmentId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.cancelDeploymentQueueEnvironment, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentQueue({ environmentId }).queryKey,
      })

      toast('SUCCESS', 'Your environment deployment is cancelling')
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCancelDeploymentQueueEnvironment
