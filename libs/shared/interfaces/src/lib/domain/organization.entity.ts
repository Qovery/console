import {
  type CloudProviderEnum,
  type ClusterCredentials,
  type InviteMember,
  type Member,
  type Organization,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface ClusterCredentialsEntity extends ClusterCredentials {
  cloudProvider: CloudProviderEnum
}

export interface OrganizationEntity extends Organization {
  members?: {
    loadingStatus: LoadingStatus
    items?: Member[]
  }
  inviteMembers?: {
    loadingStatus: LoadingStatus
    items?: InviteMember[]
  }
}
