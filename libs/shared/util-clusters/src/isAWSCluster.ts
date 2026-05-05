import { CloudVendorEnum, type Cluster } from 'qovery-typescript-axios'

export const isAwsCluster = (cluster: Cluster | undefined) => cluster?.cloud_provider === CloudVendorEnum.AWS
