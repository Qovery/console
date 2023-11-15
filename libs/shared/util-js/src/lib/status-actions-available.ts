import { ClusterStateEnum, StateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { RunningState } from '@qovery/shared/enums'

export const isDeployAvailable = (status: keyof typeof StateEnum | keyof typeof ClusterStateEnum): boolean => {
  return match(status)
    .with('READY', 'STOPPED', 'DELETED', () => !isCancelBuildAvailable(status))
    .otherwise(() => false)
}

export const isRestartAvailable = (runningStatus: keyof typeof RunningState, status: StateEnum): boolean => {
  return (
    (runningStatus === RunningState.RUNNING || runningStatus === RunningState.DEPLOYED) && isRedeployAvailable(status)
  )
}

export const isRedeployAvailable = (status: keyof typeof StateEnum | keyof typeof ClusterStateEnum): boolean => {
  return match(status)
    .with(
      'BUILDING',
      'BUILD_ERROR',
      'QUEUED',
      'STOP_QUEUED',
      'DELETE_QUEUED',
      'DEPLOYING',
      'DEPLOYMENT_ERROR',
      'RESTART_ERROR',
      'DEPLOYED',
      'RESTARTED',
      'STOPPING',
      'STOP_ERROR',
      'DELETING',
      'DELETE_ERROR',
      'DEPLOYMENT_QUEUED',
      'RESTART_QUEUED',
      'CANCELED',
      'INVALID_CREDENTIALS',
      () => !isCancelBuildAvailable(status)
    )
    .otherwise(() => false)
}

export const isStopAvailable = (status: keyof typeof StateEnum | keyof typeof ClusterStateEnum): boolean => {
  return match(status)
    .with(
      'BUILDING',
      'BUILD_ERROR',
      'QUEUED',
      'STOP_QUEUED',
      'DELETE_QUEUED',
      'DEPLOYED',
      'RESTARTED',
      'DEPLOYMENT_ERROR',
      'RESTART_ERROR',
      'DEPLOYMENT_QUEUED',
      'RESTART_QUEUED',
      'STOP_ERROR',
      'CANCELED',
      () => !isCancelBuildAvailable(status)
    )
    .otherwise(() => false)
}

export const isDeleteAvailable = (status: keyof typeof StateEnum | keyof typeof ClusterStateEnum): boolean => {
  return match(status)
    .with(
      'READY',
      'BUILD_ERROR',
      'DEPLOYMENT_ERROR',
      'RESTART_ERROR',
      'STOP_ERROR',
      'DELETE_ERROR',
      'STOPPED',
      'DEPLOYED',
      'RESTARTED',
      'CANCELED',
      'DELETED',
      'INVALID_CREDENTIALS',
      () => true
    )
    .otherwise(() => false)
}

export const isUpdateAvailable = (status: keyof typeof StateEnum | keyof typeof ClusterStateEnum): boolean => {
  return match(status)
    .with(
      'DEPLOYMENT_ERROR',
      'BUILD_ERROR',
      'STOP_ERROR',
      'DELETE_ERROR',
      'STOPPED',
      'DELETED',
      'RESTARTED',
      'DEPLOYED',
      () => true
    )
    .otherwise(() => false)
}

export const isCancelBuildAvailable = (status: keyof typeof StateEnum | keyof typeof ClusterStateEnum): boolean => {
  return match(status)
    .with(
      'BUILDING',
      'DEPLOYING',
      'RESTARTING',
      'STOPPING',
      'DELETING',
      'STOP_QUEUED',
      'DEPLOYMENT_QUEUED',
      'RESTART_QUEUED',
      'DELETE_QUEUED',
      () => true
    )
    .otherwise(() => false)
}

// TODO: differentiate service state from cluster state
export const getStatusClusterMessage = (status?: StateEnum | ClusterStateEnum, isAlreadyDeployed?: boolean): string => {
  switch (status) {
    case ClusterStateEnum.INVALID_CREDENTIALS:
      return 'Invalid credentials'
    case StateEnum.DEPLOYMENT_QUEUED:
      if (!isAlreadyDeployed) return 'Installation queued'
      else return 'Update queued'
    case StateEnum.DEPLOYMENT_ERROR:
      if (!isAlreadyDeployed) return 'Installation error'
      else return 'Update error'
    case StateEnum.DEPLOYING:
      if (!isAlreadyDeployed) return 'Installing...'
      else return 'Updating...'
    case StateEnum.QUEUED:
      if (!isAlreadyDeployed) return 'Installing queued'
      else return 'Updating queued'
    case StateEnum.STOP_QUEUED:
      return 'Pause queued'
    case StateEnum.BUILD_ERROR:
      return 'Build error'
    case StateEnum.STOP_ERROR:
      return 'Pause error'
    case StateEnum.STOPPING:
      return 'Pausing...'
    case StateEnum.STOPPED:
      return 'Paused'
    case StateEnum.DELETE_QUEUED:
      return 'Deletion queued'
    case StateEnum.DELETING:
      return 'Deleting...'
    case StateEnum.DELETE_ERROR:
      return 'Deletion error'
    case StateEnum.READY:
    case StateEnum.DELETED:
    case StateEnum.DEPLOYED:
    default:
      return ''
  }
}
