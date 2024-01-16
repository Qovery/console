import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCancelEnvironment({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  return useMutation(mutations.cancelEnvironment, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(projectId).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment deployment is cancelling',
      },
      notifyOnError: true,
    },
  })
}

export default useCancelEnvironment
