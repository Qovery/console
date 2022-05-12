import { Organization } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface OrganizationState extends DefaultEntityState<Organization> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error' | undefined
  error: string | null | undefined
}
