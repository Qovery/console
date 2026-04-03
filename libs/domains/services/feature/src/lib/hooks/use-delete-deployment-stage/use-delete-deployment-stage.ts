import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export interface UseDeleteDeploymentStageProps {
  environmentId: string
}

export function useDeleteDeploymentStage({ environmentId }: UseDeleteDeploymentStageProps) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteDeploymentStage, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listDeploymentStages({ environmentId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your stage has been successfully updated',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteDeploymentStage
