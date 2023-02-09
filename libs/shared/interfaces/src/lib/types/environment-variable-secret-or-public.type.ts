import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { EnvironmentVariableEntity } from '../domain/environment-variable.entity'
import { SecretEnvironmentVariableEntity } from '../domain/secret-environment-variable.entity'

export interface EnvironmentVariableSecretOrPublic
  extends Partial<EnvironmentVariableEntity>,
    Partial<SecretEnvironmentVariableEntity> {
  id: string
  scope: APIVariableScopeEnum
  created_at: string
  value?: string
  service_name: 'secret' | 'public'
}
