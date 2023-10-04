import { type ServiceStateDto } from 'qovery-ws-typescript-axios'

export interface ServiceRunningStatus {
  id: string
  state: keyof typeof ServiceStateDto
  pods: {
    name: string
    state: keyof typeof ServiceStateDto
    restart_count: number
    state_message: string
  }[]
}
