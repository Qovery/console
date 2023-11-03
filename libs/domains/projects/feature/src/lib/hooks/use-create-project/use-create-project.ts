import { useMutation } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'

export const useCreateProject = () => {
  return useMutation(mutations.createProject, {
    meta: {
      notifyOnSuccess: {
        title: 'Your project has been created',
      },
      notifyOnError: true,
    },
  })
}
