import { CustomDomain } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface CustomDomainsState extends DefaultEntityState<CustomDomain> {
  joinApplicationCustomDomain: Record<string, string[]>
}
