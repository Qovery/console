import { type CloudProviderEnum, type ClusterCredentials, type Organization } from 'qovery-typescript-axios'

export interface ClusterCredentialsEntity extends ClusterCredentials {
  cloudProvider: CloudProviderEnum
}

export interface OrganizationEntity extends Organization {}
