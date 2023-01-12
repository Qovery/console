import { DeploymentHistoryStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { IconEnum, RunningStatus } from '@qovery/shared/enums'
import { renameStatus, upperCaseFirstLetter } from '@qovery/shared/utils'
import Icon from '../icon/icon'
import Tooltip from '../tooltip/tooltip'

export interface StatusChipProps {
  status: StateEnum | RunningStatus | DeploymentHistoryStatusEnum | undefined
  appendTooltipMessage?: string
  className?: string
  isRunningStatus?: boolean
  mustRenameStatus?: boolean
}

export function StatusChip(props: StatusChipProps) {
  const { status, className = '', appendTooltipMessage = '', mustRenameStatus } = props

  function showRunningIcon(): boolean {
    switch (status) {
      case StateEnum.DEPLOYED:
      case StateEnum.RUNNING:
      case RunningStatus.COMPLETED:
        return true
      default:
        return false
    }
  }

  function showReadyIcon(): boolean {
    switch (status) {
      case StateEnum.READY:
        return true
      default:
        return false
    }
  }

  function showProgressIcon(): boolean {
    switch (status) {
      case StateEnum.BUILDING:
        return true
      case StateEnum.DEPLOYING:
        return true
      case StateEnum.DELETING:
        return true
      case StateEnum.STOP_QUEUED:
        return true
      case StateEnum.QUEUED:
        return true
      case StateEnum.DELETE_QUEUED:
        return true
      case StateEnum.DEPLOYMENT_QUEUED:
        return true
      default:
        return false
    }
  }

  function showErrorIcon(): boolean {
    switch (status) {
      case StateEnum.DEPLOYMENT_ERROR:
      case StateEnum.STOP_ERROR:
      case StateEnum.DELETE_ERROR:
      case RunningStatus.ERROR:
        return true
      default:
        return false
    }
  }

  function showStoppedIcon(): boolean {
    switch (status) {
      case StateEnum.STOPPED:
      case RunningStatus.UNKNOWN:
        return true
      case StateEnum.CANCELED:
        return true
      default:
        return false
    }
  }

  function showDeletedIcon(): boolean {
    switch (status) {
      case StateEnum.DELETED:
        return true
      default:
        return false
    }
  }

  function showSpinner(): boolean {
    switch (status) {
      case RunningStatus.STOPPING:
      case RunningStatus.STARTING:
        return true
      default:
        return false
    }
  }

  function showWarning(): boolean {
    switch (status) {
      case RunningStatus.WARNING:
        return true
      default:
        return false
    }
  }

  return (
    <Tooltip
      content={
        <span>
          {status === StateEnum.RUNNING && mustRenameStatus
            ? renameStatus(status)
            : upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}
          {appendTooltipMessage ? ' - ' + appendTooltipMessage : ''}
        </span>
      }
    >
      <div data-testid="status-chip" className={className}>
        {showRunningIcon() && <Icon width="0.875rem" viewBox="0 0 14 14" name={IconEnum.SUCCESS} />}
        {showWarning() && <Icon width="0.875rem" viewBox="0 0 14 14" pathColor="#F4C004" name={IconEnum.SUCCESS} />}
        {showReadyIcon() && (
          <Icon
            className="min-w-[14px]"
            width="0.875rem"
            viewBox="0 0 14 14"
            pathColor="#A0AFC5"
            name={IconEnum.SUCCESS}
          />
        )}
        {showProgressIcon() && <Icon width="0.875rem" viewBox="0 0 14 14" name={IconEnum.PROGRESS} />}
        {showErrorIcon() && <Icon width="0.875rem" viewBox="0 0 14 14" name={IconEnum.ERROR} />}
        {showStoppedIcon() && <Icon width="0.875rem" viewBox="0 0 14 14" name={IconEnum.PAUSE} />}
        {showDeletedIcon() && <Icon width="0.875rem" viewBox="0 0 14 14" name={IconEnum.DELETE} />}
        {showSpinner() && (
          <svg
            role="status"
            className="w-3.5 h-3.5 text-gray-200 animate-spin fill-brand-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        )}
      </div>
    </Tooltip>
  )
}

export default StatusChip
