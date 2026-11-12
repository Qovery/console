import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { slackBot, slackBotMutations } from '@qovery/shared/slack-bot/data-access'
import { toast } from '@qovery/shared/ui'

export function useDeleteSlackInstallation({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => slackBotMutations.deleteInstallation({ organizationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: slackBot.installations({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: slackBot.alertRules({ organizationId }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: slackBot.channels({ organizationId }).queryKey,
      })
      toast('success', 'Slack workspace disconnected')
      posthog.capture('slack-workspace-disconnected', { organization_id: organizationId })
    },
    onError: () => {
      toast('error', 'Failed to disconnect workspace')
    },
  })
}

export default useDeleteSlackInstallation
