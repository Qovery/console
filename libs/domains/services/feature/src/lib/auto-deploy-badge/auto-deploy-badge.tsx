import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useParams } from '@tanstack/react-router'
import { type GitWebhookStatusResponse } from 'qovery-typescript-axios'
import { APPLICATION_SETTINGS_GENERAL_URL, APPLICATION_SETTINGS_URL, APPLICATION_URL } from '@qovery/shared/routes'
import { Icon, Link, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { useGitWebhookStatus } from '../hooks/use-git-webhook-status/use-git-webhook-status'

export interface AutoDeployBadgeProps {
  serviceId: string
}

const webhookStatusConfig: Record<
  GitWebhookStatusResponse['status'],
  {
    icon: IconName
    iconClassName: string
    tooltip: string
  }
> = {
  ACTIVE: {
    icon: 'circle-check',
    iconClassName: 'text-positive',
    tooltip: 'Webhook is correctly configured. Auto-deploy will trigger on git events.',
  },
  NOT_CONFIGURED: {
    icon: 'circle-question',
    iconClassName: 'text-negative',
    tooltip: 'No webhook found for auto-deployment. Click to configure it in settings.',
  },
  MISCONFIGURED: {
    icon: 'triangle-exclamation',
    iconClassName: 'text-warning',
    tooltip: 'Webhook is missing required events. Click to fix it in settings.',
  },
  UNABLE_TO_VERIFY: {
    icon: 'circle-exclamation',
    iconClassName: 'text-neutral-subtle',
    tooltip:
      "Couldn't verify webhook status. This could be due to expired credentials, insufficient permissions, or git provider API unavailability.",
  },
}

export function AutoDeployBadge({ serviceId }: AutoDeployBadgeProps) {
  const {
    organizationId = '',
    projectId = '',
    environmentId = '',
    serviceId: routeServiceId = '',
  } = useParams({
    strict: false,
  })
  const { data: webhookStatus, isLoading } = useGitWebhookStatus({ serviceId })

  const config = webhookStatus ? webhookStatusConfig[webhookStatus.status] : undefined
  const tooltipContent = config?.tooltip ?? 'Auto-deploy enabled. Click to view settings.'

  const settingsUrl =
    APPLICATION_URL(organizationId, projectId, environmentId, routeServiceId) +
    APPLICATION_SETTINGS_URL +
    APPLICATION_SETTINGS_GENERAL_URL

  return (
    <Tooltip content={tooltipContent}>
      <Link as="button" color="neutral" variant="outline" size="xs" to={settingsUrl}>
        <Icon className="text-neutral" iconName="arrows-rotate" />
        <span className="ml-1.5">Auto-deploy</span>
        {isLoading ? (
          <LoaderSpinner classWidth="w-3 ml-0.5" />
        ) : (
          config && <Icon iconName={config.icon} className={`ml-1 text-xs ${config.iconClassName}`} />
        )}
      </Link>
    </Tooltip>
  )
}

export default AutoDeployBadge
