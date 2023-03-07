import {
  BillingInfo,
  CloudProviderEnum,
  ClusterCredentials,
  ContainerRegistryResponse,
  InviteMember,
  Member,
  Organization,
  OrganizationAvailableRole,
  OrganizationCurrentCost,
  OrganizationCustomRole,
} from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface ClusterCredentialsEntity extends ClusterCredentials {
  cloudProvider: CloudProviderEnum
}

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
    loadingStatus: LoadingStatus
    items?: ClusterCredentialsEntity[]
  }
  billingInfos?: {
    loadingStatus: LoadingStatus
    value?: BillingInfo
  }
  currentCost?: {
    loadingStatus: LoadingStatus
    value?: OrganizationCurrentCost
  }
}
