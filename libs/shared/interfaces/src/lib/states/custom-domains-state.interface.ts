import { type CustomDomain } from 'qovery-typescript-axios'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface CustomDomainsState extends DefaultEntityState<CustomDomain> {
  joinApplicationCustomDomain: Record<string, string[]>
}
