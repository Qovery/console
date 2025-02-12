import { cva } from 'class-variance-authority'
import {
  type DeploymentHistoryActionStatus,
  type DeploymentHistoryTriggerAction,
  type ServiceActionEnum,
  type StateEnum,
} from 'qovery-typescript-axios'
import { Link } from 'react-router-dom'
import { match } from 'ts-pattern'
import Icon from '../icon/icon'
import Indicator from '../indicator/indicator'
import StatusChip from '../status-chip/status-chip'

const triggerActionVariants = cva(
  [
    'flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'border',
    'border-neutral-200',
    'text-neutral-350',
    'dark:border-neutral-400',
    'dark:text-neutral-250',
  ],
  {
    variants: {
      size: {
        sm: ['h-7', 'w-7', 'text-sm'],
        md: ['h-9', 'w-9', 'text-base'],
      },
    },
  }
)

const statusChipVariants = cva(['relative', 'rounded-full', 'bg-white', 'dark:bg-neutral-600'], {
  variants: {
    size: {
      sm: ['-left-0.5', '-top-1'],
      md: ['-top-1.5', '-left-1.5'],
    },
  },
})

export function TriggerActionIcon({
  triggerAction,
  triggerLink,
  className,
}: {
  triggerAction: DeploymentHistoryTriggerAction | undefined
  className?: string
  triggerLink?: string
}) {
  return (
    <span className={className}>
      {match(triggerAction)
        .with(undefined, 'UNKNOWN', () => <Icon iconStyle="regular" iconName="question-circle" />)
        .with('DELETE', () => <Icon iconStyle="solid" iconName="trash-can-xmark" />)
        .with('DEPLOY', () => <Icon iconStyle="solid" iconName="play" />)
        .with('RESTART', () => <Icon iconStyle="solid" iconName="arrow-rotate-right" />)
        .with('STOP', () => <Icon iconStyle="solid" iconName="stop" />)
        .exhaustive()}
    </span>
  )
}

export interface ActionTriggerStatusChipInterface {
  size: 'sm' | 'md'
  triggerAction: DeploymentHistoryTriggerAction | undefined
  status?: StateEnum | DeploymentHistoryActionStatus | ServiceActionEnum
  statusLink?: string
}

export function ActionTriggerStatusChip({ size, status, triggerAction, statusLink }: ActionTriggerStatusChipInterface) {
  const statusChip = status && <StatusChip className={statusChipVariants({ size })} status={status} disabledTooltip />

  return (
    <div className="relative">
      <Indicator align="end" side="right" content={statusLink ? <Link to={statusLink}>{statusChip}</Link> : statusChip}>
        <TriggerActionIcon
          triggerAction={triggerAction}
          triggerLink={statusLink}
          className={triggerActionVariants({ size })}
        />
      </Indicator>
    </div>
  )
}

export default ActionTriggerStatusChip
