import { type Application, type Commit, type DeploymentHistoryApplication, type Link } from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'
import { type AdvancedSettings } from './advanced-settings.interface'

export interface GitApplicationEntity extends Application {
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
  commits?: {
    loadingStatus: LoadingStatus
    items?: Commit[]
  }
  deployments?: {
    loadingStatus: LoadingStatus
    items: DeploymentHistoryApplication[]
  }
  advanced_settings?: {
    loadingStatus: LoadingStatus
    current_settings?: AdvancedSettings
  }
  default_advanced_settings?: {
    loadingStatus: LoadingStatus
    default_settings?: AdvancedSettings
  }
}
