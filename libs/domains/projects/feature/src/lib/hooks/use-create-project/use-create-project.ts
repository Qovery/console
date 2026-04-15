import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateProject({ silently = false } = {}) {
  const queryClient = useQueryClient()

  return useMutation(mutations.createProject, {
    onSuccess(_, { organizationId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.list({ organizationId }).queryKey,
      })
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
