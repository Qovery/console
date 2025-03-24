import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useCancelDeploymentQueueService({ serviceId }: { serviceId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.cancelDeploymentQueueService, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentQueue({ serviceId }).queryKey,
      })

      toast('SUCCESS', 'Your service deployment is cancelling')
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useCancelDeploymentQueueService
