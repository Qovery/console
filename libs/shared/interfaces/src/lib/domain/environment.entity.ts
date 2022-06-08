import { DeploymentHistoryEnvironment, Environment, Status } from 'qovery-typescript-axios'

export interface EnvironmentEntity extends Environment {
  status?: Status
  deployments?: DeploymentHistoryEnvironment[]
}
