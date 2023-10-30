import { type ContainerResponse, type DeploymentHistoryApplication, type Link } from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface ContainerApplicationEntity extends ContainerResponse {
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
  deployments?: {
    loadingStatus: LoadingStatus
    items: DeploymentHistoryApplication[]
  }
}
