import { type EnvironmentVariableEntity } from '../domain/environment-variable.entity'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface EnvironmentVariablesState extends DefaultEntityState<EnvironmentVariableEntity> {
  joinApplicationEnvironmentVariable: Record<string, string[]>
}
