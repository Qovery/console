import {
  ApplicationEntity,
  ContainerApplicationEntity,
  DatabaseEntity,
  GitApplicationEntity,
} from '@console/shared/interfaces'
import { ServicesEnum } from '../services.enum'

export const getServiceType = (data?: ApplicationEntity | DatabaseEntity) => {
  let currentType = ServicesEnum.APPLICATION

  if (!data) return currentType

  if ((data as ContainerApplicationEntity).image_name) {
    currentType = ServicesEnum.CONTAINER
  }

  if (!(data as GitApplicationEntity).build_mode && !(data as ContainerApplicationEntity).image_name) {
    currentType = ServicesEnum.DATABASE
  }

  return currentType
}
