import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useStopEnvironment() {
  const queryClient = useQueryClient()

  return useMutation(mutations.stopEnvironment, {
    onSuccess(_, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.listStatuses(environmentId).queryKey,
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
