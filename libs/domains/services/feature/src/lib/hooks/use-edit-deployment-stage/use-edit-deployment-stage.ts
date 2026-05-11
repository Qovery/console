import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditDeploymentStage() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editDeploymentStage, {
    onSuccess({ environment: { id: environmentId } }) {
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

export default useEditDeploymentStage
