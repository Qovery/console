import { CloudVendorEnum, type Cluster } from 'qovery-typescript-axios'

export const isGCPCluster = (cluster: Cluster | undefined) => cluster?.cloud_provider === CloudVendorEnum.GCP
