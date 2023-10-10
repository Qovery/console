import {
  type Cluster,
  type ClusterCloudProviderInfo,
  type ClusterLogs,
  type ClusterRoutingTableResultsInner,
  type ClusterStatusGet,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../..'
import { type AdvancedSettings } from './advanced-settings.interface'

export interface ClusterEntity extends Cluster {
  logs?: {
    loadingStatus: LoadingStatus
    items?: ClusterLogs[]
  }
  extendedStatus?: {
    loadingStatus: LoadingStatus
    status?: ClusterStatusGet
  }
  advanced_settings?: {
    loadingStatus: LoadingStatus
    current_settings?: AdvancedSettings
  }
  default_advanced_settings?: {
    loadingStatus: LoadingStatus
    default_settings?: AdvancedSettings
  }
  cloudProviderInfo?: {
    loadingStatus: LoadingStatus
    item?: ClusterCloudProviderInfo
  }
  routingTable?: {
    loadingStatus: LoadingStatus
    items?: ClusterRoutingTableResultsInner[]
  }
}
