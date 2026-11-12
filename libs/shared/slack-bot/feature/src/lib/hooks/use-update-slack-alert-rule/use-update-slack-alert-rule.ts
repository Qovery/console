import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { type AlertRulePayload, slackBot, slackBotMutations } from '@qovery/shared/slack-bot/data-access'
import { toast } from '@qovery/shared/ui'

export function useUpdateSlackAlertRule({ organizationId, ruleId }: { organizationId: string; ruleId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AlertRulePayload) => slackBotMutations.updateAlertRule({ organizationId, ruleId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: slackBot.alertRules({ organizationId }).queryKey,
      })
      toast('success', 'Alert rule updated')
      posthog.capture('slack-alert-rule-updated', { organization_id: organizationId })
    },
    onError: () => {
      toast('error', 'Failed to update alert rule')
    },
  })
}

export default useUpdateSlackAlertRule
