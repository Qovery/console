import { ContainerApplicationEntity } from './container-application.entity'
import { GitApplicationEntity } from './git-application.entity'

export type ApplicationEntity = GitApplicationEntity | ContainerApplicationEntity
