import { DatabaseEntity } from '../domain/database.entity'
import { LoadingStatus } from '../types/loading-status.type'
import { DefaultEntityState } from './default-entity-state.interface'

export interface DatabasesState extends DefaultEntityState<DatabaseEntity> {
  joinEnvDatabase: Record<string, string[]>
  statusLoadingStatus: LoadingStatus
}
