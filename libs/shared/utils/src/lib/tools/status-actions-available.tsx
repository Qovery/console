import { GlobalDeploymentStatus } from 'qovery-typescript-axios'

export const isDeployAvailable = (status: GlobalDeploymentStatus): boolean => {
  return (
    status === GlobalDeploymentStatus.READY ||
    status === GlobalDeploymentStatus.STOPPED ||
    status === GlobalDeploymentStatus.DELETED
  )
}

export const isRestartAvailable = (status: GlobalDeploymentStatus): boolean => {
  return (
    status === GlobalDeploymentStatus.BUILDING ||
    status === GlobalDeploymentStatus.QUEUED ||
    status === GlobalDeploymentStatus.STOP_QUEUED ||
    status === GlobalDeploymentStatus.DELETE_QUEUED ||
    status === GlobalDeploymentStatus.BUILD_ERROR ||
    status === GlobalDeploymentStatus.BUILT ||
    status === GlobalDeploymentStatus.DEPLOYING ||
    status === GlobalDeploymentStatus.DEPLOYMENT_ERROR ||
    status === GlobalDeploymentStatus.DEPLOYED ||
    status === GlobalDeploymentStatus.STOPPING ||
    status === GlobalDeploymentStatus.STOP_ERROR ||
    status === GlobalDeploymentStatus.DELETING ||
    status === GlobalDeploymentStatus.DELETE_ERROR ||
    status === GlobalDeploymentStatus.RUNNING ||
    status === GlobalDeploymentStatus.RUNNING_ERROR
  )
}

export const isStopAvailable = (status: GlobalDeploymentStatus): boolean => {
  return (
    status === GlobalDeploymentStatus.BUILDING ||
    status === GlobalDeploymentStatus.QUEUED ||
    status === GlobalDeploymentStatus.STOP_QUEUED ||
    status === GlobalDeploymentStatus.DELETE_QUEUED ||
    status === GlobalDeploymentStatus.BUILT ||
    status === GlobalDeploymentStatus.DEPLOYING ||
    status === GlobalDeploymentStatus.DEPLOYED ||
    status === GlobalDeploymentStatus.DELETING ||
    status === GlobalDeploymentStatus.RUNNING ||
    status === GlobalDeploymentStatus.DEPLOYMENT_ERROR ||
    status === GlobalDeploymentStatus.RUNNING_ERROR
  )
}

export const isRollbackAvailable = (status: GlobalDeploymentStatus): boolean => {
  return (
    status === GlobalDeploymentStatus.BUILD_ERROR ||
    status === GlobalDeploymentStatus.DEPLOYMENT_ERROR ||
    status === GlobalDeploymentStatus.STOP_ERROR ||
    status === GlobalDeploymentStatus.STOPPED ||
    status === GlobalDeploymentStatus.DELETE_ERROR ||
    status === GlobalDeploymentStatus.DELETED ||
    status === GlobalDeploymentStatus.RUNNING ||
    status === GlobalDeploymentStatus.RUNNING_ERROR
  )
}

export const isDeleteAvailable = (status: GlobalDeploymentStatus): boolean => {
  return (
    status === GlobalDeploymentStatus.READY ||
    status === GlobalDeploymentStatus.BUILD_ERROR ||
    status === GlobalDeploymentStatus.DEPLOYMENT_ERROR ||
    status === GlobalDeploymentStatus.STOPPING ||
    status === GlobalDeploymentStatus.STOP_ERROR ||
    status === GlobalDeploymentStatus.STOPPED ||
    status === GlobalDeploymentStatus.DELETE_ERROR ||
    status === GlobalDeploymentStatus.RUNNING ||
    status === GlobalDeploymentStatus.RUNNING_ERROR
  )
}

export const isUpdateAvailable = (status: GlobalDeploymentStatus): boolean => {
  return (
    status === GlobalDeploymentStatus.BUILD_ERROR ||
    status === GlobalDeploymentStatus.DEPLOYMENT_ERROR ||
    status === GlobalDeploymentStatus.STOP_ERROR ||
    status === GlobalDeploymentStatus.STOPPED ||
    status === GlobalDeploymentStatus.DELETE_ERROR ||
    status === GlobalDeploymentStatus.DELETED ||
    status === GlobalDeploymentStatus.RUNNING ||
    status === GlobalDeploymentStatus.RUNNING_ERROR
  )
}

export const isCancelBuildAvailable = (status: GlobalDeploymentStatus): boolean => {
  return status === GlobalDeploymentStatus.BUILDING || status === GlobalDeploymentStatus.DEPLOYING
}
