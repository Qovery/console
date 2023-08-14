// eslint-disable-next-line @nx/enforce-module-boundaries
import { RunningStatus } from '@qovery/shared/enums'

export interface ServiceRunningStatus {
  id: string
  state: RunningStatus
  pods: {
    name: string
    state: RunningStatus
    restart_count: number
    state_message: string
  }[]
}
