import { type EnvironmentVariable } from 'qovery-typescript-axios'
import { type DetectNewRowInterface } from '../common/detect-new-row.interface'

export interface EnvironmentVariableEntity extends Partial<EnvironmentVariable>, Partial<DetectNewRowInterface> {
  variable_kind: 'public' | 'secret'
}
