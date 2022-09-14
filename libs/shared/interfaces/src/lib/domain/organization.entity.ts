import { ContainerRegistryResponse, Organization } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface OrganizationEntity extends Organization {
  containerRegistries?: {
    loadingStatus: LoadingStatus
    items?: ContainerRegistryResponse[]
  }
}
