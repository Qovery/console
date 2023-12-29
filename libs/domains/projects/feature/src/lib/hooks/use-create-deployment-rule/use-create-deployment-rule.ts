import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useCreateDeploymentRule() {
  const queryClient = useQueryClient()

  return useMutation(mutations.createDeploymentRule, {
    onSuccess(_, { projectId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.listDeploymentRules({ projectId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your rule is created',
      },
      notifyOnError: true,
    },
  })
}

export default useCreateDeploymentRule
