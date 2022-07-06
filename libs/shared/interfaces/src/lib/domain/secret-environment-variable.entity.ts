import { Secret } from 'qovery-typescript-axios'

export interface SecretEnvironmentVariableEntity extends Secret {
  variable_type: 'secret' | 'public'
}
