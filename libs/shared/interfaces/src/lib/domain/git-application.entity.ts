import { type Application } from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'
import { type AdvancedSettings } from './advanced-settings.interface'

export interface GitApplicationEntity extends Application {
  advanced_settings?: {
    loadingStatus: LoadingStatus
    current_settings?: AdvancedSettings
  }
  default_advanced_settings?: {
    loadingStatus: LoadingStatus
    default_settings?: AdvancedSettings
  }
}
