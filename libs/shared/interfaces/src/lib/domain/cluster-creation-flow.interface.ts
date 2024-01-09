import { type CloudProviderEnum } from 'qovery-typescript-axios'

export interface ClusterGeneralData {
  name: string
  description?: string
  production?: boolean
  cloud_provider: CloudProviderEnum
  region: string
  credentials: string
  credentials_name: string
  installation_type: 'MANAGED' | 'SELF_MANAGED'
}

export interface ClusterKubeconfigData {
  file_name: string
  file_content: string
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
  [id: string]: {
    id: string
    title: string
    value: boolean
    extendedValue?: string
  }
}
