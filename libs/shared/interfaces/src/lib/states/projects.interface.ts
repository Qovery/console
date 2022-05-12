import { Project } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ProjectsState extends DefaultEntityState<Project> {
  joinOrganizationProject: Record<string, string[]>
}
