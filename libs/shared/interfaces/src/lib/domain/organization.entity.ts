import { ContainerRegistryResponse, Organization } from 'qovery-typescript-axios'
import { LoadingStatus } from '@qovery/shared/interfaces'

export interface OrganizationEntity extends Organization {
  containerRegistries?: {
    loadingStatus: LoadingStatus
    items?: ContainerRegistryResponse[]
  }
}
