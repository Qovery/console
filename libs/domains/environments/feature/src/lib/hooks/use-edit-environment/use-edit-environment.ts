import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditEnvironment() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editEnvironment, {
    onSuccess({ project: { id: projectId } }, { environmentId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.list({ projectId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.environments.details({ environmentId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your environment is updated',
      },
      notifyOnError: true,
    },
  })
}

export default useEditEnvironment
