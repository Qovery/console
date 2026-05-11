import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateDeploymentStage() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createDeploymentStage, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listDeploymentStages({ environmentId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your stage has been successfully created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateDeploymentStage
