import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/projects/data-access'
import { queries } from '@qovery/state/util-queries'

export function useEditDeploymentRulesPriorityOrder() {
  const queryClient = useQueryClient()

  return useMutation(mutations.editDeploymentRulesPriorityOrder, {
    onSuccess(_, { projectId }) {
      queryClient.invalidateQueries({
        queryKey: queries.projects.listDeploymentRules({ projectId }).queryKey,
      })
    },
    meta: {
      notifyOnError: true,
    },
  })
}

export default useEditDeploymentRulesPriorityOrder
