import { CloudVendorEnum, type Cluster } from 'qovery-typescript-axios'

export const isAWSCluster = (cluster: Cluster | undefined) => cluster?.cloud_provider === CloudVendorEnum.AWS
