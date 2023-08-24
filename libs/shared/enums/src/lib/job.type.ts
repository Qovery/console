import { type ServiceTypeEnum } from './service-type.enum'

export type JobType = ServiceTypeEnum.CRON_JOB | ServiceTypeEnum.LIFECYCLE_JOB
