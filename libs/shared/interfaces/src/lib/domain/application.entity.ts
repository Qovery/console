import { type ContainerApplicationEntity } from './container-application.entity'
import { type GitApplicationEntity } from './git-application.entity'
import { type JobApplicationEntity } from './job-application.entity'

// We created this aggregation of interfaces because we decided to treat Git and Container and Jobs as the same object: an Application
// - It allows us to drastically reduce the amount of time we have to cast the object in one of the three interface
// - We omit certain values because they don't have the same type in the different interfaces
// - We also redeclare the most used properties that we are sure the three interfaces will have any matter what (id, name, etc.)
export type ApplicationEntity = Partial<ContainerApplicationEntity> &
  Omit<Partial<GitApplicationEntity>, 'description'> &
  Partial<JobApplicationEntity> & {
    id: string
    created_at: string
    name: string
  }
