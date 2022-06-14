import { DatabaseEntity } from '../domain/database.entity'
import { DefaultEntityState } from './default-entity-state.interface'

export interface DatabasesState extends DefaultEntityState<DatabaseEntity> {
  joinEnvDatabase: Record<string, string[]>
}
