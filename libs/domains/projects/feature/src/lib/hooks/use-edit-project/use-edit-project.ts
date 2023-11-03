import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export const useEditProject = ({ organizationId }: { organizationId: string }) => {
  const queryClient = useQueryClient()

  return useMutation(mutations.editProject, {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queries.projects.list({ organizationId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been updated',
      },
      notifyOnError: true,
    },
  })
}
