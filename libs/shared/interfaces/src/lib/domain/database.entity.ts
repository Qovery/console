import {
  Credentials,
  Database,
  DatabaseCurrentMetric,
  DeploymentHistoryDatabase,
  Status,
} from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'
import { ServiceRunningStatus } from './service-running-status.interface'

/* @TODO Deletes this when API doc is updated */
export interface DatabaseCredentials extends Credentials {
  host: string
  port: number
}

export interface DatabaseEntity extends Database {
  description?: string
  /**
   * @deprecated This should be not be used, use dedicated hooks instead `useDeploymentStatus`
   */
  status?: Status
  /**
   * @deprecated This should be not be used, use dedicated hooks instead `useRunningStatus`
   */
  running_status?: ServiceRunningStatus
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
