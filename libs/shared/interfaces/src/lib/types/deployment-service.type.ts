import { type DeploymentHistoryService } from 'qovery-typescript-axios'
import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface DeploymentService extends DeploymentHistoryService {
  execution_id: string
  type: ServiceTypeEnum
}
