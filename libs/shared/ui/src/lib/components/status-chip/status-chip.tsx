import { type ClusterStateEnum, type StateEnum } from 'qovery-typescript-axios'
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
  StoppedIcon,
  StoppingIcon,
  UnknownIcon,
  WarningIcon,
} from '../icon/icons-status'
import Tooltip from '../tooltip/tooltip'

export interface StatusChipProps {
  status: keyof typeof StateEnum | keyof typeof RunningState | keyof typeof ClusterStateEnum | undefined
  appendTooltipMessage?: string
  className?: string
}

export function StatusChip(props: StatusChipProps) {
  const { status, className = '', appendTooltipMessage = '' } = props

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
    .with('DEPLOYED', 'RUNNING', 'COMPLETED', () => <DeployedIcon />)
    .with('RESTARTED', () => <RestartedIcon />)
    // spinner
    .with('QUEUED', 'DELETE_QUEUED', 'DEPLOYMENT_QUEUED', 'RESTART_QUEUED', 'STOP_QUEUED', () => <QueuedIcon />)
    .with('DEPLOYING', 'STARTING', () => <DeployingIcon />)
    .with('RESTARTING', () => <RestartingIcon />)
    .with('BUILDING', () => <BuildingIcon />)
    .with('STOPPING', () => <StoppingIcon />)
    .with('CANCELING', () => <CancelingIcon />)
    .with('DELETING', () => <DeletingIcon />)
    // stopped
    .with('STOPPED', () => <StoppedIcon />)
    .with('CANCELED', () => <CanceledIcon />)
    .with('DELETED', () => <DeletedIcon />)
    // unknow / error / warning
    .with('UNKNOWN', () => <UnknownIcon />)
    .with('BUILD_ERROR', () => <BuildErrorIcon />)
    .with('WARNING', () => <WarningIcon />)
    .with('DEPLOYMENT_ERROR', 'STOP_ERROR', 'DELETE_ERROR', 'RESTART_ERROR', 'ERROR', 'INVALID_CREDENTIALS', () => (
      <ErrorIcon />
    ))
    .exhaustive()

  return (
    <Tooltip content={tooltipContent}>
      <div className={className}>{icon}</div>
    </Tooltip>
  )
}

export default StatusChip
