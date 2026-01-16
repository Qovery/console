export type WebhookStatusType =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'NOT_CONFIGURED'
  | 'MISCONFIGURED'
  | 'CHECKING'
  | 'STATUS_UNAVAILABLE'

export interface WebhookStatusResult {
  status: WebhookStatusType
  message: string
  lastChecked: Date
}

export interface WebhookStatusState extends WebhookStatusResult {
  isLoading: boolean
  error?: Error
}

export interface StatusConfig {
  color: 'green' | 'red' | 'yellow' | 'neutral'
  icon: string
  label: string
  tooltipMessage: string
  showResyncButton: boolean
}

export const statusConfig: Record<WebhookStatusType, StatusConfig> = {
  ACTIVE: {
    color: 'green',
    icon: 'check-circle',
    label: 'Active',
    tooltipMessage: 'Webhook is configured and actively listening for git events',
    showResyncButton: false,
  },
  INACTIVE: {
    color: 'yellow',
    icon: 'alert-circle',
    label: 'Inactive',
    tooltipMessage: 'Webhook exists but is disabled. Click to re-sync webhook configuration.',
    showResyncButton: true,
  },
  NOT_CONFIGURED: {
    color: 'yellow',
    icon: 'alert-circle',
    label: 'Not Configured',
    tooltipMessage: 'No webhook found. Click to create a webhook in your git provider.',
    showResyncButton: true,
  },
  MISCONFIGURED: {
    color: 'red',
    icon: 'alert-triangle',
    label: 'Misconfigured',
    tooltipMessage: 'Webhook is missing required events. Click to re-sync webhook configuration.',
    showResyncButton: true,
  },
  CHECKING: {
    color: 'neutral',
    icon: 'loader',
    label: 'Checking',
    tooltipMessage: 'Verifying webhook status...',
    showResyncButton: false,
  },
  STATUS_UNAVAILABLE: {
    color: 'red',
    icon: 'x-circle',
    label: 'Unavailable',
    tooltipMessage: 'Could not verify webhook status. Please try again later.',
    showResyncButton: false,
  },
}

export const statusMessages: Record<WebhookStatusType, string> = {
  ACTIVE: 'Webhook is configured and actively listening for git events',
  INACTIVE: 'Webhook exists but is disabled. Click to re-sync webhook configuration.',
  NOT_CONFIGURED: 'No webhook found. Click to create a webhook in your git provider.',
  MISCONFIGURED: 'Webhook is missing required events. Click to re-sync webhook configuration.',
  CHECKING: 'Verifying webhook status...',
  STATUS_UNAVAILABLE: 'Could not verify webhook status. Please try again later.',
}
