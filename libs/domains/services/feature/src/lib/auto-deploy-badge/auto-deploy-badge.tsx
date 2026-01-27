import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type GitWebhookStatusResponse } from 'qovery-typescript-axios'
import { Link, useParams } from 'react-router-dom'
import { APPLICATION_SETTINGS_GENERAL_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { Badge, Icon, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'

export interface AutoDeployBadgeProps {
  serviceId: string
}

const webhookStatusConfig: Record<
  GitWebhookStatusResponse['status'],
  {
    icon: IconName
    color: 'green' | 'yellow' | 'red' | 'neutral'
    tooltip: string
  }
> = {
  ACTIVE: {
    icon: 'circle-check',
    color: 'green',
    tooltip: 'Webhook is correctly configured. Auto-deploy will trigger on git events.',
  },
  NOT_CONFIGURED: {
    icon: 'circle-question',
    color: 'red',
    tooltip: 'No webhook found for auto-deployment. Click to configure it in settings.',
  },
  MISCONFIGURED: {
    icon: 'triangle-exclamation',
    color: 'yellow',
    tooltip: 'Webhook is missing required events. Click to fix it in settings.',
  },
  UNABLE_TO_VERIFY: {
    icon: 'circle-exclamation',
    color: 'neutral',
    tooltip:
      "Couldn't verify webhook status. This could be due to expired credentials, insufficient permissions, or git provider API unavailability.",
  },
}

export function AutoDeployBadge({ serviceId }: AutoDeployBadgeProps) {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: webhookStatus, isLoading } = useGitWebhookStatus({ serviceId })

  const config = webhookStatus ? webhookStatusConfig[webhookStatus.status] : undefined
  const tooltipContent = config?.tooltip ?? 'Auto-deploy enabled. Click to view settings.'

  const settingsUrl =
    APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
    APPLICATION_SETTINGS_URL +
    APPLICATION_SETTINGS_GENERAL_URL

  return (
    <Tooltip content={tooltipContent}>
      <Link to={settingsUrl}>
        <Badge variant="surface" className="cursor-pointer gap-1.5">
          <Icon className="text-neutral-350" iconName="arrows-rotate" />
          <span className="text-neutral-400">Auto-deploy</span>
          {isLoading ? (
            <LoaderSpinner classWidth="w-3" />
          ) : (
            config && (
              <Icon
                iconName={config.icon}
                className={`text-xs ${
                  config.color === 'green'
                    ? 'text-green-500'
                    : config.color === 'yellow'
                      ? 'text-yellow-500'
                      : config.color === 'red'
                        ? 'text-red-500'
                        : 'text-neutral-350'
                }`}
              />
            )
          )}
        </Badge>
      </Link>
    </Tooltip>
  )
}

export default AutoDeployBadge
