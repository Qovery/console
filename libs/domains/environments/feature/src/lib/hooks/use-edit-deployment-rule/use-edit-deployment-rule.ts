import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditDeploymentRule() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editDeploymentRule, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.deploymentRule({ environmentId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment deployment rules is updated',
      },
      notifyOnError: true,
    },
  })
}

export default useEditDeploymentRule
