import { type Commit, type DeploymentHistoryStatusEnum, type StateEnum } from 'qovery-typescript-axios'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type ServiceTypeEnum } from '@qovery/shared/enums'

export interface DeploymentService {
  id: string
  created_at: string
  updated_at?: string
  name?: string
  status?: DeploymentHistoryStatusEnum | StateEnum
  commit?: Commit
  type?: ServiceTypeEnum
  execution_id?: string
}
