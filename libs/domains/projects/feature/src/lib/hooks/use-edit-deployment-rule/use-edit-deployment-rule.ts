import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditDeploymentRule() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editDeploymentRule, {
    onSuccess(_, { projectId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.listDeploymentRules({ projectId }).queryKey,
      })
    },
    meta: {
      notifyOnSuccess: {
        title: 'Your rule is updated',
      },
      notifyOnError: true,
    },
  })
}

export default useEditDeploymentRule
