import {
  type ContainerResponse,
  type DeploymentHistoryApplication,
  type Instance,
  type Link,
  type Status,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'
import { type ServiceRunningStatus } from './service-running-status.interface'

export interface ContainerApplicationEntity extends ContainerResponse {
  /**
   * @deprecated This should be not be used, use dedicated hooks instead `useDeploymentStatus`
   */
  status?: Status
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
  /**
   * @deprecated This should be not be used, use dedicated hooks instead `useRunningStatus`
   */
  running_status?: ServiceRunningStatus
  instances?: {
    loadingStatus: LoadingStatus
    items?: Instance[]
  }
  deployments?: {
    loadingStatus: LoadingStatus
    items: DeploymentHistoryApplication[]
  }
}
