import {
  type ClusterStateEnum,
  type DeploymentHistoryActionStatus,
  type ServiceActionEnum,
  type ServiceSubActionEnum,
  type StageStatusEnum,
  type StateEnum,
  type StepMetricStatusEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type RunningState } from '@qovery/shared/enums'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import {
  BuildErrorIcon,
  BuildingIcon,
  CanceledIcon,
  CancelingIcon,
  DeletedIcon,
  DeletingIcon,
  DeployedIcon,
  DeployingIcon,
  ErrorIcon,
  QueuedIcon,
  RestartedIcon,
  RestartingIcon,
  SkipIcon,
  StoppedIcon,
  StoppingIcon,
  UnknownIcon,
  WarningIcon,
} from '../icon/icons-status'
import Tooltip from '../tooltip/tooltip'

export interface StatusChipProps {
  status:
    | StateEnum
    | keyof typeof RunningState
    | ClusterStateEnum
    | StepMetricStatusEnum
    | StageStatusEnum
    | DeploymentHistoryActionStatus
    | ServiceActionEnum
    | Exclude<ServiceSubActionEnum, 'NONE'>
    | undefined
  className?: string
  appendTooltipMessage?: string
  disabledTooltip?: boolean
  variant?: 'default' | 'monochrome'
  size?: 'sm' | 'xs'
}

export function StatusChip({
  status,
  className = '',
  appendTooltipMessage = '',
  disabledTooltip = false,
  variant = 'default',
  size = 'sm',
}: StatusChipProps) {
  const iconClass = twMerge(variant === 'monochrome' && 'text-neutral-subtle', size === 'xs' && 'h-full w-full')
  const wrapperClassName = twMerge(className, size === 'xs' && 'h-[14px] w-[14px]')

  if (!status)
    return (
      <Tooltip content="Stopped">
        <div className={wrapperClassName}>
          <StoppedIcon className={iconClass} />
        </div>
      </Tooltip>
    )

  const tooltipContent = `${upperCaseFirstLetter(status.replace('_', ' '))} ${
    appendTooltipMessage ? ' - ' + appendTooltipMessage : ''
  }`

  const icon = match(status)
    // success
    .with('READY', () => <StoppedIcon className={iconClass} />)
    .with('DEPLOYED', 'RUNNING', 'COMPLETED', 'SUCCESS', 'DONE', 'DEPLOY', () => <DeployedIcon className={iconClass} />)
    .with('RESTARTED', 'RESTART', () => <RestartedIcon className={iconClass} />)
    // spinner
    .with(
      'QUEUED',
      'DELETE_QUEUED',
      'DEPLOYMENT_QUEUED',
      'RESTART_QUEUED',
      'STOP_QUEUED',
      'WAITING_DELETING',
      'WAITING_RESTARTING',
      'WAITING_RUNNING',
      'WAITING_STOPPING',
      'TERRAFORM_MIGRATE_STATE',
      'TERRAFORM_PLAN_ONLY',
      'TERRAFORM_PLAN_AND_APPLY',
      'TERRAFORM_DESTROY',
      'TERRAFORM_FORCE_UNLOCK_STATE',
      () => <QueuedIcon />
    )
    .with('DEPLOYING', 'STARTING', 'ONGOING', 'DRY_RUN', 'EXECUTING', () => <DeployingIcon className={iconClass} />)
    .with('RESTARTING', () => <RestartingIcon className={iconClass} />)
    .with('BUILDING', () => <BuildingIcon className={iconClass} />)
    .with('STOPPING', () => <StoppingIcon className={iconClass} />)
    .with('CANCELING', () => <CancelingIcon className={iconClass} />)
    .with('DELETING', () => <DeletingIcon className={iconClass} />)
    // stopped
    .with('STOPPED', 'STOP', () => <StoppedIcon className={iconClass} />)
    .with('CANCELED', 'CANCEL', () => <CanceledIcon className={iconClass} />)
    .with('SKIP', 'SKIPPED', () => <SkipIcon className={iconClass} />)
    .with('DELETED', 'DELETE', () => <DeletedIcon className={iconClass} />)
    // unknow / error / warning
    .with('UNKNOWN', 'NEVER', () => <UnknownIcon className={iconClass} />)
    .with('BUILD_ERROR', () => <BuildErrorIcon className={iconClass} />)
    .with('WARNING', () => <WarningIcon className={iconClass} />)
    .with(
      'DEPLOYMENT_ERROR',
      'STOP_ERROR',
      'DELETE_ERROR',
      'RESTART_ERROR',
      'ERROR',
      'INVALID_CREDENTIALS',
      'RECAP',
      () => <ErrorIcon className={iconClass} />
    )
    .exhaustive()

  return (
    <Tooltip content={tooltipContent} disabled={disabledTooltip}>
      <div className={wrapperClassName}>{icon}</div>
    </Tooltip>
  )
}

export default StatusChip
