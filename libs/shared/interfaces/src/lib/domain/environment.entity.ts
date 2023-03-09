import {
  DatabaseConfiguration,
  DeploymentHistoryEnvironment,
  DeploymentStageResponse,
  Environment,
  EnvironmentDeploymentRule,
  Status,
} from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface EnvironmentEntity extends Environment {
  status?: Status
  deployments?: DeploymentHistoryEnvironment[]
  deploymentRules?: EnvironmentDeploymentRule
  databaseConfigurations?: {
    loadingStatus: LoadingStatus
    data?: DatabaseConfiguration[]
  }
  deploymentStage?: {
    loadingStatus: LoadingStatus
    items?: DeploymentStageResponse[]
  }
}
