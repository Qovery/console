import { CloudVendorEnum, type Cluster } from 'qovery-typescript-axios'

export const isGcpCluster = (cluster: Cluster | undefined) => cluster?.cloud_provider === CloudVendorEnum.GCP
