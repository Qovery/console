import { EnvironmentVariableEntity } from '../domain/environment-variable.entity'
import { SecretEnvironmentVariableEntity } from '../domain/secret-environment-variable.entity'

export type EnvironmentVariableSecretOrPublic = EnvironmentVariableEntity | SecretEnvironmentVariableEntity
