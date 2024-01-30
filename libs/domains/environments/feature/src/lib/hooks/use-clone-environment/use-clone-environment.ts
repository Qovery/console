import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCloneEnvironment() {
  const queryClient = useQueryClient()

  return useMutation(mutations.cloneEnvironment, {
    onSuccess({ project }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.list({ projectId: project.id }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment has been successfully cloned',
      },
      notifyOnError: true,
    },
  })
}

export default useCloneEnvironment
