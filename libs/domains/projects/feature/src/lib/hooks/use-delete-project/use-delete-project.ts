import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation(mutations.deleteProject, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.list({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been deleted',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteProject
