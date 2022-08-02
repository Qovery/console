import { Secret } from 'qovery-typescript-axios'
import { DetectNewRowInterface } from '../common/detect-new-row.interface'
import { EnvironmentVariableServiceTypeEnum } from 'qovery-typescript-axios/api'

export interface SecretEnvironmentVariableEntity extends Secret, DetectNewRowInterface {
  variable_type: 'secret' | 'public'
  service_name?: string

  // todo: remove these two properties when api doc is updated
  service_id?: string
  service_type?: EnvironmentVariableServiceTypeEnum
}
