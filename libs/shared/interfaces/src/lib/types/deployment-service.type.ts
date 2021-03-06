import { ServicesEnum } from '@console/shared/enums'
import { Commit, DeploymentHistoryStatusEnum, StateEnum } from 'qovery-typescript-axios'

export interface DeploymentService {
  id: string
  created_at: string
  updated_at?: string
  name?: string
  status?: DeploymentHistoryStatusEnum | StateEnum
  commit?: Commit
  type?: ServicesEnum
  execution_id?: string
}
