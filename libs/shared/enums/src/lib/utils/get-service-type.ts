import {
  ApplicationEntity,
  ContainerApplicationEntity,
  DatabaseEntity,
  GitApplicationEntity,
  JobApplicationEntity,
} from '@qovery/shared/interfaces'
import { ServiceTypeEnum } from '../service-type.enum'

export const getServiceType = (data: ApplicationEntity | DatabaseEntity) => {
  let currentType: ServiceTypeEnum

  const isJob = (data as JobApplicationEntity).max_nb_restart !== undefined

  if ((data as ContainerApplicationEntity).image_name) {
    currentType = ServiceTypeEnum.CONTAINER
  } else if (!(data as GitApplicationEntity).build_mode && !(data as ContainerApplicationEntity).image_name && !isJob) {
    currentType = ServiceTypeEnum.DATABASE
  } else if (isJob && (data as JobApplicationEntity).schedule?.cronjob) {
    currentType = ServiceTypeEnum.CRON_JOB
  } else if (isJob && !(data as JobApplicationEntity).schedule?.cronjob) {
    currentType = ServiceTypeEnum.LIFECYCLE_JOB
  } else {
    currentType = ServiceTypeEnum.APPLICATION
  }

  return currentType
}

// Job
export const isJob = (data?: ApplicationEntity | ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return (
      getServiceType(data as ApplicationEntity) === ServiceTypeEnum.CRON_JOB ||
      getServiceType(data as ApplicationEntity) === ServiceTypeEnum.LIFECYCLE_JOB
    )
  } else {
    return data === ServiceTypeEnum.CRON_JOB || data === ServiceTypeEnum.LIFECYCLE_JOB || data === ServiceTypeEnum.JOB
  }
}

export const isCronJob = (data?: ApplicationEntity | ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.CRON_JOB
  } else {
    return data === ServiceTypeEnum.CRON_JOB
  }
}
export const isLifeCycleJob = (data?: ApplicationEntity | ServiceTypeEnum) => {
  if (data as ApplicationEntity) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.LIFECYCLE_JOB
  } else {
    return data === ServiceTypeEnum.LIFECYCLE_JOB
  }
}

export const isGitJob = (data: ApplicationEntity) => {
  return data && Boolean((data as JobApplicationEntity).source?.docker)
}

export const isContainerJob = (data: ApplicationEntity) => {
  return data && Boolean((data as JobApplicationEntity).source?.image)
}

// Container
export const isContainer = (data?: ApplicationEntity | ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.CONTAINER
  } else {
    return data === ServiceTypeEnum.CONTAINER
  }
}
// Application
export const isApplication = (data?: ApplicationEntity | ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.APPLICATION
  } else {
    return data === ServiceTypeEnum.APPLICATION
  }
}
// Database
export const isDatabase = (data?: DatabaseEntity | ServiceTypeEnum) => {
  if ((data as DatabaseEntity).id) {
    return getServiceType(data as DatabaseEntity) === ServiceTypeEnum.DATABASE
  } else {
    return data === ServiceTypeEnum.DATABASE
  }
}
