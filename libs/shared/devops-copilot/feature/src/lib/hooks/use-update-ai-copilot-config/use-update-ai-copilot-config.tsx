import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type AICopilotConfigResponse, devopsCopilot, mutations } from '@qovery/shared/devops-copilot/data-access'
import { ToastEnum, toast } from '@qovery/shared/ui'

export interface UseUpdateAICopilotConfigProps {
  organizationId: string
  instructions?: string
}

export function useUpdateAICopilotConfig({ organizationId, instructions }: UseUpdateAICopilotConfigProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ enabled, readOnly, userEmail }: { enabled: boolean; readOnly: boolean; userEmail?: string }) =>
      mutations.updateOrgConfig({
        organizationId,
        enabled,
        readOnly,
        instructions: instructions || '',
        userEmail,
      }),
    onMutate: async ({ readOnly }) => {
      await queryClient.cancelQueries({
        queryKey: devopsCopilot.config({ organizationId }).queryKey,
      })

      const previousConfig = queryClient.getQueryData(devopsCopilot.config({ organizationId }).queryKey)

      queryClient.setQueryData(
        devopsCopilot.config({ organizationId }).queryKey,
        (old: AICopilotConfigResponse | undefined) =>
          old
            ? {
                ...old,
                org_config: {
                  ...old.org_config,
                  read_only: readOnly,
                },
              }
            : old
      )

      return { previousConfig }
    },
    onSuccess: (_data, variables) => {
      const modeName = variables.readOnly ? 'Read-Only' : 'Read-Write'
      if (variables.enabled) {
        toast(ToastEnum.SUCCESS, `AI Copilot enabled with ${modeName} mode`)
      } else {
        toast(ToastEnum.SUCCESS, 'AI Copilot disabled successfully')
      }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousConfig) {
        queryClient.setQueryData(devopsCopilot.config({ organizationId }).queryKey, context.previousConfig)
      }
      toast(ToastEnum.ERROR, 'Failed to update AI Copilot configuration', 'Please try again later')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: devopsCopilot.config({ organizationId }).queryKey,
      })
    },
  })
}

export default useUpdateAICopilotConfig
