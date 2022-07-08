import { ClusterEntity } from './../domain/cluster.entity'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ClustersState extends DefaultEntityState<ClusterEntity> {
  joinOrganizationClusters: Record<string, string[]>
}
