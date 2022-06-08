import { Database, Status } from 'qovery-typescript-axios'

export interface DatabaseEntity extends Database {
  status?: Status
}
