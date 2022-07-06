import { DefaultEntityState } from './default-entity-state.interface'
import { SecretEnvironmentVariableEntity } from '../domain/secret-environment-variable.entity'

export interface SecretEnvironmentVariablesState extends DefaultEntityState<SecretEnvironmentVariableEntity> {
  joinApplicationSecretEnvironmentVariable: Record<string, string[]>
}
