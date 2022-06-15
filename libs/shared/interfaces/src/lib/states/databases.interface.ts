import { DatabaseEntity } from '../domain/database.entity'
import { DefaultEntityState } from './default-entity-state.interface'
import { LoadingStatus } from '../types/loading-status.type'

export interface DatabasesState extends DefaultEntityState<DatabaseEntity> {
  joinEnvDatabase: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
}
