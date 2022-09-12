import { ContainerResponse, DeploymentHistoryApplication, Instance, Link, Status } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'
import { ServiceRunningStatus } from './service-running-status.interface'

export interface ContainerApplicationEntity extends ContainerResponse {
  status?: Status
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
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
