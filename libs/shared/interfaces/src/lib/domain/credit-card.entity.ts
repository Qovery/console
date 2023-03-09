import { CreditCard as CreditCardApi } from 'qovery-typescript-axios'

export interface CreditCard extends CreditCardApi {
  brand: string
}
