import { EnvironmentVariable } from 'qovery-typescript-axios'
import { DetectNewRowInterface } from '../common/detect-new-row.interface'

export interface EnvironmentVariableEntity extends EnvironmentVariable, DetectNewRowInterface {
  variable_type: 'secret' | 'public'
  service_name: string
}
