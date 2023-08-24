import { type SecretEnvironmentVariableEntity } from '../domain/secret-environment-variable.entity'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface SecretEnvironmentVariablesState extends DefaultEntityState<SecretEnvironmentVariableEntity> {
  joinApplicationSecretEnvironmentVariable: Record<string, string[]>
}
