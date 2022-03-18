import { PlanEnum } from '@console/shared/enums'
import { Price } from './price.interface'
export interface Plan {
  name: PlanEnum
  title: string
  text: string
  price?: number
  listPrice: Price[]
}
