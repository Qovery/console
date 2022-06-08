import { DeploymentHistoryEnvironment, Environment, Status } from 'qovery-typescript-axios'
import { WebsocketRunningStatusInterface } from '../common/websocket-running-status.interface'

export interface EnvironmentEntity extends Environment {
  status?: Status
  deployments?: DeploymentHistoryEnvironment[]
  running_status?: WebsocketRunningStatusInterface
}
