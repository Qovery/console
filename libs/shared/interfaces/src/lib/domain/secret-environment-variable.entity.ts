import { EnvironmentVariable } from 'qovery-typescript-axios'

export interface SecretEnvironmentVariableEntity extends EnvironmentVariable {
  variable_type: 'secret' | 'public'
}
