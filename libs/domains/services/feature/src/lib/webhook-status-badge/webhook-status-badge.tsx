import { Badge, Tooltip } from '@qovery/shared/ui'
import { type ServiceType } from '@qovery/domains-services/data-access'
import { dateMediumLocalFormat } from '@qovery/shared/util-dates'
import { type ReactNode, useState } from 'react'
import { useWebhookStatus } from './use-webhook-status'
import { useResyncWebhook } from './use-resync-webhook'
import { statusConfig } from './webhook-status-types'

export interface WebhookStatusBadgeProps {
  serviceId: string
  serviceType: ServiceType
  canEdit: boolean
  gitProvider?: string
}

export function WebhookStatusBadge({
  serviceId,
  serviceType,
  canEdit,
  gitProvider,
}: WebhookStatusBadgeProps): JSX.Element | null {
  const { status, message, lastChecked, isLoading } = useWebhookStatus({
    serviceId,
    serviceType,
    enabled: true,
  })

  const { mutate: resyncWebhook, isLoading: isResyncing } = useResyncWebhook({
    serviceId,
    serviceType,
  })

  const [tooltipOpen, setTooltipOpen] = useState(false)

  const config = statusConfig[status]
  const shouldShowResyncButton = config.showResyncButton && canEdit && !isLoading
  const isResyncDisabled = !canEdit || isLoading || isResyncing

  const tooltipContent: ReactNode = (
    <div className="space-y-2">
      <p>{message}</p>
      {lastChecked && (
        <p className="text-xs opacity-75">Last checked: {dateMediumLocalFormat(lastChecked)}</p>
      )}
      {shouldShowResyncButton && (
        <button
          onClick={() => {
            resyncWebhook()
            setTooltipOpen(false)
          }}
          disabled={isResyncDisabled || isResyncing}
          className="mt-2 px-2 py-1 text-xs bg-white text-neutral-900 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isResyncing ? 'Syncing...' : 'Re-sync Webhook'}
        </button>
      )}
      {isResyncDisabled && canEdit === false && shouldShowResyncButton && (
        <p className="text-xs opacity-75">You need edit permission to update webhook configuration</p>
      )}
    </div>
  )

  return (
    <Tooltip
      content={tooltipContent}
      side="top"
      align="center"
      color="neutral"
      open={tooltipOpen}
      onOpenChange={setTooltipOpen}
      disabled={false}
    >
      <Badge size="sm" color={config.color} variant="surface">
        {isLoading ? 'Checking...' : config.label}
      </Badge>
    </Tooltip>
  )
}

export default WebhookStatusBadge
