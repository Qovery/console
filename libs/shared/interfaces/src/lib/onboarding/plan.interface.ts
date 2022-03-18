import { Value } from '../common/value.interface'
import { Price } from './price.interface'

export interface Plan {
  name: string
  title: string
  text: string
  price?: number
  listPrice: Price[]
}
