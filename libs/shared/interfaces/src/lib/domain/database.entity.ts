import { Database, Status } from 'qovery-typescript-axios'
import { ServiceRunningStatus } from './service-running-status.interface'

export interface DatabaseEntity extends Database {
  status?: Status
  running_status?: ServiceRunningStatus
}
