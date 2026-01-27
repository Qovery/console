import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type GitWebhookStatusResponse } from '@qovery/domains/services/data-access'
import { Badge, Icon, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'

export interface GitWebhookStatusBadgeProps {
  serviceId: string
}

const statusConfig: Record<
  GitWebhookStatusResponse['status'],
  {
    color: 'green' | 'yellow' | 'red' | 'neutral'
    icon: IconName
    label: string
    tooltip: string
  }
> = {
  ACTIVE: {
    color: 'green',
    icon: 'check',
    label: 'Working',
    tooltip: 'Webhook is correctly configured. Auto-deploy will trigger on git events.',
  },
  NOT_CONFIGURED: {
    color: 'red',
    icon: 'circle-question',
    label: 'Not Configured',
    tooltip: 'No webhook found for auto-deployment. Use the Update Webhook button to configure it automatically.',
  },
  MISCONFIGURED: {
    color: 'yellow',
    icon: 'triangle-exclamation',
    label: 'Misconfigured',
    tooltip: 'Webhook is missing required events. Use the Update Webhook button to fix it automatically.',
  },
  UNABLE_TO_VERIFY: {
    color: 'neutral',
    icon: 'circle-exclamation',
    label: 'Unable to Verify',
    tooltip:
      "Couldn't verify webhook status. This could be due to expired credentials, insufficient permissions, or git provider API unavailability.",
  },
}

export function GitWebhookStatusBadge({ serviceId }: GitWebhookStatusBadgeProps) {
  const { data, isLoading, isError, refetch } = useGitWebhookStatus({ serviceId })

  if (isLoading) {
    return (
      <Badge color="neutral" size="sm" variant="surface" className="gap-1.5">
        <LoaderSpinner classWidth="w-3" />
        <span>Checking...</span>
      </Badge>
    )
  }

  if (isError || !data) {
    return (
      <Tooltip content="Could not fetch webhook status. Click to retry.">
        <button type="button" onClick={() => refetch()} className="inline-flex">
          <Badge color="neutral" size="sm" variant="surface" className="cursor-pointer gap-1.5">
            <Icon iconName="circle-exclamation" className="text-xs" />
            <span>Error</span>
          </Badge>
        </button>
      </Tooltip>
    )
  }

  const config = statusConfig[data.status]

  return (
    <Tooltip content={config.tooltip}>
      <span>
        <Badge color={config.color} size="sm" variant="surface" className="gap-1.5">
          <Icon iconName={config.icon} className="text-xs" />
          <span>{config.label}</span>
        </Badge>
      </span>
    </Tooltip>
  )
}

export default GitWebhookStatusBadge
