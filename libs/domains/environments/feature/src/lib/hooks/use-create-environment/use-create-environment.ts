import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateEnvironment() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createEnvironment, {
    onSuccess(_, { projectId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.list({ projectId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment has been successfully created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateEnvironment
