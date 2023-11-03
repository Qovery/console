import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'

export const useDeleteProject = () => {
  return useMutation(mutations.deleteProject, {
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been deleted',
      },
      notifyOnError: true,
    },
  })
}
