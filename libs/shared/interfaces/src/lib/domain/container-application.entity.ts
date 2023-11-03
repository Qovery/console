import { type ContainerResponse, type Link } from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'

export interface ContainerApplicationEntity extends ContainerResponse {
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
}
