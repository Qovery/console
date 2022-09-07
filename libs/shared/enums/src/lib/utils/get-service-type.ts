import { ApplicationEntity, DatabaseEntity } from '@console/shared/interfaces'
import { ServicesEnum } from '../services.enum'

export const getServiceType = (data: ApplicationEntity | DatabaseEntity) => {
  let currentType = ServicesEnum.APPLICATION

  if ((data as ApplicationEntity).image_name) {
    currentType = ServicesEnum.CONTAINER
  }

  if (!(data as ApplicationEntity).build_mode && !(data as ApplicationEntity).image_name) {
    currentType = ServicesEnum.DATABASE
  }

  return currentType
}
