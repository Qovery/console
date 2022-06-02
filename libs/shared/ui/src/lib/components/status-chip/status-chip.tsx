import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { IconEnum } from '@console/shared/enums'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { Icon, Tooltip } from '@console/shared/ui'

export interface StatusChipProps {
  status: GlobalDeploymentStatus | undefined
  className?: string
}

export function StatusChip(props: StatusChipProps) {
  const { status, className = '' } = props

  function showReadyIcon(): boolean {
    switch (status) {
      case GlobalDeploymentStatus.READY:
        return true
      case GlobalDeploymentStatus.BUILT:
        return true
      case GlobalDeploymentStatus.DEPLOYED:
        return true
      case GlobalDeploymentStatus.RUNNING:
        return true
      default:
        return false
    }
  }

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
      case GlobalDeploymentStatus.STOP_QUEUED:
        return true
      case GlobalDeploymentStatus.QUEUED:
        return true
      case GlobalDeploymentStatus.DELETE_QUEUED:
        return true
      default:
        return false
    }
  }

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

  function showStoppedIcon(): boolean {
    switch (status) {
      case GlobalDeploymentStatus.STOPPED:
        return true
      default:
        return false
    }
  }

  function showDeletedIcon(): boolean {
    switch (status) {
      case GlobalDeploymentStatus.DELETED:
        return true
      default:
        return false
    }
  }

  console.log

  return (
    <Tooltip content={<span>{upperCaseFirstLetter(status?.replace('_', ' ').toLowerCase())}</span>}>
      <div data-testid="status-chip" className={className}>
        {showReadyIcon() && (
          <Icon className="min-w-[14px]" width="0.875rem" viewBox="0 0 14 14" name={IconEnum.SUCCESS} />
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
