import { Link } from '@tanstack/react-router'
import { cva } from 'class-variance-authority'
import {
  type DeploymentHistoryActionStatus,
  type DeploymentHistoryTriggerAction,
  type ServiceActionEnum,
  type ServiceSubActionEnum,
  type StateEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import Icon from '../icon/icon'
import Indicator from '../indicator/indicator'
import StatusChip from '../status-chip/status-chip'

const triggerActionVariants = cva(
  ['flex', 'items-center', 'justify-center', 'rounded-full', 'border', 'border-neutral', 'text-neutral-subtle'],
  {
    variants: {
      size: {
        sm: ['h-7', 'w-7', 'text-sm'],
        md: ['h-9', 'w-9', 'text-base'],
      },
    },
  }
)

const statusChipVariants = cva(['relative', 'rounded-full', 'bg-background'], {
  variants: {
    size: {
      sm: ['-left-0.5', '-top-1'],
      md: ['-top-1.5', '-left-1.5'],
    },
  },
})

export function TriggerActionIcon({
  triggerAction,
  className,
}: {
  triggerAction: DeploymentHistoryTriggerAction | Exclude<ServiceSubActionEnum, 'NONE'> | undefined
  className?: string
}) {
  return (
    <span className={className}>
      {match(triggerAction)
        .with(undefined, 'UNKNOWN', () => <Icon iconStyle="regular" iconName="question-circle" />)
        .with('DELETE', () => <Icon iconStyle="regular" iconName="trash-can" />)
        .with('UNINSTALL', () => <Icon iconStyle="regular" iconName="trash-can" />)
        .with('DEPLOY', () => <Icon iconStyle="regular" iconName="rocket" />)
        .with('RESTART', () => <Icon iconStyle="regular" iconName="arrow-rotate-right" />)
        .with('STOP', () => <Icon iconStyle="regular" iconName="circle-stop" />)
        .with('DEPLOY_DRY_RUN', () => <Icon iconStyle="regular" iconName="rocket" />)
        .with('TERRAFORM_FORCE_UNLOCK', () => <Icon iconStyle="regular" iconName="lock-keyhole-open" />)
        .with('TERRAFORM_MIGRATE_STATE', () => <Icon iconStyle="regular" iconName="file-export" />)
        .with('DELETE_RESOURCES_ONLY', () => <Icon iconStyle="regular" iconName="trash-can" />)
        .with('TERRAFORM_PLAN_ONLY', () => <Icon iconStyle="regular" iconName="rectangle-list" />)
        .with('TERRAFORM_PLAN_AND_APPLY', () => <Icon iconStyle="regular" iconName="rocket" />)
        .with('TERRAFORM_DESTROY', () => <Icon iconStyle="regular" iconName="fire" />)
        .with('TERRAFORM_FORCE_UNLOCK_STATE', () => <Icon iconStyle="regular" iconName="lock-keyhole-open" />)
        .exhaustive()}
    </span>
  )
}

export interface ActionTriggerStatusChipInterface {
  size: 'sm' | 'md'
  triggerAction: DeploymentHistoryTriggerAction | Exclude<ServiceSubActionEnum, 'NONE'> | undefined
  status?: StateEnum | DeploymentHistoryActionStatus | ServiceActionEnum
  statusLink?: string
}

export function ActionTriggerStatusChip({ size, status, triggerAction, statusLink }: ActionTriggerStatusChipInterface) {
  const statusChip = status && <StatusChip className={statusChipVariants({ size })} status={status} disabledTooltip />

  return (
    <div className="relative">
      <Indicator align="end" side="right" content={statusLink ? <Link to={statusLink}>{statusChip}</Link> : statusChip}>
        <TriggerActionIcon triggerAction={triggerAction} className={triggerActionVariants({ size })} />
      </Indicator>
    </div>
  )
}

export default ActionTriggerStatusChip
