import { DefaultEntityState } from './default-entity-state.interface'
import { EnvironmentVariableEntity } from '../domain/environment-variable.entity'

export interface EnvironmentVariablesState extends DefaultEntityState<EnvironmentVariableEntity> {
  joinApplicationEnvironmentVariable: Record<string, string[]>
}
