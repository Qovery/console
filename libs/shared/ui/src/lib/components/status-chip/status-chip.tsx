import {
  type ClusterStateEnum,
  type DeploymentHistoryActionStatus,
  type ServiceActionEnum,
  type StageStatusEnum,
  type StateEnum,
  type StepMetricStatusEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type RunningState } from '@qovery/shared/enums'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
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
    | undefined
  className?: string
  appendTooltipMessage?: string
  disabledTooltip?: boolean
}

export function StatusChip({
  status,
  className = '',
  appendTooltipMessage = '',
  disabledTooltip = false,
}: StatusChipProps) {
  if (!status)
    return (
      <Tooltip content="Stopped">
        <div className={className}>
          <StoppedIcon />
        </div>
      </Tooltip>
    )

  const tooltipContent = `${upperCaseFirstLetter(status.replace('_', ' '))} ${
    appendTooltipMessage ? ' - ' + appendTooltipMessage : ''
  }`

  const icon = match(status)
    // success
    .with('READY', () => <StoppedIcon />)
    .with('DEPLOYED', 'RUNNING', 'COMPLETED', 'SUCCESS', 'DONE', 'DEPLOY', () => <DeployedIcon />)
    .with('RESTARTED', 'RESTART', () => <RestartedIcon />)
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
      () => <QueuedIcon />
    )
    .with('DEPLOYING', 'STARTING', 'ONGOING', 'DRY_RUN', () => <DeployingIcon />)
    .with('RESTARTING', () => <RestartingIcon />)
    .with('BUILDING', () => <BuildingIcon />)
    .with('STOPPING', () => <StoppingIcon />)
    .with('CANCELING', () => <CancelingIcon />)
    .with('DELETING', () => <DeletingIcon />)
    // stopped
    .with('STOPPED', 'STOP', () => <StoppedIcon />)
    .with('CANCELED', 'CANCEL', () => <CanceledIcon />)
    .with('SKIP', 'SKIPPED', () => <SkipIcon />)
    .with('DELETED', 'DELETE', () => <DeletedIcon />)
    // unknow / error / warning
    .with('UNKNOWN', 'NEVER', () => <UnknownIcon />)
    .with('BUILD_ERROR', () => <BuildErrorIcon />)
    .with('WARNING', () => <WarningIcon />)
    .with(
      'DEPLOYMENT_ERROR',
      'STOP_ERROR',
      'DELETE_ERROR',
      'RESTART_ERROR',
      'ERROR',
      'INVALID_CREDENTIALS',
      'RECAP',
      () => (
        <span className="relative flex">
          <span className="absolute inline-flex h-full w-full animate-ping-small rounded-full bg-red-500 opacity-75" />
          <ErrorIcon className="relative rounded-full bg-white" />
        </span>
      )
    )
    .exhaustive()

  return (
    <Tooltip content={tooltipContent} disabled={disabledTooltip}>
      <div className={className}>{icon}</div>
    </Tooltip>
  )
}

export default StatusChip
