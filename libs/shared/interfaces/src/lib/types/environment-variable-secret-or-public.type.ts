import { type APIVariableScopeEnum } from 'qovery-typescript-axios'
import { type EnvironmentVariableEntity } from '../domain/environment-variable.entity'
import { type SecretEnvironmentVariableEntity } from '../domain/secret-environment-variable.entity'

export interface EnvironmentVariableSecretOrPublic
  extends Partial<EnvironmentVariableEntity>,
    Partial<SecretEnvironmentVariableEntity> {
  id: string
  scope: APIVariableScopeEnum
  created_at: string
  value?: string
  service_name: string
  variable_kind: 'public' | 'secret'
}
