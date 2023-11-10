import {
  type BillingInfo,
  type CloudProviderEnum,
  type ClusterCredentials,
  type InviteMember,
  type Invoice,
  type Member,
  type Organization,
  type OrganizationCurrentCost,
  type OrganizationCustomRole,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface ClusterCredentialsEntity extends ClusterCredentials {
  cloudProvider: CloudProviderEnum
}

export interface OrganizationEntity extends Organization {
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
}
