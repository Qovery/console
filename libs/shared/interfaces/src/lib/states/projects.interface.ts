import { Project } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface ProjectsState extends DefaultEntityState<Project> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
  joinOrganizationProject: Record<string, string[]>
}
