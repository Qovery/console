import type { IconName } from '@fortawesome/fontawesome-common-types'
import { match } from 'ts-pattern'
import { Button, Callout, type CalloutRootProps, Icon } from '@qovery/shared/ui'
import type { ValidationReason } from '../hooks/use-port-validation/types'

export interface PortValidationWarningProps {
  reason: ValidationReason
  onRetry?: () => void
}

interface WarningConfig {
  icon: IconName
  color: CalloutRootProps['color']
  title: string
  description: string
  showRetry: boolean
}

function getWarningConfig(reason: ValidationReason): WarningConfig {
  return match(reason)
    .with('SERVICE_NOT_DEPLOYED', () => ({
      icon: 'triangle-exclamation' as IconName,
      color: 'yellow' as const,
      title: 'Port validation unavailable',
      description: 'Port validation will be available after deployment.',
      showRetry: false,
    }))
    .with('SERVICE_STOPPED', () => ({
      icon: 'triangle-exclamation' as IconName,
      color: 'yellow' as const,
      title: 'Port validation unavailable',
      description: 'Port validation requires the helm chart to be deployed.',
      showRetry: false,
    }))
    .with('API_ERROR', () => ({
      icon: 'circle-exclamation' as IconName,
      color: 'red' as const,
      title: 'Unable to validate ports',
      description: 'Failed to fetch Kubernetes services. Please try again.',
      showRetry: true,
    }))
    .with('API_TIMEOUT', () => ({
      icon: 'clock' as IconName,
      color: 'yellow' as const,
      title: 'Validation timed out',
      description: 'Port validation request timed out. Please try again.',
      showRetry: true,
    }))
    .exhaustive()
}

export function PortValidationWarning({ reason, onRetry }: PortValidationWarningProps) {
  const config = getWarningConfig(reason)

  return (
    <Callout.Root color={config.color} className="mb-4">
      <Callout.Icon>
        <Icon iconName={config.icon} iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>{config.title}</Callout.TextHeading>
        <Callout.TextDescription>{config.description}</Callout.TextDescription>
      </Callout.Text>
      {config.showRetry && onRetry && (
        <Button type="button" color="neutral" variant="outline" size="md" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Callout.Root>
  )
}

export default PortValidationWarning
