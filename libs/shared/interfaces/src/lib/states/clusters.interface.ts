import { type CloudProvider, type CloudProviderEnum, type KubernetesEnum } from 'qovery-typescript-axios'
import { type ClusterInstanceTypeResponseListResultsInner } from 'qovery-typescript-axios/api'
import { type LoadingStatus } from '../types/loading-status.type'
import { type AdvancedSettings } from './../domain/advanced-settings.interface'
import { type ClusterEntity } from './../domain/cluster.entity'
import { type DefaultEntityState } from './default-entity-state.interface'

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
    items: Record<
      CloudProviderEnum,
      Record<KubernetesEnum, Record<string, ClusterInstanceTypeResponseListResultsInner[]>>
    >
  }
}
