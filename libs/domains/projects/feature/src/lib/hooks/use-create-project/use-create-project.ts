import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createProject, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.list({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateProject
