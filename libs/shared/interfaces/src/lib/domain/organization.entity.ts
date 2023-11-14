import { type CloudProviderEnum, type ClusterCredentials } from 'qovery-typescript-axios'

export interface ClusterCredentialsEntity extends ClusterCredentials {
  cloudProvider: CloudProviderEnum
}
