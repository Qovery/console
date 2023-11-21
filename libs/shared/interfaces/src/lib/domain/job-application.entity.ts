import {
  type CronJobResponse,
  type CronJobResponseAllOfSchedule,
  type LifecycleJobResponse,
  type LifecycleJobResponseAllOfSchedule,
} from 'qovery-typescript-axios'
import { type LoadingStatus } from '../types/loading-status.type'
import { type AdvancedSettings } from './advanced-settings.interface'

export type JobResponseAllOfSchedule = LifecycleJobResponseAllOfSchedule | CronJobResponseAllOfSchedule

export type CronJob = CronJobResponse & {
  job_type: 'CRON'
}

export type LifecycleJob = LifecycleJobResponse & {
  job_type: 'LIFECYCLE'
}

export type JobApplicationEntity = {
  advanced_settings?: {
    loadingStatus: LoadingStatus
    current_settings?: AdvancedSettings
  }
  default_advanced_settings?: {
    loadingStatus: LoadingStatus
    default_settings?: AdvancedSettings
  }
} & (LifecycleJob | CronJob)
