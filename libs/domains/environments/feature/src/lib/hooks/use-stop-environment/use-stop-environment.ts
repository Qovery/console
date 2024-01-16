import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStopEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.stopEnvironment, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment is being stopped',
      },
      notifyOnError: true,
    },
  })
}

export default useStopEnvironment
