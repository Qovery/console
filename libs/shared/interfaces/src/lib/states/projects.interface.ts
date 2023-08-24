import { type Project } from 'qovery-typescript-axios'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface ProjectsState extends DefaultEntityState<Project> {
  joinOrganizationProject: Record<string, string[]>
}
