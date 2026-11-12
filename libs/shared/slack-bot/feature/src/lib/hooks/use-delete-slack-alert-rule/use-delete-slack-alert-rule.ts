import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { slackBot, slackBotMutations } from '@qovery/shared/slack-bot/data-access'
import { toast } from '@qovery/shared/ui'

export function useDeleteSlackAlertRule({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string }) => slackBotMutations.deleteAlertRule({ organizationId, ruleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: slackBot.alertRules({ organizationId }).queryKey,
      })
      toast('success', 'Alert rule deleted')
      posthog.capture('slack-alert-rule-deleted', { organization_id: organizationId })
    },
    onError: () => {
      toast('error', 'Failed to delete alert rule')
    },
  })
}

export default useDeleteSlackAlertRule
