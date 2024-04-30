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
        title:
          'The project deletion has been started and will be completed after having deleted all environments within it.',
      },
      notifyOnError: true,
    },
  })
}

export default useDeleteProject
