import { OrganizationPrice } from './organization-price.interface'
import { PlanEnum } from 'qovery-typescript-axios'

export interface OrganizationPlan {
  name: PlanEnum
  title: string
  text: string
  price: number
  listPrice: OrganizationPrice[]
}
