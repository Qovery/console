import { OrganizationPlanType } from '../enums'
import { OrganizationPrice } from './organization-price.interface'

export interface OrganizationPlan {
  name: OrganizationPlanType
  title: string
  text: string
  price?: number
  listPrice: OrganizationPrice[]
}
