import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutations } from '@qovery/domains/environments/data-access'
import { queries } from '@qovery/state/util-queries'

export function useAttachServiceToDeploymentStage() {
  const queryClient = useQueryClient()

  const currentUseMutation = useMutation(mutations.attachServiceToDeploymentStage, {
    onSuccess(data) {
      const environmentIds = [...new Set((data ?? []).map(({ environment: { id } }) => id))]
      for (const environmentId of environmentIds) {
        queryClient.invalidateQueries({
          queryKey: queries.environments.listDeploymentStages({ environmentId }).queryKey,
        })
      }
      if (environmentIds.length === 0) {
        queryClient.invalidateQueries({
          queryKey: queries.environments.listDeploymentStages._def,
        })
      }
    },
    meta: {
      notifyOnSuccess(_: unknown, variables: unknown) {
        const { prevStage } = variables as Parameters<typeof mutations.attachServiceToDeploymentStage>[0]

        return prevStage
          ? {
              title: 'Your deployment stage is updated',
              description: 'Do you need to go back?',
              labelAction: 'Undo',
              callback() {
                currentUseMutation.mutate(prevStage)
              },
            }
          : {
              title: 'Your deployment stage is updated',
            }
      },
      notifyOnError: true,
    },
  })

  return currentUseMutation
}

export default useAttachServiceToDeploymentStage
