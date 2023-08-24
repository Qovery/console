// eslint-disable-next-line @nx/enforce-module-boundaries
import { type RunningState } from '@qovery/shared/enums'

export interface ServiceRunningStatus {
  id: string
  state: RunningState
  pods: {
    name: string
    state: RunningState
    restart_count: number
    state_message: string
  }[]
}
