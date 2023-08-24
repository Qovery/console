import {
  type BillingInfo,
  type CloudProviderEnum,
  type ClusterCredentials,
  type ContainerRegistryResponse,
  type InviteMember,
  type Invoice,
  type Member,
  type Organization,
  type OrganizationApiToken,
  type OrganizationAvailableRole,
  type OrganizationCurrentCost,
  type OrganizationCustomRole,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

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
  invoices?: {
    loadingStatus: LoadingStatus
    items?: Invoice[]
  }
  apiTokens?: {
    loadingStatus: LoadingStatus
    items?: OrganizationApiToken[]
  }
}
