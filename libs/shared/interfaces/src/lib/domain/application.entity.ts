import { Application, Link, Status } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'

export interface ApplicationEntity extends Application {
  status?: Status
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
}
