import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useMoveDeploymentStage() {
  const queryClient = useQueryClient()
  return useMutation(mutations.moveDeploymentStage, {
    onSuccess(data) {
      const environmentIds = [...new Set((data ?? []).map(({ environment: { id } }) => id))]
      for (const environmentId of environmentIds) {
        queryClient.invalidateQueries({
          queryKey: queries.environments.listDeploymentStages({ environmentId }).queryKey,
        })
      }
      if (environmentIds.length === 0) {
        queryClient.invalidateQueries({
          queryKey: queries.environments.listDeploymentStages._def,
        })
      }
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your stage order has been successfully updated',
      },
      notifyOnError: true,
    },
  })
}

export default useMoveDeploymentStage
