import {
  CloudProviderEnum,
  ClusterCredentials,
  ContainerRegistryResponse,
  InviteMember,
  Member,
  Organization,
  OrganizationAvailableRole,
  OrganizationCustomRole,
} from 'qovery-typescript-axios'
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
  members?: {
    loadingStatus: LoadingStatus
    items?: Member[]
  }
  inviteMembers?: {
    loadingStatus: LoadingStatus
    items?: InviteMember[]
  }
  availableRoles?: {
    loadingStatus: LoadingStatus
    items?: OrganizationAvailableRole[]
  }
  credentials?: {
    [CloudProviderEnum.AWS]?: {
      loadingStatus: LoadingStatus
      items?: ClusterCredentials[]
    }
    [CloudProviderEnum.SCW]?: {
      loadingStatus: LoadingStatus
      items?: ClusterCredentials[]
    }
    [CloudProviderEnum.DO]?: {
      loadingStatus: LoadingStatus
      items?: ClusterCredentials[]
    }
  }
}
