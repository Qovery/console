import { type Database, type DeploymentHistoryDatabase } from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface DatabaseEntity extends Database {
  description?: string
  deployments?: {
    loadingStatus: LoadingStatus
    items: DeploymentHistoryDatabase[]
  }
}
