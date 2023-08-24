import { Commit, DeploymentHistoryApplication, Instance, JobResponse, Link, Status } from 'qovery-typescript-axios'
import { LoadingStatus } from '../types/loading-status.type'
import { AdvancedSettings } from './advanced-settings.interface'
import { ServiceRunningStatus } from './service-running-status.interface'

export interface JobApplicationEntity extends JobResponse {
  /**
   * @deprecated This should be not be used, use dedicated hooks instead `useDeploymentStatus`
   */
  status?: Status
  links?: {
    loadingStatus: LoadingStatus
    items?: Link[]
  }
  instances?: {
    loadingStatus: LoadingStatus
    items?: Instance[]
  }
  commits?: {
    loadingStatus: LoadingStatus
    items?: Commit[]
  }
  /**
   * @deprecated This should be not be used, use dedicated hooks instead `useRunningStatus`
   */
  running_status?: ServiceRunningStatus
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
