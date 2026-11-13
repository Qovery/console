import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { type AlertRulePayload, slackBot, slackBotMutations } from '@qovery/shared/slack-bot/data-access'
import { toast } from '@qovery/shared/ui'

export function useCreateSlackAlertRule({
  organizationId,
  installationId,
}: {
  organizationId: string
  installationId: string
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AlertRulePayload) =>
      slackBotMutations.createAlertRule({ organizationId, installationId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: slackBot.alertRules({ organizationId }).queryKey,
      })
      toast('success', 'Alert rule created')
      posthog.capture('slack-alert-rule-created', { organization_id: organizationId })
    },
    onError: () => {
      toast('error', 'Failed to create alert rule')
    },
  })
}

export default useCreateSlackAlertRule
