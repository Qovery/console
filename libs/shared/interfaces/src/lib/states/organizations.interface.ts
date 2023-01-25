import { AvailableContainerRegistryResponse } from 'qovery-typescript-axios'
import { OrganizationEntity } from '../domain/organization.entity'
import { LoadingStatus } from '../types/loading-status.type'
import { DefaultEntityState } from './default-entity-state.interface'

export interface OrganizationState extends DefaultEntityState<OrganizationEntity> {
  availableContainerRegistries: {
    loadingStatus: LoadingStatus
    items?: AvailableContainerRegistryResponse[]
  }
}
