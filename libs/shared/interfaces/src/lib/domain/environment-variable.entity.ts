import { EnvironmentVariable } from 'qovery-typescript-axios'

export interface EnvironmentVariableEntity extends EnvironmentVariable {
  variable_type: 'secret' | 'public'
  service_name: string
}
