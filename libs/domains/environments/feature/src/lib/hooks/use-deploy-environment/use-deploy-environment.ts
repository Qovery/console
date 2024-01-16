import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeployEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.deployEnvironment, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment is redeploying',
      },
      notifyOnError: true,
    },
  })
}

export default useDeployEnvironment
