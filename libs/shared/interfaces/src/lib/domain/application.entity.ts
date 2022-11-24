import { ContainerApplicationEntity } from './container-application.entity'
import { GitApplicationEntity } from './git-application.entity'
import { JobApplicationEntity } from './job-application.entity'

export type GitContainerApplicationEntity = GitApplicationEntity | ContainerApplicationEntity
export type ApplicationEntity = GitApplicationEntity | ContainerApplicationEntity | JobApplicationEntity
