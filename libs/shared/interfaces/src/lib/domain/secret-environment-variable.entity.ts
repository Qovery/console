import { type Secret } from 'qovery-typescript-axios'
import { type DetectNewRowInterface } from '../common/detect-new-row.interface'

export interface SecretEnvironmentVariableEntity extends Secret, DetectNewRowInterface {
  variable_kind: 'public' | 'secret'
}
