import {
  type CloudProviderEnum,
  type ClusterFeatureKarpenterParameters,
  type CpuArchitectureEnum,
} from 'qovery-typescript-axios'

export interface ClusterGeneralData {
  name: string
  description?: string
  production?: boolean
  cloud_provider: CloudProviderEnum
  region: string
  credentials: string
  credentials_name: string
  installation_type: 'MANAGED' | 'SELF_MANAGED' | 'LOCAL_DEMO'
}

export interface ClusterKubeconfigData {
  file_name: string
  file_content: string
  file_size: number
}

export interface KarpenterData extends ClusterFeatureKarpenterParameters {
  enabled: boolean
}

export interface ClusterResourcesData {
  cluster_type: string
  instance_type: string
  nodes: [number, number]
  disk_size: number
  karpenter?: KarpenterData
}

export interface ClusterRemoteData {
  ssh_key: string
}

export type Subnets = {
  A: string
  B: string
  C: string
}

export type ClusterFeaturesData = {
  vpc_mode: 'DEFAULT' | 'EXISTING_VPC'
  aws_existing_vpc?: {
    aws_vpc_eks_id: string
    eks_subnets?: Subnets[]
    eks_karpenter_fargate_subnets?: Subnets[]
    mongodb_subnets?: Subnets[]
    rds_subnets?: Subnets[]
    redis_subnets?: Subnets[]
  }
  gcp_existing_vpc?: {
    vpc_name: string
    vpc_project_id?: string
    ip_range_services_name?: string
    ip_range_pods_name?: string
    additional_ip_range_pods_names?: string
    subnetwork_name?: string
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
