import {
  type ApplicationGitRepository,
  type BaseJobResponseAllOfSource,
  type BaseJobResponseAllOfSourceOneOf,
  type BaseJobResponseAllOfSourceOneOf1,
  type ContainerSource,
  type HelmResponseAllOfSource,
  type HelmResponseAllOfSourceOneOf,
  type HelmResponseAllOfSourceOneOf1,
} from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  type ApplicationEntity,
  type ContainerApplicationEntity,
  type DatabaseEntity,
  type GitApplicationEntity,
  type JobApplicationEntity,
} from '@qovery/shared/interfaces'
import { ServiceTypeEnum } from '../service-type.enum'

export const getServiceType = (data: ApplicationEntity | DatabaseEntity) => {
  let currentType: ServiceTypeEnum

  const isJob = (data as JobApplicationEntity)?.max_nb_restart !== undefined

  if ((data as ContainerApplicationEntity)?.image_name) {
    currentType = ServiceTypeEnum.CONTAINER
  } else if (
    !(data as GitApplicationEntity)?.build_mode &&
    !(data as ContainerApplicationEntity)?.image_name &&
    !('values_override' in data) &&
    !isJob
  ) {
    currentType = ServiceTypeEnum.DATABASE
  } else if (isJob && 'schedule' in data && 'cronjob' in (data.schedule ?? {})) {
    currentType = ServiceTypeEnum.CRON_JOB
  } else if (isJob && 'schedule' in data && !('cronjob' in (data.schedule ?? {}))) {
    currentType = ServiceTypeEnum.LIFECYCLE_JOB
  } else if ('values_override' in data) {
    currentType = ServiceTypeEnum.HELM
  } else {
    currentType = ServiceTypeEnum.APPLICATION
  }

  return currentType
}

// Job
export const isJob = (data?: ApplicationEntity | keyof typeof ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return (
      getServiceType(data as ApplicationEntity) === ServiceTypeEnum.CRON_JOB ||
      getServiceType(data as ApplicationEntity) === ServiceTypeEnum.LIFECYCLE_JOB
    )
  } else {
    return data === ServiceTypeEnum.CRON_JOB || data === ServiceTypeEnum.LIFECYCLE_JOB || data === ServiceTypeEnum.JOB
  }
}

export const isCronJob = (data?: ApplicationEntity | keyof typeof ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.CRON_JOB
  } else {
    return data === ServiceTypeEnum.CRON_JOB
  }
}
export const isLifeCycleJob = (data?: ApplicationEntity | keyof typeof ServiceTypeEnum) => {
  if (data as ApplicationEntity) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.LIFECYCLE_JOB
  } else {
    return data === ServiceTypeEnum.LIFECYCLE_JOB
  }
}

export function isHelmGitSource(source?: HelmResponseAllOfSource): source is HelmResponseAllOfSourceOneOf {
  return !!source && 'git' in source
}

export function isHelmRepositorySource(source?: HelmResponseAllOfSource): source is HelmResponseAllOfSourceOneOf1 {
  return !!source && 'repository' in source
}

export function isJobGitSource(source?: BaseJobResponseAllOfSource): source is BaseJobResponseAllOfSourceOneOf1 {
  return !!source && 'docker' in source
}

export function isJobContainerSource(source?: BaseJobResponseAllOfSource): source is BaseJobResponseAllOfSourceOneOf {
  return !!source && 'image' in source
}

export const isGitJob = (
  data: ApplicationEntity
): data is ApplicationEntity & {
  source: { docker: { dockerfile_path?: string | null; git_repository: ApplicationGitRepository } }
} => {
  return data && 'docker' in (data.source ?? {})
}

export const isContainerJob = (
  data: ApplicationEntity
): data is ApplicationEntity & {
  source: { image: ContainerSource }
} => {
  return data && 'image' in (data.source ?? {})
}

// Container
export const isContainer = (data?: ApplicationEntity | keyof typeof ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.CONTAINER
  } else {
    return data === ServiceTypeEnum.CONTAINER
  }
}
// Application
export const isApplication = (data?: ApplicationEntity | keyof typeof ServiceTypeEnum) => {
  if (data && (data as ApplicationEntity).id) {
    return getServiceType(data as ApplicationEntity) === ServiceTypeEnum.APPLICATION
  } else {
    return data === ServiceTypeEnum.APPLICATION
  }
}
// Database
export const isDatabase = (data?: DatabaseEntity | keyof typeof ServiceTypeEnum) => {
  if ((data as DatabaseEntity).id) {
    return getServiceType(data as DatabaseEntity) === ServiceTypeEnum.DATABASE
  } else {
    return data === ServiceTypeEnum.DATABASE
  }
}
