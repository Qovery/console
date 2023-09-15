import { type DeploymentHistoryStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { RunningState } from '@qovery/shared/enums'
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
  UnknowIcon,
  WarningIcon,
} from '../icon/icons-status'
import Tooltip from '../tooltip/tooltip'

export interface StatusChipProps {
  status: keyof typeof StateEnum | keyof typeof RunningState | keyof typeof DeploymentHistoryStatusEnum | undefined
  appendTooltipMessage?: string
  className?: string
}

export function StatusChip(props: StatusChipProps) {
  const { status, className = '', appendTooltipMessage = '' } = props

  console.log('status', status)

  if (!status)
    return (
      <Tooltip content="Status not available">
        <div className={className}>
          <UnknowIcon />
        </div>
      </Tooltip>
    )

  function shouldShowStatus(status: StateEnum | RunningState, allowedStates: (StateEnum | RunningState)[]): boolean {
    return allowedStates.includes(status)
  }

  const stateMap = {
    showDeployed: [StateEnum.DEPLOYED, RunningState.RUNNING, StateEnum.READY, RunningState.COMPLETED],
    showError: [
      StateEnum.DEPLOYMENT_ERROR,
      StateEnum.STOP_ERROR,
      StateEnum.DELETE_ERROR,
      StateEnum.RESTART_ERROR,
      RunningState.ERROR,
    ],
    showQueued: [
      StateEnum.QUEUED,
      StateEnum.DELETE_QUEUED,
      StateEnum.DEPLOYMENT_QUEUED,
      StateEnum.RESTART_QUEUED,
      StateEnum.STOP_QUEUED,
    ],
    showDeploying: [StateEnum.DEPLOYING, RunningState.STARTING],
    showRestarted: [StateEnum.RESTARTED],
    showBuilding: [StateEnum.BUILDING],
    showRestarting: [StateEnum.RESTARTING],
    showStopping: [StateEnum.STOPPING],
    showCanceling: [StateEnum.CANCELING],
    showDeleting: [StateEnum.DELETING],
    showStopped: [StateEnum.STOPPED],
    showCanceled: [StateEnum.CANCELED],
    showDeleted: [StateEnum.DELETED],
    showUnknow: [RunningState.UNKNOWN],
    showBuildError: [StateEnum.BUILD_ERROR],
    showWarning: [RunningState.WARNING],
  }

  // success
  const showDeployed: boolean = shouldShowStatus(status as StateEnum, stateMap.showDeployed)
  const showRestarted: boolean = shouldShowStatus(status as StateEnum, stateMap.showRestarted)
  // spinner
  const showQueued: boolean = shouldShowStatus(status as StateEnum, stateMap.showQueued)
  const showBuilding: boolean = shouldShowStatus(status as StateEnum, stateMap.showBuilding)
  const showDeploying: boolean = shouldShowStatus(status as StateEnum, stateMap.showDeploying)
  const showRestarting: boolean = shouldShowStatus(status as StateEnum, stateMap.showRestarting)
  const showStopping: boolean = shouldShowStatus(status as StateEnum, stateMap.showStopping)
  const showCanceling: boolean = shouldShowStatus(status as StateEnum, stateMap.showCanceling)
  const showDeleting: boolean = shouldShowStatus(status as StateEnum, stateMap.showDeleting)
  // stopped
  const showStopped: boolean = shouldShowStatus(status as StateEnum, stateMap.showStopped)
  const showCanceled: boolean = shouldShowStatus(status as StateEnum, stateMap.showCanceled)
  const showDeleted: boolean = shouldShowStatus(status as StateEnum, stateMap.showDeleted)
  // unknow / error / warning
  const showUnknow: boolean = shouldShowStatus(status as StateEnum, stateMap.showUnknow)
  const showBuildError: boolean = shouldShowStatus(status as StateEnum, stateMap.showBuildError)
  const showError: boolean = shouldShowStatus(status as StateEnum, stateMap.showError)
  const showWarning: boolean = shouldShowStatus(status as RunningState, stateMap.showWarning)

  const tooltipContent = `${upperCaseFirstLetter(status.replace('_', ' '))} ${
    appendTooltipMessage ? ' - ' + appendTooltipMessage : ''
  }`

  return (
    <Tooltip content={tooltipContent}>
      <div className={className}>
        {showDeployed && <DeployedIcon />}
        {showRestarted && <RestartedIcon />}
        {showQueued && <QueuedIcon />}
        {showBuilding && <BuildingIcon />}
        {showDeploying && <DeployingIcon />}
        {showRestarting && <RestartingIcon />}
        {showStopping && <StoppingIcon />}
        {showCanceling && <CancelingIcon />}
        {showDeleting && <DeletingIcon />}
        {showStopped && <StoppedIcon />}
        {showCanceled && <CanceledIcon />}
        {showDeleted && <DeletedIcon />}
        {showUnknow && <UnknowIcon />}
        {showBuildError && <BuildErrorIcon />}
        {showError && <ErrorIcon />}
        {showWarning && <WarningIcon />}
      </div>
    </Tooltip>
  )
}

export default StatusChip
