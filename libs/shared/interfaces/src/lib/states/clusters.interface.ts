import { Cluster } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ClustersState extends DefaultEntityState<Cluster> {
  joinOrganizationClusters: Record<string, string[]>
}
