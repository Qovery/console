import { Cluster, ClusterLogs, ClusterStatusGet } from 'qovery-typescript-axios'
import { LoadingStatus } from '../..'

export interface ClusterEntity extends Cluster {
  logs?: {
    loadingStatus: LoadingStatus
    items?: ClusterLogs[]
  }
  extendedStatus?: {
    loadingStatus: LoadingStatus
    status?: ClusterStatusGet
  }
}
