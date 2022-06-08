import { ServiceRunningStatus } from '../domain/service-running-status.interface'
import { RunningStatus } from '@console/shared/enums'

export interface WebsocketRunningStatusInterface {
  applications?: ServiceRunningStatus[]
  database?: ServiceRunningStatus[]
  id: string
  project_id: string
  state: RunningStatus
}
