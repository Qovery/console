import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'

export const useEditProject = () => {
  return useMutation(mutations.editProject, {
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been updated',
      },
      notifyOnError: true,
    },
  })
}
