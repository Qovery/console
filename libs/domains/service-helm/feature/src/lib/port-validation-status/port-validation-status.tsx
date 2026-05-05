import type { IconName } from '@fortawesome/fontawesome-common-types'
import { Icon, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import type { PortValidationStatusType } from '../hooks/use-port-validation/types'

export interface PortValidationStatusProps {
  status: PortValidationStatusType
  errorMessage?: string
  className?: string
}

const statusConfig: Record<
  Exclude<PortValidationStatusType, 'loading'>,
  {
    icon: IconName
    iconClassName: string
    tooltip: string
  }
> = {
  valid: {
    icon: 'circle-check',
    iconClassName: 'text-green-500',
    tooltip: 'Port is valid',
  },
  invalid: {
    icon: 'circle-exclamation',
    iconClassName: 'text-red-500',
    tooltip: 'Port configuration error',
  },
  unknown: {
    icon: 'circle-question',
    iconClassName: 'text-neutral-350',
    tooltip: 'Validation pending',
  },
}

export function PortValidationStatus({ status, errorMessage, className }: PortValidationStatusProps) {
  if (status === 'loading') {
    return (
      <span data-testid="port-validation-status" className={twMerge('inline-flex items-center', className)}>
        <span data-testid="port-validation-loading">
          <LoaderSpinner classWidth="w-4" />
        </span>
      </span>
    )
  }

  const config = statusConfig[status]
  const tooltipContent = status === 'invalid' && errorMessage ? errorMessage : config.tooltip

  return (
    <span data-testid="port-validation-status" className={twMerge('inline-flex items-center', className)}>
      <Tooltip content={tooltipContent}>
        <span data-testid="port-validation-trigger" className="inline-flex cursor-help">
          <Icon
            data-testid="port-validation-icon"
            iconName={config.icon}
            className={twMerge('text-sm', config.iconClassName)}
          />
        </span>
      </Tooltip>
    </span>
  )
}

export default PortValidationStatus
