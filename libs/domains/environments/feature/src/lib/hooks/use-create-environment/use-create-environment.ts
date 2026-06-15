import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { showMcpSuggestionToast } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'

export function useCreateEnvironment() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createEnvironment, {
    onSuccess(data, { projectId }) {
      queryClient.invalidateQueries({
        queryKey: queries.environments.list({ projectId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: queries.projects.environmentsOverview({ projectId }).queryKey,
      })
      showMcpSuggestionToast({ type: 'environment', name: data.name })
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
