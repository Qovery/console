import { type AvailableContainerRegistryResponse } from 'qovery-typescript-axios'
import { type OrganizationEntity } from '../domain/organization.entity'
import { type LoadingStatus } from '../types/loading-status.type'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface OrganizationState extends DefaultEntityState<OrganizationEntity> {
  availableContainerRegistries: {
    loadingStatus: LoadingStatus
    items?: AvailableContainerRegistryResponse[]
  }
}
