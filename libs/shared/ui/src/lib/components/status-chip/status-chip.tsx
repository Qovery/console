import { StateEnum } from 'qovery-typescript-axios'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { Icon, Tooltip } from '@console/shared/ui'
import { IconEnum, RunningStatus } from '@console/shared/enums'

export interface StatusChipProps {
  status: StateEnum | RunningStatus | undefined
  appendTooltipMessage?: string
  className?: string
}

export function StatusChip(props: StatusChipProps) {
  const { status, className = '', appendTooltipMessage = '' } = props

  function showRunningIcon(): boolean {
    switch (status) {
      case StateEnum.DEPLOYED:
        return true
      case StateEnum.RUNNING:
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
      case StateEnum.STOPPING:
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
        return true
      case StateEnum.STOP_ERROR:
        return true
      case StateEnum.DELETE_ERROR:
        return true
      default:
        return false
    }
  }

  function showStoppedIcon(): boolean {
    switch (status) {
      case StateEnum.STOPPED:
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

  return (
    <Tooltip
      content={
        <span>
          {upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}
          {appendTooltipMessage ? ' - ' + appendTooltipMessage : ''}
        </span>
      }
    >
      <div data-testid="status-chip" className={className}>
        {showRunningIcon() && (
          <Icon className="min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.SUCCESS} />
        )}
        {showReadyIcon() && (
          <Icon
            className="min-w-[14px]"
            width="0.875rem"
            viewBox="0 0 14 14"
            pathColor="#A0AFC5"
            name={IconEnum.SUCCESS}
          />
        )}
        {showProgressIcon() && (
          <Icon
            className="min-w-[14px]"
            width="0.875rem"
            viewBox="0 0 14 14"
            name={IconEnum.SUCCESS}
            pathColor="#FF7C00"
          />
        )}
        {showErrorIcon() && (
          <Icon className="min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.ERROR} />
        )}
        {showStoppedIcon() && (
          <Icon className="min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.PAUSE} />
        )}
        {showDeletedIcon() && (
          <Icon className="min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.DELETE} />
        )}
      </div>
    </Tooltip>
  )
}

export default StatusChip
