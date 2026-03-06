import { type Status } from 'qovery-typescript-axios'
import { type ServiceActionDetailsDto, type ServiceStateDto } from 'qovery-ws-typescript-axios'

export type ServiceRunningStatus = {
  triggered_action: ServiceActionDetailsDto | undefined
  state: ServiceStateDto | 'UNKNOWN' | undefined
  stateLabel: string | undefined
}

export type ServiceStatuses = {
  runningStatus: ServiceRunningStatus
  deploymentStatus?: Status & {
    stateLabel: string | undefined
  }
}
