import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { IconEnum } from '@console/shared/enums'
import { Icon } from '@console/shared/ui'

export interface StatusLabelProps {
  status: GlobalDeploymentStatus | undefined
  className?: string
}

export function StatusLabel(props: StatusLabelProps) {
  const { status, className = '' } = props

  function showProgressIcon(): boolean {
    switch (status) {
      case GlobalDeploymentStatus.BUILDING:
        return true
      case GlobalDeploymentStatus.STOPPING:
        return true
      case GlobalDeploymentStatus.DEPLOYING:
        return true
      case GlobalDeploymentStatus.DELETING:
        return true
      default:
        return false
    }
  }

  // function showSpinnerIcon(): boolean {
  //   switch (status) {
  //     case GlobalDeploymentStatus.STOP_QUEUED:
  //       return true
  //     case GlobalDeploymentStatus.QUEUED:
  //       return true
  //     case GlobalDeploymentStatus.DELETE_QUEUED:
  //       return true
  //     default:
  //       return false
  //   }
  // }

  function showErrorIcon(): boolean {
    switch (status) {
      case GlobalDeploymentStatus.BUILD_ERROR:
        return true
      case GlobalDeploymentStatus.DEPLOYMENT_ERROR:
        return true
      case GlobalDeploymentStatus.STOP_ERROR:
        return true
      case GlobalDeploymentStatus.DELETE_ERROR:
        return true
      case GlobalDeploymentStatus.RUNNING_ERROR:
        return true
      default:
        return false
    }
  }

  return (
    <span
      className={`flex items-center px-2.5 h-7 border border-element-lighter-500 rounded-full text-text-500 text-xs font-medium truncate ${className}`}
      data-testid="status-label"
    >
      {showProgressIcon() && <Icon name={IconEnum.PROGRESS} width="12" viewBox="0 0 12 12" className="mr-2" />}
      {upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}
      {showErrorIcon() && <Icon name={IconEnum.ERROR} width="12" viewBox="0 0 14 14" className="ml-1" />}
    </span>
  )
}

export default StatusLabel
