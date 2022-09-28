import {
  ApplicationEntity,
  ContainerApplicationEntity,
  DatabaseEntity,
  GitApplicationEntity,
} from '@qovery/shared/interfaces'
import { ServiceTypeEnum } from '../service-type.enum'

export const getServiceType = (data: ApplicationEntity | DatabaseEntity) => {
  let currentType: ServiceTypeEnum

  if ((data as ContainerApplicationEntity).image_name) {
    currentType = ServiceTypeEnum.CONTAINER
  } else if (!(data as GitApplicationEntity).build_mode && !(data as ContainerApplicationEntity).image_name) {
    currentType = ServiceTypeEnum.DATABASE
  } else {
    currentType = ServiceTypeEnum.APPLICATION
  }

  return currentType
}
