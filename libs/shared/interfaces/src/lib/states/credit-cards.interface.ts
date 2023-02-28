import { CreditCard } from 'qovery-typescript-axios'
import { DefaultEntityState } from './default-entity-state.interface'

export interface CreditCardsState extends DefaultEntityState<CreditCard> {
  joinCreditCardsOrganization: Record<string, string[]>
}
