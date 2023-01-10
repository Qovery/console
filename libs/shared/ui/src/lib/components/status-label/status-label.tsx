import { StateEnum } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { renameStatus, upperCaseFirstLetter } from '@qovery/shared/utils'
import Icon from '../icon/icon'

export interface StatusLabelProps {
  status: StateEnum | undefined
  className?: string
}

export function StatusLabel(props: StatusLabelProps) {
  const { status, className = '' } = props

  function hideStatusLabel(): boolean {
    switch (status) {
      case StateEnum.READY:
        return true
      case StateEnum.RUNNING:
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
      default:
        return false
    }
  }

  // function showSpinnerIcon(): boolean {
  //   switch (status) {
  //     case StateEnum.STOP_QUEUED:
  //       return true
  //     case StateEnum.QUEUED:
  //       return true
  //     case StateEnum.DELETE_QUEUED:
  //       return true
  //     default:
  //       return false
  //   }
  // }

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

  if (hideStatusLabel()) {
    return null
  }

  return (
    <span
      className={`flex items-center px-3 h-8 border border-element-lighter-500 rounded-full text-text-500 text-xs font-medium truncate ${className}`}
      data-testid="status-label"
    >
      {showProgressIcon() && <Icon name={IconEnum.PROGRESS} width="12" viewBox="0 0 12 12" className="mr-2 mt-[1px]" />}
      {status !== StateEnum.RUNNING
        ? upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())
        : renameStatus(status)}
      {showErrorIcon() && <Icon name={IconEnum.ERROR} width="12" viewBox="0 0 14 14" className="ml-2 mt-[1px]" />}
    </span>
  )
}

export default StatusLabel
