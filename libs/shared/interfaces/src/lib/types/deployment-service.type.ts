import { Commit, DeploymentHistoryStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'

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
