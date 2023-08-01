// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RunningStatus } from '@qovery/shared/enums'

export interface ServiceRunningStatus {
  id: string
  state: RunningStatus
  pods: {
    name: string
    state: RunningStatus
    restart_count: 0
    state_message: string
  }[]
}
