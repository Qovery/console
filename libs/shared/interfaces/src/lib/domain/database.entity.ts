import {
  type Credentials,
  type Database,
  type DatabaseCurrentMetric,
  type DeploymentHistoryDatabase,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

/* @TODO Deletes this when API doc is updated */
export interface DatabaseCredentials extends Credentials {
  host: string
  port: number
}

export interface DatabaseEntity extends Database {
  description?: string
  metrics?: {
    loadingStatus: LoadingStatus
    data?: DatabaseCurrentMetric
  }
  deployments?: {
    loadingStatus: LoadingStatus
    items: DeploymentHistoryDatabase[]
  }
  credentials?: {
    loadingStatus: LoadingStatus
    items: DatabaseCredentials
  }
}
