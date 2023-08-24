import { type DatabaseEntity } from '../domain/database.entity'
import { type LoadingStatus } from '../types/loading-status.type'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface DatabasesState extends DefaultEntityState<DatabaseEntity> {
  joinEnvDatabase: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
}
