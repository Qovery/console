import { ContainerRegistryResponse, Organization, OrganizationCustomRole } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface OrganizationEntity extends Organization {
  containerRegistries?: {
    loadingStatus: LoadingStatus
    items?: ContainerRegistryResponse[]
  }
  customRoles?: {
    loadingStatus: LoadingStatus
    items?: OrganizationCustomRole[]
  }
}
