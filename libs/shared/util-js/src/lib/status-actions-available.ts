import { type ClusterStateEnum, type StateEnum } from 'qovery-typescript-axios'
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
