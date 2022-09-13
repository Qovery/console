import { ContainerRegistryResponse, Organization } from 'qovery-typescript-axios'
import { LoadingStatus } from '@console/shared/interfaces'

export interface OrganizationEntity extends Organization {
  containerRegistries?: {
    loadingStatus: LoadingStatus
    items?: ContainerRegistryResponse[]
  }
}
