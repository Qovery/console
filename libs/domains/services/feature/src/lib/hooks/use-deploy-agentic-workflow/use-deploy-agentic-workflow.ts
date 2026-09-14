import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/services/data-access'
import { toast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useDeployAgenticWorkflow({ environmentId, serviceId }: { environmentId: string; serviceId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deployAgenticWorkflow, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.services.listStatuses(environmentId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.status({ id: serviceId, serviceType: 'AGENTIC_WORKFLOW' }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.services.deploymentHistory({ serviceId, serviceType: 'AGENTIC_WORKFLOW' }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentHistoryV2({ environmentId }).queryKey,
      })

      toast('success', 'Agent task triggered')
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useDeployAgenticWorkflow
