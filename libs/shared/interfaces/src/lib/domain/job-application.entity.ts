import {
  type CronJobResponse,
  type CronJobResponseAllOfSchedule,
  type LifecycleJobResponse,
  type LifecycleJobResponseAllOfSchedule,
} from 'qovery-typescript-axios'

export type JobResponseAllOfSchedule = LifecycleJobResponseAllOfSchedule | CronJobResponseAllOfSchedule

export type CronJob = CronJobResponse & {
  job_type: 'CRON'
}

export type LifecycleJob = LifecycleJobResponse & {
  job_type: 'LIFECYCLE'
}

export type JobApplicationEntity = LifecycleJob | CronJob
