import { CloudProvider, CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { ClusterInstanceTypeResponseListResults } from 'qovery-typescript-axios/api'
import { LoadingStatus } from '../types/loading-status.type'
import { AdvancedSettings } from './../domain/advanced-settings.interface'
import { ClusterEntity } from './../domain/cluster.entity'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ClustersState extends DefaultEntityState<ClusterEntity> {
  joinOrganizationClusters: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
  defaultClusterAdvancedSettings: {
    loadingStatus: LoadingStatus
    settings?: AdvancedSettings
  }
  cloudProvider: {
    loadingStatus: LoadingStatus
    items: CloudProvider[]
  }
  availableClusterTypes: {
    loadingStatus: LoadingStatus
    items: Record<CloudProviderEnum, Record<KubernetesEnum, Record<string, ClusterInstanceTypeResponseListResults[]>>>
  }
}
