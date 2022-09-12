import {
  ApplicationEntity,
  ContainerApplicationEntity,
  DatabaseEntity,
  GitApplicationEntity,
} from '@console/shared/interfaces'
import { ServiceTypeEnum } from '../service-type.enum'

export const getServiceType = (data?: ApplicationEntity | DatabaseEntity) => {
  let currentType = ServiceTypeEnum.APPLICATION

  if (!data) return currentType

  if ((data as ContainerApplicationEntity).image_name) {
    currentType = ServiceTypeEnum.CONTAINER
  }

  if (!(data as GitApplicationEntity).build_mode && !(data as ContainerApplicationEntity).image_name) {
    currentType = ServiceTypeEnum.DATABASE
  }

  return currentType
}
