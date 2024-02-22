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
  file_size: number
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

type Subnets = {
  A: string
  B: string
  C: string
}

export type ClusterFeaturesData = {
  vpc_mode: 'DEFAULT' | 'EXISTING_VPC'
  aws_existing_vpc?: {
    aws_vpc_eks_id: string
    eks_subnets?: Subnets[]
    mongodb_subnets?: Subnets[]
    mysql_subnets?: Subnets[]
    postgresql_subnets?: Subnets[]
    redis_subnets?: Subnets[]
  }
  features: {
    [id: string]: {
      id: string
      title: string
      value: boolean
      extendedValue?: string
    }
  }
}
