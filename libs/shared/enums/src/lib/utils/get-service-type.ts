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

  const isJob = (data as JobApplicationEntity).max_nb_restart

  if ((data as ContainerApplicationEntity).image_name) {
    currentType = ServiceTypeEnum.CONTAINER
  } else if (!(data as GitApplicationEntity).build_mode && !(data as ContainerApplicationEntity).image_name && !isJob) {
    currentType = ServiceTypeEnum.DATABASE
  } else if (isJob && !(data as JobApplicationEntity).schedule) {
    currentType = ServiceTypeEnum.CRON_JOB
  } else if (isJob && (data as JobApplicationEntity).schedule) {
    currentType = ServiceTypeEnum.LIFECYCLE_JOB
  } else {
    currentType = ServiceTypeEnum.APPLICATION
  }

  return currentType
}
