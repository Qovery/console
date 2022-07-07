import { Secret } from 'qovery-typescript-axios'
import { DetectNewRowInterface } from '../common/detect-new-row.interface'

export interface SecretEnvironmentVariableEntity extends Secret, DetectNewRowInterface {
  variable_type: 'secret' | 'public'
  service_name?: string
}
