import { ContainerResponse, Link, Status } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface ContainerApplicationEntity extends ContainerResponse {
  status?: Status
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
}
