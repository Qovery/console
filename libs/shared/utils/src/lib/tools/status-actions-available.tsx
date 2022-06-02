import { StateEnum } from 'qovery-typescript-axios'

export const isDeployAvailable = (status: StateEnum): boolean => {
  return status === StateEnum.READY || status === StateEnum.STOPPED || status === StateEnum.DELETED
}

export const isRestartAvailable = (status: StateEnum): boolean => {
  return (
    status === StateEnum.BUILDING ||
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
    status === StateEnum.DEPLOYMENT_QUEUED
  )
}

export const isStopAvailable = (status: StateEnum): boolean => {
  return (
    status === StateEnum.BUILDING ||
    status === StateEnum.QUEUED ||
    status === StateEnum.STOP_QUEUED ||
    status === StateEnum.DELETE_QUEUED ||
    status === StateEnum.DEPLOYING ||
    status === StateEnum.DEPLOYED ||
    status === StateEnum.DELETING ||
    status === StateEnum.RUNNING ||
    status === StateEnum.DEPLOYMENT_ERROR ||
    status === StateEnum.DEPLOYMENT_QUEUED
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
    status === StateEnum.RUNNING
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
  return status === StateEnum.BUILDING || status === StateEnum.DEPLOYING
}
