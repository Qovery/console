import { StateEnum } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { upperCaseFirstLetter } from '@qovery/shared/utils'
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
      case StateEnum.DEPLOYED:
        return true
      default:
        return false
    }
  }

  function showProgressIcon(): boolean {
    switch (status) {
      case StateEnum.STOPPING:
      case StateEnum.DEPLOYING:
      case StateEnum.DELETING:
      case StateEnum.RESTARTING:
        return true
      default:
        return false
    }
  }

  function showBuildProgressIcon(): boolean {
    switch (status) {
      case StateEnum.BUILDING:
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
      case StateEnum.RESTART_ERROR:
        return true
      default:
        return false
    }
  }

  function showBuildErrorIcon(): boolean {
    switch (status) {
      case StateEnum.BUILD_ERROR:
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
      {showProgressIcon() && (
        <Icon name={IconEnum.PROGRESS} pathColor="#43C9D5" width="12" viewBox="0 0 12 12" className="mr-2 mt-[1px]" />
      )}
      {showBuildProgressIcon() && (
        <Icon width="0.875rem" pathColor="#43C9D5" className="mr-2 mt-[1px]" name={IconEnum.HAMMER} />
      )}
      {upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}
      {showErrorIcon() && <Icon name={IconEnum.ERROR} width="12" viewBox="0 0 14 14" className="ml-2 mt-[1px]" />}
      {showBuildErrorIcon() && (
        <Icon width="0.875rem" pathColor="#FF6240" name={IconEnum.HAMMER} className="ml-2 mt-[1px]" />
      )}
    </span>
  )
}

export default StatusLabel
