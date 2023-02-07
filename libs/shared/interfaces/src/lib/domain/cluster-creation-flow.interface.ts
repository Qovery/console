import { CloudProviderEnum } from 'qovery-typescript-axios'

export interface ClusterGeneralData {
  name: string
  description?: string
  production?: boolean
  cloud_provider: CloudProviderEnum
  region: string
  credentials: string
}

export interface ClusterResourcesData {
  cluster_type: string
  instance_type: string
  nodes: [number, number]
  disk_size: number
}

export interface ClusterRemoteData {
  ssh_key: string
}

export interface ClusterFeaturesData {
  features: {
    id?: string | boolean
    value: string | boolean
  }[]
}
