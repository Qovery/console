import { type CreditCard } from '../domain/credit-card.entity'
import { type DefaultEntityState } from './default-entity-state.interface'

export interface CreditCardsState extends DefaultEntityState<CreditCard> {
  joinCreditCardsOrganization: Record<string, string[]>
}
