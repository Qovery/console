import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditProject() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editProject, {
    onSuccess({ organization }) {
      if (organization) {
        queryClient.invalidateQueries({
          queryKey: queries.projects.list({ organizationId: organization.id }).queryKey,
        })
      }
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been updated',
      },
      notifyOnError: true,
    },
  })
}

export default useEditProject
