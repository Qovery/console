import { StateEnum } from 'qovery-typescript-axios'

export const isDeployAvailable = (status: StateEnum): boolean => {
  return (
    (status === StateEnum.READY || status === StateEnum.STOPPED || status === StateEnum.DELETED) &&
    !isCancelBuildAvailable(status)
  )
}

export const isRestartAvailable = (status: StateEnum): boolean => {
  return (
    (status === StateEnum.BUILDING ||
      status === StateEnum.QUEUED ||
      status === StateEnum.STOP_QUEUED ||
      status === StateEnum.DELETE_QUEUED ||
      status === StateEnum.DEPLOYING ||
      status === StateEnum.DEPLOYMENT_ERROR ||
      status === StateEnum.DEPLOYED ||
      status === StateEnum.STOPPING ||
      status === StateEnum.STOP_ERROR ||
      status === StateEnum.DELETING ||
      status === StateEnum.DELETE_ERROR ||
      status === StateEnum.RUNNING ||
      status === StateEnum.DEPLOYMENT_QUEUED ||
      status === StateEnum.CANCELED) &&
    !isCancelBuildAvailable(status)
  )
}

export const isStopAvailable = (status: StateEnum): boolean => {
  return (
    (status === StateEnum.BUILDING ||
      status === StateEnum.QUEUED ||
      status === StateEnum.STOP_QUEUED ||
      status === StateEnum.DELETE_QUEUED ||
      status === StateEnum.DEPLOYING ||
      status === StateEnum.DEPLOYED ||
      status === StateEnum.DELETING ||
      status === StateEnum.RUNNING ||
      status === StateEnum.DEPLOYMENT_ERROR ||
      status === StateEnum.DEPLOYMENT_QUEUED ||
      status === StateEnum.STOP_ERROR ||
      status === StateEnum.CANCELED) &&
    !isCancelBuildAvailable(status)
  )
}

export const isRollbackAvailable = (status: StateEnum): boolean => {
  return (
    status === StateEnum.DEPLOYMENT_ERROR ||
    status === StateEnum.STOP_ERROR ||
    status === StateEnum.STOPPED ||
    status === StateEnum.DELETE_ERROR ||
    status === StateEnum.DELETED ||
    status === StateEnum.RUNNING
  )
}

export const isDeleteAvailable = (status: StateEnum): boolean => {
  return (
    status === StateEnum.READY ||
    status === StateEnum.DEPLOYMENT_ERROR ||
    status === StateEnum.STOPPING ||
    status === StateEnum.STOP_ERROR ||
    status === StateEnum.STOPPED ||
    status === StateEnum.DELETE_ERROR ||
    status === StateEnum.RUNNING ||
    status === StateEnum.CANCELED
  )
}

export const isUpdateAvailable = (status: StateEnum): boolean => {
  return (
    status === StateEnum.DEPLOYMENT_ERROR ||
    status === StateEnum.STOP_ERROR ||
    status === StateEnum.STOPPED ||
    status === StateEnum.DELETE_ERROR ||
    status === StateEnum.DELETED ||
    status === StateEnum.RUNNING
  )
}

export const isCancelBuildAvailable = (status: StateEnum): boolean => {
  return status === StateEnum.BUILDING || status === StateEnum.DEPLOYING || status === StateEnum.DEPLOYMENT_QUEUED
}

export const isAvailable = (status: StateEnum): boolean => {
  return (
    status === StateEnum.RUNNING ||
    status === StateEnum.READY ||
    status === StateEnum.QUEUED ||
    status === StateEnum.BUILDING ||
    status === StateEnum.DEPLOYED
  )
}

export const isStop = (status: StateEnum): boolean => {
  return status === StateEnum.STOPPED || status === StateEnum.STOP_QUEUED
}

export const isWarning = (status: StateEnum): boolean => {
  return (
    status === StateEnum.DELETE_QUEUED ||
    status === StateEnum.STOP_ERROR ||
    status === StateEnum.DELETING ||
    status === StateEnum.DELETE_ERROR ||
    status === StateEnum.DELETED ||
    status === StateEnum.DEPLOYMENT_QUEUED ||
    status === StateEnum.DEPLOYMENT_ERROR
  )
}

export const isRunning = (status: StateEnum): boolean => {
  return status === StateEnum.DEPLOYING || status === StateEnum.STOPPING
}

export const getStatusClusterMessage = (status?: StateEnum, isAlreadyDeployed?: boolean): string => {
  switch (status) {
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
    case StateEnum.STOP_ERROR:
      return 'Pause error'
    case StateEnum.STOPPING:
      return 'Pausing...'
    case StateEnum.STOPPED:
      return 'Paused'
    // case StateEnum.RUNNING_ERROR:
    //   return 'Error'
    case StateEnum.DELETE_QUEUED:
      return 'Deletion queued'
    case StateEnum.DELETING:
      return 'Deleting...'
    case StateEnum.DELETE_ERROR:
      return 'Deletion error'
    case StateEnum.READY:
    case StateEnum.DELETED:
    case StateEnum.RUNNING:
    default:
      return ''
  }
}
