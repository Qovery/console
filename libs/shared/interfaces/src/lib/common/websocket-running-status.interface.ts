// eslint-disable-next-line @nx/enforce-module-boundaries
import { type RunningState } from '@qovery/shared/enums'
import { type ServiceRunningStatus } from '../domain/service-running-status.interface'

export interface WebsocketRunningStatusInterface {
  applications?: ServiceRunningStatus[]
  containers?: ServiceRunningStatus[]
  databases?: ServiceRunningStatus[]
  jobs?: ServiceRunningStatus[]
  id: string
  project_id: string
  state: RunningState
}
