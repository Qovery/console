import { RunningStatus } from '@qovery/shared/enums'
import { ServiceRunningStatus } from '../domain/service-running-status.interface'

export interface WebsocketRunningStatusInterface {
  applications?: ServiceRunningStatus[]
  databases?: ServiceRunningStatus[]
  id: string
  project_id: string
  state: RunningStatus
}
