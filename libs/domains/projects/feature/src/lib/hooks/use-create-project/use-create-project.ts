import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { showMcpSuggestionToast } from '@qovery/shared/mcp-suggestion/feature'
import { queries } from '@qovery/state/util-queries'

export function useCreateProject({ silently = false } = {}) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createProject, {
    onSuccess(data, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.list({ organizationId }).queryKey,
      })
      if (!silently) {
        showMcpSuggestionToast({ type: 'project', name: data.name })
      }
    },
    meta: {
      ...(silently
        ? {}
        : {
            notifyOnSuccess: {
              title: 'Your project has been created',
            },
          }),
      notifyOnError: true,
    },
  })
}

export default useCreateProject
