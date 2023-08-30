import {
  type ContainerResponse,
  type DeploymentHistoryApplication,
  type Instance,
  type Link,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface ContainerApplicationEntity extends ContainerResponse {
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
  instances?: {
    loadingStatus: LoadingStatus
    items?: Instance[]
  }
  deployments?: {
    loadingStatus: LoadingStatus
    items: DeploymentHistoryApplication[]
  }
}
