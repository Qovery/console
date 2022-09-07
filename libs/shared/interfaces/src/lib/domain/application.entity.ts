import { ContainerApplicationEntity } from './container-application.entity'
import { GitApplicationEntity } from './git-application.entity'

export interface ApplicationEntity extends GitApplicationEntity, ContainerApplicationEntity {}
